import { Activity, ShieldCheck, Cpu, Database } from 'lucide-react';

interface HeaderProps {
  timeframe: string;
  setTimeframe: (tf: string) => void;
  isSyncing: boolean;
  totalRounds: number;
}

export default function Header({ timeframe, setTimeframe, isSyncing, totalRounds }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950 p-4" id="wmse-header">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Cpu className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Wingo Market Simulation Engine
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                v1.2-ALPHA
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Quantitative Crowd Modeling & Probabilistic Risk Analytics
            </p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Selector */}
          <div className="flex items-center rounded-lg bg-slate-900 p-1 border border-slate-800">
            {(['30s', '1m', '3m', '5m'] as const).map((tf) => (
              <button
                key={tf}
                id={`tf-btn-${tf}`}
                onClick={() => setTimeframe(tf)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Indicators */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 border border-slate-800 text-slate-400">
              <Database className="h-3.5 w-3.5 text-cyan-400" />
              <span>Rounds: <strong className="text-white">{totalRounds}</strong></span>
            </div>
            
            <div className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 border border-slate-800">
              <span className={`relative flex h-2 w-2`}>
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${isSyncing ? 'bg-cyan-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isSyncing ? 'bg-cyan-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="text-[11px] font-medium text-slate-300">
                {isSyncing ? 'SCANNERS SYNCING' : 'ENGINE STABLE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
