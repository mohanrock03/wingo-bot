import { Layers, ListMusic, TrendingUp, HelpCircle } from 'lucide-react';
import { PatternDiscoveryReport } from '../types';

interface PatternDiscoveryProps {
  patterns: PatternDiscoveryReport | null;
}

export default function PatternDiscovery({ patterns }: PatternDiscoveryProps) {
  if (!patterns) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-slate-500">
        Waiting for pattern discovery analytics...
      </div>
    );
  }

  // Find max transition frequency to normalize cell colors
  let maxTransitionFreq = 1;
  Object.values(patterns.transitions || {}).forEach(row => {
    Object.values(row).forEach(freq => {
      if (freq > maxTransitionFreq) maxTransitionFreq = freq;
    });
  });

  return (
    <div className="grid gap-6 lg:grid-cols-3" id="pattern-discovery-panel">
      {/* Repeating Sequences Mined */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center justify-between">
          <span>Repeating Digit Sequences (L3)</span>
          <Layers className="h-4 w-4 text-cyan-400" />
        </h3>

        <div className="space-y-3">
          {patterns.repeating_sequences && patterns.repeating_sequences.length > 0 ? (
            patterns.repeating_sequences.map((seq, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between rounded-lg bg-slate-800/20 p-3 border border-slate-850"
              >
                <div className="flex gap-2">
                  {seq.sequence.map((num, sIdx) => (
                    <span 
                      key={sIdx} 
                      className={`h-7 w-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                        [0, 5].includes(num)
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : [0, 2, 4, 6, 8].includes(num)
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {num}
                    </span>
                  ))}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Frequency</span>
                  <strong className="text-xs text-slate-300">{seq.frequency} times</strong>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 text-center py-8">
              No repeating sequences found yet.
            </div>
          )}
        </div>
      </div>

      {/* Digit Transition Matrix */}
      <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
          <span>Digit-to-Digit Transition Matrix</span>
          <TrendingUp className="h-4 w-4 text-cyan-400" />
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Rows represent prior digit; columns represent subsequent digit. Heat intensity correlates with transition probability.
        </p>

        <div className="overflow-x-auto">
          <div className="min-w-[400px]">
            {/* Header row */}
            <div className="grid grid-cols-11 gap-1 text-center font-mono text-[10px] text-slate-500 font-bold border-b border-slate-800 pb-1.5 mb-1">
              <div></div>
              {Array.from({ length: 10 }).map((_, colIdx) => (
                <div key={colIdx} className="text-slate-400 font-bold">D{colIdx}</div>
              ))}
            </div>

            {/* Matrix Rows */}
            <div className="space-y-1">
              {Array.from({ length: 10 }).map((_, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-11 gap-1 items-center">
                  <div className="font-mono text-[10px] font-bold text-slate-400 text-left">D{rowIdx}</div>
                  {Array.from({ length: 10 }).map((_, colIdx) => {
                    const count = patterns.transitions?.[rowIdx]?.[colIdx] || 0;
                    const opacity = Math.max(0.05, count / maxTransitionFreq);
                    return (
                      <div 
                        key={colIdx}
                        style={{ backgroundColor: count > 0 ? `rgba(34, 211, 238, ${opacity})` : 'transparent' }}
                        className={`h-7 rounded flex items-center justify-center font-mono text-[10px] font-bold transition-all border ${
                          count > 0 
                            ? 'border-cyan-500/10 text-cyan-300 hover:scale-105' 
                            : 'border-slate-800/40 text-slate-600'
                        }`}
                        title={`Prior ${rowIdx} -> Next ${colIdx}: ${count} matches`}
                      >
                        {count > 0 ? count : '0'}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
