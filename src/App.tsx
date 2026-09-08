import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.js';
import { TopBar } from './components/TopBar.js';
import { DemoRole } from './types/index.js';
import { api } from './services/api.js';

// Pages
import { DashboardPage } from './pages/DashboardPage.js';
import { CostAllocationPage } from './pages/CostAllocationPage.js';
import { BusinessUnitsPage } from './pages/BusinessUnitsPage.js';
import { ProductsPage } from './pages/ProductsPage.js';
import { UnitEconomicsPage } from './pages/UnitEconomicsPage.js';
import { DataQualityPage } from './pages/DataQualityPage.js';
import { ExperimentPage } from './pages/ExperimentPage.js';
import { ChangeReviewPage } from './pages/ChangeReviewPage.js';
import { AuditPage } from './pages/AuditPage.js';
import { EdgeCasesPage } from './pages/EdgeCasesPage.js';
import { DocumentationPage } from './pages/DocumentationPage.js';
import { PrivacyPage } from './pages/PrivacyPage.js';
import { EvaluationChecklistPage } from './pages/EvaluationChecklistPage.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<DemoRole>(DemoRole.Executive);
  const [freshnessStatus, setFreshnessStatus] = useState<'FRESH' | 'STALE' | 'MISSING'>('STALE');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const fetchFreshness = async () => {
    try {
      const res = await api.getDataFreshness();
      setFreshnessStatus(res.overallStatus);
    } catch (e) {
      console.error('Error checking pipeline freshness:', e);
    }
  };

  useEffect(() => {
    fetchFreshness();
  }, [refreshKey]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchFreshness();
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentRole={currentRole} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <TopBar
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          freshnessStatus={freshnessStatus}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto" key={refreshKey}>
          {activeTab === 'dashboard' && (
            <DashboardPage currentRole={currentRole} onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'cost-allocation' && <CostAllocationPage />}

          {activeTab === 'business-units' && (
            <BusinessUnitsPage
              onSelectBU={(bu) => {
                setActiveTab('cost-allocation');
              }}
            />
          )}

          {activeTab === 'products' && <ProductsPage />}

          {activeTab === 'unit-economics' && <UnitEconomicsPage />}

          {activeTab === 'data-quality' && <DataQualityPage />}

          {activeTab === 'experiment' && <ExperimentPage />}

          {activeTab === 'change-review' && <ChangeReviewPage currentRole={currentRole} />}

          {activeTab === 'audit' && <AuditPage />}

          {activeTab === 'edge-cases' && <EdgeCasesPage />}

          {activeTab === 'documentation' && <DocumentationPage />}

          {activeTab === 'privacy' && <PrivacyPage />}

          {activeTab === 'evaluation' && <EvaluationChecklistPage onNavigateTab={setActiveTab} />}
        </main>
      </div>
    </div>
  );
}
