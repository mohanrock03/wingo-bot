import { Users, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';
import { Agent } from '../types';

interface PopulationSimulatorProps {
  agents: Agent[];
  totalBalance: number;
}

export default function PopulationSimulator({ agents, totalBalance }: PopulationSimulatorProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm" id="population-simulator-panel">
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Virtual Population Simulator (Module 3 & 4)
          </h3>
          <p className="text-xs text-slate-400">
            Simulating live crowd actions with distinct agent personalities and custom risk distributions
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-slate-950/50 px-3.5 py-1.5 border border-slate-800 text-xs">
          <Users className="h-4 w-4 text-cyan-400" />
          <span className="text-slate-400">Crowd Capital:</span>
          <strong className="text-emerald-400 font-mono">${Math.floor(totalBalance).toLocaleString()}</strong>
        </div>
      </div>

      {/* Agents Table List */}
      <div className="overflow-x-auto max-h-72 border border-slate-800/60 rounded-lg">
        <table className="w-full text-xs text-left text-slate-400">
          <thead className="bg-slate-950/40 text-[10px] text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-2 px-3 font-semibold">Agent ID</th>
              <th className="py-2 px-3 font-semibold">Personality</th>
              <th className="py-2 px-3 font-semibold text-center">Risk Tolerance</th>
              <th className="py-2 px-3 font-semibold text-center">Aggression</th>
              <th className="py-2 px-3 font-semibold text-right">Balance</th>
              <th className="py-2 px-3 font-semibold text-right">Base Bet</th>
              <th className="py-2 px-3 font-semibold text-center">Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {agents.map((agent) => (
              <tr key={agent.id} className="hover:bg-slate-800/10">
                <td className="py-2.5 px-3 font-mono text-cyan-400 font-medium">{agent.id}</td>
                <td className="py-2.5 px-3 font-semibold text-slate-200">{agent.personality}</td>
                <td className="py-2.5 px-3 text-center font-mono">
                  {(agent.risk_tolerance * 100).toFixed(0)}%
                </td>
                <td className="py-2.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="h-1.5 w-12 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500" 
                        style={{ width: `${agent.aggression * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-mono text-[10px]">{(agent.aggression * 100).toFixed(0)}%</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-semibold">
                  ${Math.floor(agent.balance)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">${Math.floor(agent.bet_size)}</td>
                <td className="py-2.5 px-3 text-center">
                  {agent.win_streak > 0 ? (
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/10">
                      {agent.win_streak}W
                    </span>
                  ) : agent.loss_streak > 0 ? (
                    <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-400 border border-red-500/10">
                      {agent.loss_streak}L
                    </span>
                  ) : (
                    <span className="text-slate-600 font-mono">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
