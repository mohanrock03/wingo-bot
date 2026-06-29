import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Shield, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { SimulationResult } from '../types';

interface SimulationOutputProps {
  simulation: SimulationResult | null;
  modelWeights: { [model: string]: number };
}

export default function SimulationOutput({ simulation, modelWeights }: SimulationOutputProps) {
  if (!simulation) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-slate-500">
        Waiting for simulation telemetry...
      </div>
    );
  }

  const probData = Object.entries(simulation.probabilities).map(([digit, prob]) => ({
    digit: `Digit ${digit}`,
    prob: Math.round(prob * 1000) / 10,
    color: [0, 5].includes(Number(digit)) 
      ? '#c084fc' // Violet
      : [0, 2, 4, 6, 8].includes(Number(digit)) 
        ? '#f87171' // Red
        : '#4ade80' // Green
  }));

  const weightData = Object.entries(modelWeights).map(([model, weight]) => ({
    name: model,
    weight: Math.round(weight * 100)
  })).sort((a, b) => b.weight - a.weight);

  const confidencePct = Math.round(simulation.confidence * 100);
  const uncertaintyPct = Math.round(simulation.uncertainty * 100);

  return (
    <div className="grid gap-6 lg:grid-cols-3" id="simulation-output-panel">
      {/* Probabilities Column */}
      <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Probabilistic Forecast (Next Period: {simulation.period_id})
            </h3>
            <p className="text-xs text-slate-400">
              Estimated density distribution derived from 20,000 Monte Carlo universes
            </p>
          </div>
          <Sparkles className="h-4 w-4 text-cyan-400" />
        </div>

        {/* Charts Container */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={probData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                unit="%"
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
                itemStyle={{ color: '#22d3ee' }}
                formatter={(value: any) => [`${value}%`, 'Probability']}
              />
              <Bar dataKey="prob" radius={[4, 4, 0, 0]}>
                {probData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Informational Disclaimer */}
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-yellow-500/10 bg-yellow-500/5 p-3 text-[11px] leading-relaxed text-yellow-400/80">
          <AlertCircle className="h-4 w-4 shrink-0 text-yellow-500" />
          <p>
            <strong>Research Platform Notice:</strong> These outputs represent statistical estimations of hidden crowd distributions and house decision hypotheses. They are not absolute predictions, certainty signals, or guaranteed outcomes.
          </p>
        </div>
      </div>

      {/* Analytics & Model Weights Column */}
      <div className="flex flex-col gap-6">
        {/* Confidence & Outcomes */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm flex-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
            Ensemble Decision Matrix
          </h3>

          {/* Top Outcomes */}
          <div className="mb-5">
            <span className="text-xs text-slate-400 block mb-2">Primary High-Density Targets</span>
            <div className="flex gap-2">
              {simulation.top_outcomes.map((num, i) => (
                <div 
                  key={num} 
                  className={`flex flex-col items-center justify-center rounded-lg border px-4 py-2 flex-1 ${
                    i === 0 
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-300'
                  }`}
                >
                  <span className="text-xs font-medium text-slate-400">#{i + 1}</span>
                  <span className="text-2xl font-bold font-mono mt-0.5">{num}</span>
                  <span className="text-[10px] mt-0.5 font-semibold">
                    {Math.round((simulation.probabilities[num] || 0) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence and Uncertainty meters */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Confidence Index</span>
                <span className="text-cyan-400 font-mono">{confidencePct}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${confidencePct}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Uncertainty Estimate</span>
                <span className="text-purple-400 font-mono">{uncertaintyPct}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${uncertaintyPct}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Reinforcement Learning Weights */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm flex-1">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                RL Weights Engine
              </h3>
              <p className="text-[11px] text-slate-400">
                Live feedback tuning based on Brier forecast scores
              </p>
            </div>
            <Shield className="h-4 w-4 text-slate-400" />
          </div>

          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {weightData.map((w) => (
              <div key={w.name} className="flex items-center justify-between text-xs">
                <span className="text-slate-300 truncate max-w-[150px] font-medium">{w.name}</span>
                <div className="flex items-center gap-2 w-1/2">
                  <div className="h-1 bg-slate-800 rounded-full flex-1 overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: `${w.weight}%` }}></div>
                  </div>
                  <span className="font-mono text-slate-400 text-right w-8">{w.weight}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
