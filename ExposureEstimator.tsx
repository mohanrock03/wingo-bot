import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { ShieldCheck, Landmark, Users, TrendingUp } from 'lucide-react';
import { ExposureEstimate } from '../types';

interface ExposureEstimatorProps {
  exposures: ExposureEstimate | null;
}

export default function ExposureEstimator({ exposures }: ExposureEstimatorProps) {
  if (!exposures) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-slate-500">
        Waiting for exposure calculations...
      </div>
    );
  }

  // Formatting digit exposures
  const digitData = Object.entries(exposures.digit_exposure || {}).map(([digit, exp]) => ({
    digit: `D${digit}`,
    exposure: exp,
    outcomeExposure: exposures.estimated_money_per_outcome?.[digit] || 0
  }));

  const totalExposures = (exposures.big_exposure || 0) + (exposures.small_exposure || 0) + (exposures.red_exposure || 0) + (exposures.green_exposure || 0);

  return (
    <div className="grid gap-6 lg:grid-cols-3" id="exposure-estimator-panel">
      {/* Exposure Metrics Summary */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
            Estimated Crowd Exposures
          </h3>
          
          <div className="space-y-4">
            {/* Big vs Small */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Size Bets (Big vs Small)</span>
                <span className="text-slate-300">
                  ${exposures.big_exposure} / ${exposures.small_exposure}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-cyan-500" 
                  style={{ width: `${((exposures.big_exposure || 0) / Math.max(1, exposures.big_exposure + exposures.small_exposure)) * 100}%` }}
                ></div>
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${((exposures.small_exposure || 0) / Math.max(1, exposures.big_exposure + exposures.small_exposure)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Red vs Green */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Color Bets (Red vs Green)</span>
                <span className="text-slate-300">
                  ${exposures.red_exposure} / ${exposures.green_exposure}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-red-500" 
                  style={{ width: `${((exposures.red_exposure || 0) / Math.max(1, exposures.red_exposure + exposures.green_exposure)) * 100}%` }}
                ></div>
                <div 
                  className="h-full bg-emerald-500" 
                  style={{ width: `${((exposures.green_exposure || 0) / Math.max(1, exposures.red_exposure + exposures.green_exposure)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-800 text-slate-400">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Active Crowd</span>
              <strong className="text-sm text-slate-200">{exposures.estimated_player_counts}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-800 text-slate-400">
              <Landmark className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Whale Activity</span>
              <strong className="text-sm text-slate-200">
                {Math.round(exposures.estimated_whale_activity * 100)}% Index
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Digit Exposure Chart */}
      <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Digit-by-Digit Betting & House Payout Exposure
            </h3>
            <p className="text-xs text-slate-400">
              Yellow represents total estimated payout liability (combined colors, sizes & digits)
            </p>
          </div>
          <TrendingUp className="h-4 w-4 text-cyan-400" />
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={digitData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="digit" 
                tick={{ fill: '#94a3b8', fontSize: 10 }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#94a3b8', fontSize: 10 }} 
                axisLine={false}
                tickLine={false}
                unit="$"
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
                itemStyle={{ color: '#eab308' }}
              />
              <Bar dataKey="exposure" name="Direct Digit Bets" fill="#38bdf8" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
              <Bar dataKey="outcomeExposure" name="Total Payout Exposure" fill="#eab308" fillOpacity={0.4} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
