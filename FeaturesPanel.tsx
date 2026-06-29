import { Activity, Flame, Hash, CircleDot } from 'lucide-react';
import { FeatureSet, WingoRound } from '../types';

interface FeaturesPanelProps {
  features: FeatureSet | null;
  rounds: WingoRound[];
}

export default function FeaturesPanel({ features, rounds }: FeaturesPanelProps) {
  if (!features || rounds.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-slate-500">
        Waiting for feature engineering computations...
      </div>
    );
  }

  const recentRounds = [...rounds].reverse().slice(0, 10);

  return (
    <div className="grid gap-6 lg:grid-cols-3" id="features-engineering-panel">
      {/* Historical Rounds Log */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center justify-between">
          <span>Recent Rounds Log</span>
          <CircleDot className="h-4 w-4 text-cyan-400" />
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-400">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-500">
                <th className="pb-2 font-semibold">Period</th>
                <th className="pb-2 font-semibold text-center">Digit</th>
                <th className="pb-2 font-semibold text-center">Size</th>
                <th className="pb-2 font-semibold text-center">Color</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentRounds.map((r, idx) => {
                const isBig = r.result_number >= 5;
                const isRed = [0, 2, 4, 6, 8].includes(r.result_number);
                const isViolet = [0, 5].includes(r.result_number);
                return (
                  <tr key={r.period_id} className="hover:bg-slate-800/10">
                    <td className={`py-2.5 font-mono ${idx === 0 ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}>
                      {r.period_id}
                      {idx === 0 && <span className="ml-1 text-[9px] bg-cyan-500/10 px-1 py-0.5 rounded">LATEST</span>}
                    </td>
                    <td className="py-2.5 text-center font-mono font-bold text-sm">
                      <span className={`px-2 py-0.5 rounded ${
                        isViolet 
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' 
                          : isRed 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/20' 
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {r.result_number}
                      </span>
                    </td>
                    <td className="py-2.5 text-center font-semibold">
                      <span className={isBig ? 'text-cyan-400' : 'text-blue-400'}>
                        {isBig ? 'BIG' : 'SMALL'}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={isRed ? 'text-red-400' : 'text-emerald-400'}>
                        {isRed ? 'RED' : 'GREEN'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Streak Counters */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center justify-between">
          <span>Active Streak Features</span>
          <Flame className="h-4 w-4 text-orange-400" />
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-slate-800/30 p-3.5 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold mb-1">Big Streak</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-cyan-400">{features.big_streak}</span>
              <span className="text-[10px] text-slate-500">consecutive</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-800/30 p-3.5 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold mb-1">Small Streak</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-blue-400">{features.small_streak}</span>
              <span className="text-[10px] text-slate-500">consecutive</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-800/30 p-3.5 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold mb-1">Red Streak</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-red-400">{features.red_streak}</span>
              <span className="text-[10px] text-slate-500">consecutive</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-800/30 p-3.5 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold mb-1">Green Streak</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-emerald-400">{features.green_streak}</span>
              <span className="text-[10px] text-slate-500">consecutive</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-slate-900 p-3 border border-slate-800 text-[11px]">
          <div className="flex justify-between mb-1.5">
            <span className="text-slate-400">Digit Repeat Streak:</span>
            <strong className="text-white font-mono">{features.digit_streak} rounds</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Last Transitions:</span>
            <strong className="text-cyan-400 font-mono text-[10px]">{features.big_small_transition || 'N/A'}</strong>
          </div>
        </div>
      </div>

      {/* Volatility & Volumetric Features */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center justify-between">
          <span>Volatility & Entropy Metrics</span>
          <Activity className="h-4 w-4 text-purple-400" />
        </h3>

        <div className="space-y-4">
          {/* Shannon Entropy */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                Shannon Entropy (50r)
              </span>
              <span className="font-mono text-slate-200 font-semibold">{features.entropy.toFixed(3)}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400" 
                style={{ width: `${(features.entropy / 3.32) * 100}%` }} // Math.log2(10) is 3.32
              ></div>
            </div>
            <span className="text-[9px] text-slate-500 block mt-1">
              Higher value implies more random distribution, lower implies pattern bias.
            </span>
          </div>

          {/* Transition Entropy */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Transition Entropy (50r)</span>
              <span className="font-mono text-slate-200 font-semibold">{features.transition_entropy.toFixed(3)}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-400" 
                style={{ width: `${(features.transition_entropy / 6.64) * 100}%` }}
              ></div>
            </div>
            <span className="text-[9px] text-slate-500 block mt-1">
              Measures chaotic predictability of consecutive digit leaps.
            </span>
          </div>

          {/* Dispersion */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Digit Dispersion Index</span>
              <span className="font-mono text-slate-200 font-semibold">{features.digit_dispersion.toFixed(3)}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-400" 
                style={{ width: `${(features.digit_dispersion / 5.0) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
