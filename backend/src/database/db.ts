import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

let db: Database | null = null;
const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.resolve(DB_DIR, 'hospital_finops.sqlite');

export async function getDb(): Promise<Database> {
  if (db) return db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
      return db;
    } catch (err) {
      console.warn('Could not read existing SQLite file, creating new database instance:', err);
    }
  }

  db = new SQL.Database();
  initializeSchema(db);
  saveDb(db);
  return db;
}

export function saveDb(database?: Database): void {
  const targetDb = database || db;
  if (!targetDb) return;
  try {
    const data = targetDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('Error saving SQLite database to disk:', err);
  }
}

export function query<T = any>(database: Database, sql: string, params: any[] = []): T[] {
  const stmt = database.prepare(sql);
  if (params && params.length > 0) {
    stmt.bind(params);
  }
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

export function queryOne<T = any>(database: Database, sql: string, params: any[] = []): T | null {
  const results = query<T>(database, sql, params);
  return results.length > 0 ? results[0] : null;
}

export function run(database: Database, sql: string, params: any[] = []): void {
  database.run(sql, params);
}

export function initializeSchema(database: Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS business_units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      lead_manager TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      business_unit_id INTEGER,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      product_id INTEGER,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS cloud_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      environment TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resource_id TEXT NOT NULL UNIQUE,
      cloud_account_id TEXT NOT NULL,
      service TEXT NOT NULL,
      region TEXT NOT NULL,
      usage_type TEXT
    );

    CREATE TABLE IF NOT EXISTS billing_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      billing_id TEXT NOT NULL UNIQUE,
      billing_date TEXT NOT NULL,
      cloud_provider TEXT NOT NULL,
      cloud_account_id TEXT NOT NULL,
      service TEXT NOT NULL,
      region TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      usage_type TEXT NOT NULL,
      cost REAL NOT NULL,
      currency TEXT NOT NULL,
      allocation_tag TEXT,
      product_id TEXT,
      feature_id TEXT,
      business_unit TEXT,
      billing_status TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS usage_telemetry (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telemetry_id TEXT NOT NULL UNIQUE,
      timestamp TEXT NOT NULL,
      cloud_account_id TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      product_id TEXT,
      feature_id TEXT,
      business_unit TEXT,
      usage_type TEXT NOT NULL,
      usage_quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      freshness_timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS allocation_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resource_id TEXT NOT NULL,
      cloud_account_id TEXT NOT NULL,
      business_unit TEXT NOT NULL,
      product_id TEXT NOT NULL,
      feature_id TEXT NOT NULL,
      allocation_status TEXT NOT NULL,
      tag_last_updated TEXT NOT NULL,
      tag_source TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id TEXT NOT NULL UNIQUE,
      date TEXT NOT NULL,
      business_unit TEXT NOT NULL,
      product_id TEXT NOT NULL,
      feature_id TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      activity_volume REAL NOT NULL,
      unit TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS allocation_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      allocation_id TEXT NOT NULL UNIQUE,
      billing_id TEXT NOT NULL,
      business_unit TEXT NOT NULL,
      product_id TEXT NOT NULL,
      feature_id TEXT NOT NULL,
      allocated_amount REAL NOT NULL,
      allocation_method TEXT NOT NULL,
      confidence TEXT NOT NULL,
      evidence_source TEXT NOT NULL,
      evidence_timestamp TEXT NOT NULL,
      allocation_status TEXT NOT NULL,
      reason TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      audit_id TEXT NOT NULL UNIQUE,
      timestamp TEXT NOT NULL,
      user TEXT NOT NULL,
      role TEXT NOT NULL,
      action TEXT NOT NULL,
      object_type TEXT NOT NULL,
      object_id TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      reason TEXT,
      status TEXT NOT NULL,
      impact_amount REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS change_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      change_id TEXT NOT NULL UNIQUE,
      requester TEXT NOT NULL,
      role TEXT NOT NULL,
      product TEXT NOT NULL,
      business_unit TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      old_allocation TEXT NOT NULL,
      proposed_allocation TEXT NOT NULL,
      cost_impact REAL NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL,
      reviewer TEXT,
      reviewed_at TEXT,
      previous_state_json TEXT
    );

    CREATE TABLE IF NOT EXISTS experiments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_at TEXT NOT NULL,
      baseline_total_cost REAL NOT NULL,
      baseline_allocated_cost REAL NOT NULL,
      baseline_unallocated_cost REAL NOT NULL,
      baseline_allocation_pct REAL NOT NULL,
      treatment_total_cost REAL NOT NULL,
      treatment_allocated_cost REAL NOT NULL,
      treatment_unallocated_cost REAL NOT NULL,
      treatment_allocation_pct REAL NOT NULL,
      target_allocation_pct REAL NOT NULL DEFAULT 85.0,
      pp_improvement REAL NOT NULL,
      rel_improvement_pct REAL NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS data_validation_errors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id TEXT NOT NULL,
      source TEXT NOT NULL,
      field TEXT,
      issue_type TEXT NOT NULL,
      reason TEXT NOT NULL,
      affected_cost REAL DEFAULT 0,
      timestamp TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_billing_resource ON billing_records(resource_id);
    CREATE INDEX IF NOT EXISTS idx_billing_bu ON billing_records(business_unit);
    CREATE INDEX IF NOT EXISTS idx_billing_product ON billing_records(product_id);
    CREATE INDEX IF NOT EXISTS idx_alloc_results_billing ON allocation_results(billing_id);
    CREATE INDEX IF NOT EXISTS idx_alloc_tags_resource ON allocation_tags(resource_id);
    CREATE INDEX IF NOT EXISTS idx_telemetry_resource ON usage_telemetry(resource_id);
  `);
}
