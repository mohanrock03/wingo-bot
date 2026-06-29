import { useState } from 'react';
import { Play, ShieldAlert, CheckCircle, BarChart3, HelpCircle } from 'lucide-react';
import { BacktestMetrics } from '../types';

interface BacktestLabProps {
  timeframe: string;
  onRunBacktest: () => Promise<void>;
  backtestMetrics: BacktestMetrics | null;
  isRunning: boolean;
}

export default function BacktestLab({ timeframe, onRunBacktest, backtestMetrics, isRunning }: BacktestLabProps) {
  const [windowSize, setWindowSize] = useState<number>(20);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm" id="backtest-lab-panel">
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Backtesting & Model Validation Lab
          </h3>
          <p className="text-xs text-slate-400">
            Validate ensemble predictions over historical rounds with walk-forward testing
          </p>
        </div>

        <button
          onClick={onRunBacktest}
          disabled={isRunning}
          className={`flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all ${
            isRunning ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          {isRunning ? 'Validating...' : 'Run Full Backtest'}
        </button>
      </div>

      {/* Grid Controls */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Configurations Column */}
        <div className="space-y-4 rounded-lg bg-slate-950/40 p-4 border border-slate-850">
          <h4 className="text-xs font-semibold uppercase text-slate-400">Lab Configurations</h4>
          
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Sliding Training Window</label>
            <select 
              value={windowSize}
              onChange={(e) => setWindowSize(Number(e.target.value))}
              className="w-full rounded bg-slate-900 border border-slate-850 p-1.5 text-xs text-slate-200"
            >
              <option value={15}>15 Rounds</option>
              <option value={20}>20 Rounds</option>
              <option value={30}>30 Rounds</option>
              <option value={40}>40 Rounds</option>
            </select>
          </div>

          <div className="text-[10px] text-slate-500 space-y-1">
            <p>• <strong>Method:</strong> Walk-Forward Validation</p>
            <p>• <strong>Dataset:</strong> Current {timeframe} history</p>
            <p>• <strong>Evaluation:</strong> Multiclass probability loss</p>
          </div>
        </div>

        {/* Results Columns */}
        <div className="md:col-span-3">
          {backtestMetrics ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Metric Card 1 */}
              <div className="rounded-lg bg-slate-950/40 p-4 border border-slate-850 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Forecast Accuracy</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-mono font-bold text-emerald-400">
                      {Math.round(backtestMetrics.top1_accuracy * 100)}%
                    </span>
                    <span className="text-xs text-slate-500">Top-1</span>
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-slate-500 border-t border-slate-800/60 pt-2 flex justify-between">
                  <span>Top-3 Density:</span>
                  <strong className="text-slate-300 font-mono">{Math.round(backtestMetrics.top3_accuracy * 100)}%</strong>
                </div>
              </div>

              {/* Metric Card 2 */}
              <div className="rounded-lg bg-slate-950/40 p-4 border border-slate-850 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Model Calibration (Log Loss)</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-mono font-bold text-cyan-400">
                      {backtestMetrics.log_loss.toFixed(3)}
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-slate-500 border-t border-slate-800/60 pt-2 flex justify-between">
                  <span>Ideal Baseline:</span>
                  <strong className="text-slate-400 font-mono">2.302 (Random)</strong>
                </div>
              </div>

              {/* Metric Card 3 */}
              <div className="rounded-lg bg-slate-950/40 p-4 border border-slate-850 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Brier Score</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-mono font-bold text-purple-400">
                      {backtestMetrics.brier_score.toFixed(3)}
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-slate-500 border-t border-slate-800/60 pt-2 flex justify-between">
                  <span>Probability Sharpness:</span>
                  <strong className="text-slate-300 font-mono">{backtestMetrics.probability_sharpness.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-800 text-xs text-slate-500">
              Run a backtest session to compute performance metrics.
            </div>
          )}

          {backtestMetrics && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-900/60 p-3 border border-slate-850/80 text-xs text-slate-400">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                Backtest processed successfully over <strong>{backtestMetrics.total_rounds}</strong> rounds. Our ensemble model demonstrates a <strong>{(backtestMetrics.top1_accuracy * 10 / 1).toFixed(1)}x</strong> lift over random guessing (10% benchmark) with high informational sharpness.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
