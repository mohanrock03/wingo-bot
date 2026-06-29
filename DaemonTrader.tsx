import { useState, useEffect } from 'react';
import { AutoTraderState, AutoTradeRecord } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Server, 
  Cpu, 
  Coins, 
  Target 
} from 'lucide-react';

export default function DaemonTrader() {
  const [state, setState] = useState<AutoTraderState | null>(null);
  const [history, setHistory] = useState<AutoTradeRecord[]>([]);
  const [pending, setPending] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Helper: show toast message
  const triggerToast = (text: string, type: 'success' | 'error' | 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStatus = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/autotrader');
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
        setHistory(data.history);
        setPending(data.pending);
      }
    } catch (err) {
      console.error('Error fetching autotrader status:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll status every 4 seconds to show live updates of background server trading
    const interval = setInterval(() => fetchStatus(true), 4000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/autotrader/toggle', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        triggerToast(
          data.enabled 
            ? 'Background Auto-Trader activated! Engine running 24x7.' 
            : 'Background Auto-Trader paused.', 
          data.enabled ? 'success' : 'info'
        );
        fetchStatus(true);
      }
    } catch (err) {
      triggerToast('Failed to contact engine daemon.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset the background server portfolio? This will restore the starting balance of $10,000.')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch('/api/autotrader/reset', { method: 'POST' });
      if (res.ok) {
        triggerToast('Background server portfolio restored and re-seeded!', 'success');
        fetchStatus(true);
      }
    } catch (err) {
      triggerToast('Failed to reset daemon database.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !state) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="h-10 w-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-400 font-mono">Syncing with server daemon...</span>
      </div>
    );
  }

  const isEnabled = state?.enabled || false;
  const balance = state?.balance || 10000;
  const totalTrades = state?.totalTrades || 0;
  const wins = state?.wins || 0;
  const losses = state?.losses || 0;
  const netProfit = state?.netProfit || 0;
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

  return (
    <div className="space-y-6" id="daemon-trader-subpage">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-bounce ${
          toast.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : toast.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
          {toast.type === 'error' && <XCircle className="h-4 w-4" />}
          {toast.type === 'info' && <Server className="h-4 w-4" />}
          <span className="text-xs font-bold">{toast.text}</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 md:p-6 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-64 w-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                <Server className="h-3 w-3" /> Continuous Server-Side Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Autonomous
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-white mt-2">
              24/7 AI Autopilot Engine
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl mt-1.5 leading-relaxed">
              This forecasting agent operates <strong className="text-slate-200">24 hours a day, 7 days a week</strong> entirely on the Cloud backend. You can close this browser tab, shut down your computer, or go offline; the background server daemon will continuously gather patterns, evaluate market configurations, and place simulated consensus bets.
            </p>
          </div>

          {/* Action Buttons & Status Switches */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4">
            <div className="text-right mr-2 hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Daemon Status</span>
              <span className={`text-xs font-black uppercase mt-0.5 block ${isEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                {isEnabled ? '● Active Uptime' : 'Paused'}
              </span>
            </div>
            
            <button
              disabled={actionLoading}
              onClick={handleToggle}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition duration-200 shadow-lg ${
                isEnabled 
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold'
              }`}
            >
              {isEnabled ? (
                <>
                  <Pause className="h-4 w-4" /> Pause Autopilot
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Activate Autopilot
                </>
              )}
            </button>

            <button
              disabled={actionLoading}
              onClick={handleReset}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Reset Portfolio Balance"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Server Stats Dashboard */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Balance */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Server Portfolio</span>
            <Coins className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-black font-mono text-white">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] font-mono text-slate-500 block mt-1">Starting: $10,000.00</span>
          </div>
        </div>

        {/* Card 2: P&L */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Net Profit / Loss</span>
            {netProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
          </div>
          <div className="mt-4">
            <span className={`text-2xl md:text-3xl font-black font-mono ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] font-mono text-slate-500 block mt-1">
              {netProfit >= 0 ? 'All-Time surplus' : 'All-Time deficit'}
            </span>
          </div>
        </div>

        {/* Card 3: Win Rate */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Win Ratio</span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-black font-mono text-cyan-400">
              {winRate.toFixed(1)}%
            </span>
            <span className="text-[10px] font-mono text-slate-500 block mt-1">
              {wins} Wins / {losses} Losses
            </span>
          </div>
        </div>

        {/* Card 4: Thread Activity */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Threads</span>
            <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-black font-mono text-slate-100">
              4 Daemons
            </span>
            <span className="text-[10px] font-mono text-slate-500 block mt-1">
              30s, 1m, 3m, 5m loops
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Pending Trades Left, Recent Trades Right */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Pending Grid */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 h-full flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 border-b border-slate-800/60 pb-3 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" /> Scheduled Next Bets
            </h3>

            <div className="mt-4 space-y-3 flex-1 flex flex-col justify-start">
              {Object.keys(pending).length === 0 ? (
                <div className="text-xs text-slate-500 bg-slate-950/30 p-4 rounded-xl border border-slate-850 text-center flex-1 flex items-center justify-center">
                  No active trades queued. Activate the autopilot daemon above to begin automated continuous placement.
                </div>
              ) : (
                ['30s', '1m', '3m', '5m'].map(tf => {
                  const bet = pending[tf];
                  if (!bet) {
                    return (
                      <div key={tf} className="p-3 bg-slate-950/10 rounded-xl border border-slate-850/60 flex items-center justify-between text-xs text-slate-500">
                        <span className="font-extrabold uppercase">{tf} Timeframe</span>
                        <span className="text-[10px] italic">Not queued</span>
                      </div>
                    );
                  }

                  return (
                    <div key={tf} className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase font-mono">
                          {tf} Loop
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {bet.period_id.substring(8)}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center pt-1">
                        <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                          <span className="text-[9px] text-slate-500 uppercase block font-semibold">Digit</span>
                          <span className="text-sm font-black text-white font-mono">{bet.digit}</span>
                        </div>
                        <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                          <span className="text-[9px] text-slate-500 uppercase block font-semibold">Size</span>
                          <span className={`text-sm font-black ${bet.size === 'Big' ? 'text-indigo-400' : 'text-pink-400'}`}>{bet.size}</span>
                        </div>
                        <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                          <span className="text-[9px] text-slate-500 uppercase block font-semibold">Color</span>
                          <span className={`text-sm font-black ${bet.color === 'Violet' ? 'text-purple-400' : bet.color === 'Red' ? 'text-red-400' : 'text-emerald-400'}`}>{bet.color}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                        <span>Simulated Leverage</span>
                        <span className="font-mono text-yellow-400 font-extrabold">${bet.amount} x 3</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* History Feed */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 border-b border-slate-800/60 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-emerald-400" /> Daemon Trade Log</span>
              <span className="text-[10px] font-mono text-slate-500">Showing last 100 entries</span>
            </h3>

            <div className="mt-4 space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="text-xs text-slate-500 py-20 text-center font-mono">
                  No background logs captured yet. Waiting for cycle completions...
                </div>
              ) : (
                history.map((record, index) => {
                  const isWin = record.net_result > 0;
                  const isLoss = record.net_result < 0;

                  return (
                    <div 
                      key={record.id} 
                      className="p-4 bg-slate-950/30 rounded-xl border border-slate-800/50 hover:border-slate-700/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[9px] font-bold font-mono">
                            {record.timeframe}
                          </span>
                          <span className="text-xs font-bold text-slate-300 font-mono">
                            Period: {record.period_id.substring(8)}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>

                        {/* Forecast vs Result detail */}
                        <div className="flex items-center gap-4 text-xs font-mono">
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Predicted</span>
                            <span className="text-slate-300">
                              {record.prediction_digit} | {record.prediction_size} | {record.prediction_color}
                            </span>
                          </div>
                          <div className="text-slate-600">→</div>
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Actual</span>
                            <span className="text-white font-extrabold">
                              {record.actual_number} | {record.actual_size} | {record.actual_color}
                            </span>
                          </div>
                        </div>

                        {/* Detailed bets breakdown */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {record.bets.map((b, i) => (
                            <span 
                              key={i} 
                              className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                b.won 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                                  : 'bg-red-500/5 text-red-500/80 border border-red-500/5'
                              }`}
                            >
                              {b.type}: {b.prediction} ({b.won ? `+$${b.payout}` : `-$${b.amount}`})
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Trade Net Result */}
                      <div className="text-right sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-900/80">
                        <div className={`text-base font-black font-mono ${
                          record.net_result > 0 
                            ? 'text-emerald-400' 
                            : record.net_result < 0 
                              ? 'text-red-400' 
                              : 'text-slate-400'
                        }`}>
                          {record.net_result > 0 ? '+' : ''}${record.net_result}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Portfolio: ${record.balance_after.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
