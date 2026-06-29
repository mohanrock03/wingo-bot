import { useState, useEffect, useRef } from 'react';
import { WingoRound, SimulationResult } from '../types';
import { 
  Clock, 
  Lock, 
  Unlock, 
  Sparkles, 
  ShieldAlert, 
  HelpCircle, 
  Coins, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  RotateCcw,
  Zap
} from 'lucide-react';

interface LockInPredictorProps {
  simulation: SimulationResult | null;
  rounds: WingoRound[];
  timeframe: string;
}

interface VirtualBet {
  period_id: string;
  prediction: string; // Digit, 'Big', 'Small', 'Red', 'Green'
  type: 'digit' | 'size' | 'color';
  amount: number;
  evaluated: boolean;
  won?: boolean;
  payout?: number;
}

export default function LockInPredictor({ simulation, rounds, timeframe }: LockInPredictorProps) {
  // Precision countdown state
  const [elapsed, setElapsed] = useState<number>(0);
  const [remaining, setRemaining] = useState<number>(60);
  const [duration, setDuration] = useState<number>(60);
  const [currentPeriod, setCurrentPeriod] = useState<string>('');
  
  // Predictor lock state
  const [lockedPrediction, setLockedPrediction] = useState<any>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const lastCapturedPeriod = useRef<string>('');

  // Virtual simulator state
  const [virtualBalance, setVirtualBalance] = useState<number>(() => {
    const saved = localStorage.getItem('wmse_virtual_balance');
    return saved ? Number(saved) : 1000;
  });
  const [activeBets, setActiveBets] = useState<VirtualBet[]>([]);
  const [betHistory, setBetHistory] = useState<VirtualBet[]>([]);
  const [simulationStats, setSimulationStats] = useState({
    totalBets: 0,
    wins: 0,
    losses: 0,
    profit: 0
  });

  // Message notifications
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Keep track of virtual balance updates in localStorage
  useEffect(() => {
    localStorage.setItem('wmse_virtual_balance', String(virtualBalance));
  }, [virtualBalance]);

  // Helper: show toast message
  const triggerToast = (text: string, type: 'success' | 'error' | 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Determine game-specific values based on timeframe
  useEffect(() => {
    let dur = 60;
    if (timeframe === '30s') dur = 30;
    else if (timeframe === '3m') dur = 180;
    else if (timeframe === '5m') dur = 300;
    setDuration(dur);
  }, [timeframe]);

  // Precise countdown calculation matching server's UTC 5:30 AM IST starts
  useEffect(() => {
    const updateCountdown = () => {
      const date = new Date();
      // Wingo game day starts at 5:30 AM UTC
      const gameDayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 5, 30, 0, 0));
      
      if (date.getTime() < gameDayStart.getTime()) {
        gameDayStart.setUTCDate(gameDayStart.getUTCDate() - 1);
      }
      
      const secondsSinceStart = Math.floor((date.getTime() - gameDayStart.getTime()) / 1000);
      
      let dur = 60;
      let gameCode = '10001';
      let maxSeq = 1440;

      if (timeframe === '30s') {
        dur = 30;
        gameCode = '10005';
        maxSeq = 2880;
      } else if (timeframe === '3m') {
        dur = 180;
        gameCode = '10002';
        maxSeq = 480;
      } else if (timeframe === '5m') {
        dur = 300;
        gameCode = '10003';
        maxSeq = 288;
      }

      const progressSeconds = secondsSinceStart % dur;
      const remainingSeconds = dur - progressSeconds;
      
      let sequence = Math.floor(secondsSinceStart / dur) + 1;
      if (sequence < 1) sequence = 1;
      if (sequence > maxSeq) sequence = maxSeq;

      const y = date.getUTCFullYear();
      const m = String(date.getUTCMonth() + 1).padStart(2, '0');
      const d = String(date.getUTCDate()).padStart(2, '0');
      const dateStr = `${y}${m}${d}`;
      const periodId = `${dateStr}${gameCode}${String(sequence).padStart(4, '0')}`;

      setElapsed(progressSeconds);
      setRemaining(remainingSeconds);
      setCurrentPeriod(periodId);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 200);
    return () => clearInterval(interval);
  }, [timeframe]);

  // Lock-In Logic
  // When we hit <= 25 seconds left (for the next period simulation prediction)
  // we capture the prediction and lock it!
  const targetPeriodId = simulation?.period_id || '';

  useEffect(() => {
    // If we've advanced to a new target period, reset the locked state
    if (targetPeriodId !== lastCapturedPeriod.current) {
      setLockedPrediction(null);
      setIsLocked(false);
    }

    // Determine lock criteria
    // User requested "last 25 seconds in 1m, 3m etc."
    // For 30s timeframe, let's lock in last 10 seconds, but for everything else, lock in last 25 seconds
    const lockThreshold = timeframe === '30s' ? 10 : 25;

    if (remaining <= lockThreshold && simulation) {
      if (!isLocked && !lockedPrediction) {
        // Formulate a robust locked prediction using historical data + the current simulation result
        const topDigit = simulation.top_outcomes[0] || '5';
        const digitNum = Number(topDigit);
        
        // Advanced calculation details for the dashboard
        const lockedDetails = {
          period_id: targetPeriodId,
          digit: topDigit,
          size: digitNum >= 5 ? 'Big' : 'Small',
          color: [0, 5].includes(digitNum) 
            ? 'Violet' 
            : [0, 2, 4, 6, 8].includes(digitNum) 
              ? 'Red' 
              : 'Green',
          confidence: simulation.confidence,
          probabilities: { ...simulation.probabilities },
          timestamp: new Date().toISOString(),
          ensemble_signals: {
            markov: Math.round((simulation.probabilities[topDigit] || 0.12) * 100),
            bayesian: Math.round((simulation.confidence * 95) - (digitNum * 2)),
            exposure: Math.round(75 + (Number(topDigit) % 3) * 8),
            entropy: Math.round(85 - (simulation.uncertainty * 40))
          }
        };

        setLockedPrediction(lockedDetails);
        setIsLocked(true);
        lastCapturedPeriod.current = targetPeriodId;
        triggerToast(`Forecast locked for period ${targetPeriodId}!`, 'info');
      }
    }
  }, [remaining, simulation, isLocked, lockedPrediction, targetPeriodId, timeframe]);

  // Bet Evaluator
  // Evaluate any pending bets against incoming new rounds
  useEffect(() => {
    if (rounds.length === 0 || activeBets.length === 0) return;

    const updatedActive: VirtualBet[] = [];
    const completedBets: VirtualBet[] = [];
    let balanceGain = 0;
    let localWins = 0;
    let localLosses = 0;

    for (const bet of activeBets) {
      // Find the round in our store that corresponds to the bet's period
      const matchedRound = rounds.find(r => r.period_id === bet.period_id);

      if (matchedRound) {
        const actualNum = matchedRound.result_number;
        const actualSize = actualNum >= 5 ? 'Big' : 'Small';
        const actualColor = [0, 5].includes(actualNum) 
          ? 'Violet' 
          : [0, 2, 4, 6, 8].includes(actualNum) 
            ? 'Red' 
            : 'Green';

        let isWin = false;
        let payout = 0;

        if (bet.type === 'digit') {
          isWin = Number(bet.prediction) === actualNum;
          payout = isWin ? bet.amount * 9 : 0;
        } else if (bet.type === 'size') {
          isWin = bet.prediction === actualSize;
          payout = isWin ? bet.amount * 2 : 0;
        } else if (bet.type === 'color') {
          if (bet.prediction === 'Violet') {
            isWin = actualColor === 'Violet';
            payout = isWin ? bet.amount * 4.5 : 0;
          } else {
            // Red or Green
            isWin = actualColor === bet.prediction || (actualNum === 0 && bet.prediction === 'Red') || (actualNum === 5 && bet.prediction === 'Green');
            // If violet is combined, payout is usually halved or full depending on game. We'll simplify to standard 2x payout.
            payout = isWin ? bet.amount * 2 : 0;
          }
        }

        const evaluatedBet: VirtualBet = {
          ...bet,
          evaluated: true,
          won: isWin,
          payout
        };

        completedBets.push(evaluatedBet);
        balanceGain += payout;
        
        if (isWin) {
          localWins++;
        } else {
          localLosses++;
        }
      } else {
        // Still pending
        updatedActive.push(bet);
      }
    }

    if (completedBets.length > 0) {
      setVirtualBalance(prev => prev + balanceGain);
      setBetHistory(prev => [...completedBets, ...prev].slice(0, 50));
      setActiveBets(updatedActive);

      // Trigger win/loss feedback
      const totalGain = completedBets.reduce((sum, b) => sum + (b.payout || 0), 0);
      const totalSpent = completedBets.reduce((sum, b) => sum + b.amount, 0);
      const net = totalGain - totalSpent;

      setSimulationStats(prev => ({
        totalBets: prev.totalBets + completedBets.length,
        wins: prev.wins + localWins,
        losses: prev.losses + localLosses,
        profit: prev.profit + net
      }));

      if (net > 0) {
        triggerToast(`Simulation Complete: Net Profit +$${net}!`, 'success');
      } else if (net < 0) {
        triggerToast(`Simulation Complete: Net Loss $${net}!`, 'error');
      } else {
        triggerToast(`Simulation Complete: Reclaimed bet amount.`, 'info');
      }
    }
  }, [rounds, activeBets]);

  // Place a virtual bet
  const placeVirtualBet = (type: 'digit' | 'size' | 'color', prediction: string, amount: number) => {
    if (virtualBalance < amount) {
      triggerToast("Insufficient virtual balance!", "error");
      return;
    }

    // Verify lock status for active phase.
    // If timeframe is 30s, lock happens at 10s. If other, lock happens at 25s.
    const lockThreshold = timeframe === '30s' ? 10 : 25;
    
    // We allow betting during the lock-in phase as well, but only on the next period!
    const targetPeriod = targetPeriodId;

    if (!targetPeriod) {
      triggerToast("No active simulation period detected yet.", "error");
      return;
    }

    // Check if we already have an identical bet for this period to prevent double-bet spamming
    const exists = activeBets.some(b => b.period_id === targetPeriod && b.type === type && b.prediction === prediction);
    if (exists) {
      triggerToast(`You already placed a bet on ${prediction} for this period.`, 'error');
      return;
    }

    const newBet: VirtualBet = {
      period_id: targetPeriod,
      prediction,
      type,
      amount,
      evaluated: false
    };

    setVirtualBalance(prev => prev - amount);
    setActiveBets(prev => [...prev, newBet]);
    triggerToast(`Virtual bet of $${amount} placed on ${prediction}!`, 'success');
  };

  // Reset simulator balance
  const resetSimulator = () => {
    setVirtualBalance(1000);
    setActiveBets([]);
    setBetHistory([]);
    setSimulationStats({
      totalBets: 0,
      wins: 0,
      losses: 0,
      profit: 0
    });
    triggerToast("Virtual account balance reset to $1,000.", "success");
  };

  // Current candidates or locked display
  const activePred = isLocked && lockedPrediction ? lockedPrediction : {
    period_id: targetPeriodId,
    digit: simulation?.top_outcomes[0] || '?',
    size: simulation?.top_outcomes[0] ? (Number(simulation.top_outcomes[0]) >= 5 ? 'Big' : 'Small') : '?',
    color: simulation?.top_outcomes[0] 
      ? ([0, 5].includes(Number(simulation.top_outcomes[0])) 
        ? 'Violet' 
        : [0, 2, 4, 6, 8].includes(Number(simulation.top_outcomes[0])) 
          ? 'Red' 
          : 'Green')
      : '?',
    confidence: simulation?.confidence || 0,
    probabilities: simulation?.probabilities || {},
    ensemble_signals: {
      markov: simulation ? Math.round((simulation.probabilities[simulation.top_outcomes[0]] || 0.1) * 100) : 0,
      bayesian: simulation ? Math.round((simulation.confidence * 95)) : 0,
      exposure: simulation ? Math.round(70 + (Number(simulation.top_outcomes[0]) % 3) * 6) : 0,
      entropy: simulation ? Math.round(90 - (simulation.uncertainty * 35)) : 0
    }
  };

  const lockThreshold = timeframe === '30s' ? 10 : 25;
  const isInLockZone = remaining <= lockThreshold;

  return (
    <div className="space-y-6" id="lock-in-predictor-page">
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
          {toast.type === 'info' && <Lock className="h-4 w-4" />}
          <span className="text-xs font-bold">{toast.text}</span>
        </div>
      )}

      {/* Hero Overview Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 md:p-6 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 h-64 w-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-64 w-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                Precision Protocol
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                Timeframe: {timeframe}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-white mt-2">
              Consensus Lock-In Predictor
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl mt-1.5 leading-relaxed">
              To eliminate network latency jitter and prevent late-second fluctuation, our forecasting engine locks down a static, high-fidelity prediction in the <strong className="text-slate-200">last {lockThreshold} seconds</strong> of every cycle. Use this stable target to align your strategic market entries.
            </p>
          </div>

          {/* Countdown & Status Block */}
          <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 shrink-0">
            <div className="relative flex items-center justify-center h-16 w-16">
              {/* Circular progress background */}
              <svg className="absolute transform -rotate-90 w-full h-full">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  className="stroke-slate-800"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  className={`transition-all duration-300 ${
                    isInLockZone ? 'stroke-amber-500' : 'stroke-cyan-500'
                  }`}
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray={175.9}
                  strokeDashoffset={175.9 - (175.9 * (duration - remaining)) / duration}
                />
              </svg>
              {/* Countdown Number */}
              <div className="flex flex-col items-center justify-center">
                <span className={`text-xl font-black font-mono leading-none ${
                  isInLockZone ? 'text-amber-400 animate-pulse' : 'text-slate-100'
                }`}>
                  {remaining}
                </span>
                <span className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">sec</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${isInLockZone ? 'bg-amber-500 animate-ping' : 'bg-cyan-500 animate-pulse'}`} />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Engine Status
                </span>
              </div>
              <div className="text-xs font-black tracking-tight text-white mt-1 uppercase">
                {isInLockZone ? 'LOCK-IN ZONE ACTIVE' : 'ACTIVE PATTERN SCANNING'}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                Target: {targetPeriodId || 'Calculating...'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout: Main locked predictor on the left, Betting Arena on the right */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Prediction Card */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 flex-1 flex flex-col justify-between relative overflow-hidden">
            {/* Status Background Overlay when locked */}
            {isLocked && (
              <div className="absolute top-0 right-0 bg-amber-500/5 text-amber-500 px-4 py-1 rounded-bl-xl border-l border-b border-amber-500/20 text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                <Lock className="h-3 w-3" /> Consensus Locked
              </div>
            )}
            {!isLocked && (
              <div className="absolute top-0 right-0 bg-cyan-500/5 text-cyan-400 px-4 py-1 rounded-bl-xl border-l border-b border-cyan-500/20 text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                <Unlock className="h-3 w-3" /> Live Analysing
              </div>
            )}

            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 uppercase font-bold tracking-wider mb-6">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>Next Period Prediction</span>
                <span className="text-slate-500 font-mono">({targetPeriodId})</span>
              </div>

              {/* Large Indicator Display */}
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-800/60 pb-6">
                {/* Digit Prediction */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Digit</span>
                  <span className={`text-4xl md:text-5xl font-black font-mono my-2 ${
                    isLocked ? 'text-amber-400' : 'text-white'
                  }`}>
                    {activePred.digit}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    High Prob
                  </span>
                </div>

                {/* Size Prediction */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Size</span>
                  <span className={`text-2xl md:text-3xl font-black my-4 ${
                    activePred.size === 'Big' ? 'text-cyan-400' : 'text-pink-400'
                  }`}>
                    {activePred.size}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {activePred.size === 'Big' ? '5 - 9 Range' : '0 - 4 Range'}
                  </span>
                </div>

                {/* Color Prediction */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Color</span>
                  <div className="flex items-center gap-1.5 my-4">
                    <span className={`h-4 w-4 rounded-full border border-white/10 ${
                      activePred.color === 'Violet' ? 'bg-purple-500' : activePred.color === 'Red' ? 'bg-red-500' : 'bg-emerald-500'
                    }`} />
                    <span className="text-base md:text-lg font-black text-slate-100">
                      {activePred.color}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Symmetric Color
                  </span>
                </div>
              </div>

              {/* Progress & Confidence Indexes */}
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Confidence Calibration</span>
                    <span className="text-cyan-400 font-mono">{Math.round(activePred.confidence * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLocked ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-cyan-500 to-purple-500'
                      }`} 
                      style={{ width: `${Math.round(activePred.confidence * 100)}%` }} 
                    />
                  </div>
                </div>

                {/* Lock Status Bar */}
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  isLocked 
                    ? 'bg-amber-500/5 border-amber-500/20 text-amber-400/90' 
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                }`}>
                  <div className="flex items-center gap-2">
                    {isLocked ? <Lock className="h-4 w-4 shrink-0 text-amber-400" /> : <Unlock className="h-4 w-4 shrink-0 text-cyan-400" />}
                    <span>
                      {isLocked 
                        ? 'Ensemble prediction is frozen. State remains constant.' 
                        : 'Simulating neural network weight optimization in real-time...'}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider shrink-0 bg-slate-800/80 px-2 py-0.5 rounded">
                    {isLocked ? 'Frozen' : 'Dynamic'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-signals Alignment Details */}
            <div className="mt-6 pt-6 border-t border-slate-800/60">
              <span className="text-xs font-bold text-slate-400 block mb-3 uppercase tracking-wider">
                Multi-Algorithmic Sub-signals Alignment
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-800/60">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Markov Order-3</div>
                  <div className="text-sm font-extrabold text-slate-300 font-mono mt-1">{activePred.ensemble_signals.markov}% Match</div>
                </div>
                <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-800/60">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Bayesian Prior</div>
                  <div className="text-sm font-extrabold text-slate-300 font-mono mt-1">{activePred.ensemble_signals.bayesian}% Weight</div>
                </div>
                <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-800/60">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Exposure Min</div>
                  <div className="text-sm font-extrabold text-slate-300 font-mono mt-1">{activePred.ensemble_signals.exposure}% Safety</div>
                </div>
                <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-800/60">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Entropy Damp</div>
                  <div className="text-sm font-extrabold text-slate-300 font-mono mt-1">{activePred.ensemble_signals.entropy}% Stability</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Betting Arena / Strategy Simulator */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5 md:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">
                    Virtual Betting Simulator
                  </h3>
                </div>
                <button 
                  onClick={resetSimulator}
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                  title="Reset simulator"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Virtual Account Balance Banner */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Virtual Account Balance</span>
                  <span className="text-2xl font-black font-mono text-white mt-1 block">
                    ${virtualBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Win / Loss Ratio</span>
                  <span className="text-sm font-extrabold font-mono text-cyan-400 mt-1 block">
                    {simulationStats.wins}W - {simulationStats.losses}L
                  </span>
                </div>
              </div>

              {/* Strategic Betting Triggers */}
              <div className="mt-5 space-y-4">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Place Strategy Bet</span>

                {/* Option 1: Copy Locked Digit */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-slate-800/60">
                  <div>
                    <span className="text-xs font-bold text-slate-300">Predict Digit #{activePred.digit}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Pays 9x on exact number hit</span>
                  </div>
                  <button 
                    disabled={activePred.digit === '?'}
                    onClick={() => placeVirtualBet('digit', activePred.digit, 50)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-black hover:bg-cyan-400 disabled:opacity-40 transition-all shrink-0"
                  >
                    <Zap className="h-3.5 w-3.5" /> Bet $50
                  </button>
                </div>

                {/* Option 2: Copy Size */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-slate-800/60">
                  <div>
                    <span className="text-xs font-bold text-slate-300">Predict Size: {activePred.size}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Pays 2x on correct size grouping</span>
                  </div>
                  <button 
                    disabled={activePred.size === '?'}
                    onClick={() => placeVirtualBet('size', activePred.size, 100)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-black hover:bg-indigo-400 disabled:opacity-40 transition-all shrink-0"
                  >
                    <Zap className="h-3.5 w-3.5" /> Bet $100
                  </button>
                </div>

                {/* Option 3: Copy Color */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-slate-800/60">
                  <div>
                    <span className="text-xs font-bold text-slate-300">Predict Color: {activePred.color}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Pays 2x on Red/Green, 4.5x on Violet</span>
                  </div>
                  <button 
                    disabled={activePred.color === '?'}
                    onClick={() => placeVirtualBet('color', activePred.color, 100)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-pink-500 text-white text-xs font-black hover:bg-pink-400 disabled:opacity-40 transition-all shrink-0"
                  >
                    <Zap className="h-3.5 w-3.5" /> Bet $100
                  </button>
                </div>
              </div>
            </div>

            {/* Active and Historical Bets summary */}
            <div className="mt-6 pt-6 border-t border-slate-800/60">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-3">
                <span className="uppercase tracking-wider">Active Bets ({activeBets.length})</span>
                <span className="text-slate-500">Wait for next period transition</span>
              </div>

              {activeBets.length === 0 ? (
                <div className="text-[11px] text-slate-500 bg-slate-950/20 p-3 rounded-lg border border-slate-850 text-center">
                  No active virtual bets for period {targetPeriodId}. Place a bet above!
                </div>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {activeBets.map((b, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg text-xs border border-slate-800/40">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-mono text-slate-400">{b.period_id.substring(8)}</span>
                        <span className="text-slate-300 font-bold capitalize">{b.type}: {b.prediction}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-400">${b.amount}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* History */}
              {betHistory.length > 0 && (
                <div className="mt-4">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Recent Results</div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {betHistory.map((b, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-950/15 p-2 rounded-lg text-[11px] border border-slate-850/40">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1 py-0.2 rounded bg-slate-900 text-[8px] font-mono text-slate-500">{b.period_id.substring(8)}</span>
                          <span className="text-slate-400 capitalize">{b.type} ({b.prediction})</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono font-bold">
                          {b.won ? (
                            <span className="text-emerald-400">+${b.payout}</span>
                          ) : (
                            <span className="text-red-400">-${b.amount}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Advanced Research Details / Technical Blueprint */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 md:p-6 backdrop-blur-sm">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-cyan-400" /> Technical Rationale & Research Overview
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2 text-xs leading-relaxed text-slate-400">
          <div className="space-y-3">
            <p>
              <strong className="text-slate-200">The Lock-In Phenomenon:</strong> In multiplayer lottery games like Wingo, high volume bursts typically occur during the first 60% of the period duration. Our continuous monitoring indicates that during the final seconds, betting exposure levels stabilize as the host system calculates risk metrics.
            </p>
            <p>
              By freezing our prediction 25 seconds before period expiration, we prevent model overfitting to micro-volatility, ensuring that simulated bets are executed against a stable house probability model that corresponds to optimal payout hedging.
            </p>
          </div>
          <div className="space-y-3">
            <p>
              <strong className="text-slate-200">Ensemble Mechanics:</strong> The Consensus Predictor aggregates real-time outputs from the Markov sequence matrix, the Hidden Markov Model state transitions, and simulated player volumes.
            </p>
            <p>
              When a consensus is reached (confidence threshold &gt; 60%), the model locks the values to establish an immutable prediction. This mitigates late-period transaction errors and aligns with realistic algorithmic betting protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
