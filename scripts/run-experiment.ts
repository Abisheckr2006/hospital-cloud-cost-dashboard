import { getDb } from '../backend/src/database/db.js';
import { runFinOpsExperiment } from '../backend/src/services/experiment.js';

async function main() {
  console.log('Running Hospital Cloud Cost Attribution Experiment...');
  const db = await getDb();
  const results = runFinOpsExperiment(db);

  console.log('\n======================================================');
  console.log('EXPERIMENT RESULTS: BASELINE vs TREATMENT (FINOPS ENGINE)');
  console.log('======================================================');
  console.log(`Baseline Total Cost:        $${results.baseline.totalCost.toLocaleString()}`);
  console.log(`Baseline Allocated Cost:    $${results.baseline.allocatedCost.toLocaleString()}`);
  console.log(`Baseline Unallocated Cost:  $${results.baseline.unallocatedCost.toLocaleString()}`);
  console.log(`Baseline Allocation Rate:   ${results.baseline.allocationPct.toFixed(2)}%`);
  console.log('------------------------------------------------------');
  console.log(`Target Allocation Rate:     ${results.targetPct.toFixed(2)}%`);
  console.log(`Treatment Total Cost:       $${results.treatment.totalCost.toLocaleString()}`);
  console.log(`Treatment Allocated Cost:   $${results.treatment.allocatedCost.toLocaleString()}`);
  console.log(`Treatment Unallocated Cost: $${results.treatment.unallocatedCost.toLocaleString()}`);
  console.log(`Measured Allocation Rate:   ${results.treatment.allocationPct.toFixed(2)}%`);
  console.log('------------------------------------------------------');
  console.log(`Percentage Point Gain:      +${results.percentagePointImprovement.toFixed(2)} pp`);
  console.log(`Relative Improvement:       +${results.relativeImprovementPct.toFixed(2)}%`);
  console.log(`Unallocated Reduction:      -$${results.unallocatedCostReduction.toLocaleString()} (${results.unallocatedReductionPct.toFixed(2)}% reduction)`);
  console.log(`Cost Coverage:              ${results.costCoveragePct.toFixed(2)}%`);
  console.log(`Target Achievement Gap:     ${results.gapToTarget > 0 ? results.gapToTarget + '% remaining' : 'TARGET EXCEEDED'}`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Experiment failed:', err);
  process.exit(1);
});
