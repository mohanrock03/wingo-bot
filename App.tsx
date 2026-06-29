import { useState, useEffect } from 'react';
import { 
  WingoRound, 
  FeatureSet, 
  SimulationResult, 
  Agent, 
  BacktestMetrics, 
  PatternDiscoveryReport 
} from './types';
import Header from './components/Header';
import SimulationOutput from './components/SimulationOutput';
import ExposureEstimator from './components/ExposureEstimator';
import FeaturesPanel from './components/FeaturesPanel';
import BacktestLab from './components/BacktestLab';
import PatternDiscovery from './components/PatternDiscovery';
import PopulationSimulator from './components/PopulationSimulator';
import DataImporter from './components/DataImporter';
import LockInPredictor from './components/LockInPredictor';
import DaemonTrader from './components/DaemonTrader';
import { 
  Cpu, 
  TrendingUp, 
  Flame, 
  Users, 
  Play, 
  Database, 
  Activity, 
  Layers, 
  UploadCloud,
  Lock,
  PlayCircle
} from 'lucide-react';

export default function App() {
  const [timeframe, setTimeframe] = useState<string>('1m');
  const [rounds, setRounds] = useState<WingoRound[]>([]);
  const [features, setFeatures] = useState<FeatureSet | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [modelWeights, setModelWeights] = useState<{ [model: string]: number }>({});
  const [agents, setAgents] = useState<Agent[]>([]);
  const [totalAgentBalance, setTotalAgentBalance] = useState<number>(0);
  const [backtestMetrics, setBacktestMetrics] = useState<BacktestMetrics | null>(null);
  const [patterns, setPatterns] = useState<PatternDiscoveryReport | null>(null);
  
  const [isSyncing, setIsSyncing] = useState<boolean>(true);
  const [isBacktesting, setIsBacktesting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Fetch live telemetry
  const fetchTelemetry = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/live-analytics?tf=${timeframe}`);
      if (res.ok) {
        const data = await res.json();
        setRounds(data.rounds || []);
        setFeatures(data.features || null);
        setSimulation(data.simulation || null);
        setModelWeights(data.modelWeights || {});
      }
    } catch (e) {
      console.error("Telemetry fetch error:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch static population metrics & patterns
  const fetchSecondaryAnalytics = async () => {
    try {
      const [agentsRes, patternsRes] = await Promise.all([
        fetch('/api/agents'),
        fetch(`/api/patterns?tf=${timeframe}`)
      ]);

      if (agentsRes.ok) {
        const data = await agentsRes.json();
        setAgents(data.sample_agents || []);
        setTotalAgentBalance(data.aggregated_balances || 0);
      }

      if (patternsRes.ok) {
        const data = await patternsRes.json();
        setPatterns(data || null);
      }
    } catch (e) {
      console.error("Analytics fetch error:", e);
    }
  };

  // Handle run backtest
  const runBacktestSession = async () => {
    setIsBacktesting(true);
    try {
      const res = await fetch(`/api/backtest?tf=${timeframe}`);
      if (res.ok) {
        const data = await res.json();
        setBacktestMetrics(data);
      }
    } catch (e) {
      console.error("Backtest error:", e);
    } finally {
      setIsBacktesting(false);
    }
  };

  // Handle uploaded scraper file
  const handleDatasetImport = async (filename: string, content: string, format: 'csv' | 'json' | 'txt', tf: string) => {
    const res = await fetch('/api/upload-dataset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, content, format, timeframe: tf })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to parse file.');
    }

    // Refresh telemetry immediately
    fetchTelemetry();
    fetchSecondaryAnalytics();
  };

  // Trigger telemetry on mount & timeframe change
  useEffect(() => {
    fetchTelemetry();
    fetchSecondaryAnalytics();
    
    // Set up rapid telemetry polling loop (every 5 seconds) to replicate live feed ticker
    const timer = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(timer);
  }, [timeframe]);

  const tabs = [
    { id: 'dashboard', label: 'Live Forecaster', icon: Cpu },
    { id: 'lock-in', label: 'Consensus Lock-In', icon: Lock },
    { id: 'autotrader', label: '24/7 AI Autopilot', icon: PlayCircle },
    { id: 'exposure', label: 'Bet Exposures', icon: TrendingUp },
    { id: 'features', label: 'Feature Engineer', icon: Flame },
    { id: 'patterns', label: 'Pattern Discovery', icon: Layers },
    { id: 'population', label: 'Crowd Simulation', icon: Users },
    { id: 'backtest', label: 'Validation Lab', icon: Play },
    { id: 'importer', label: 'Scraper Upload', icon: UploadCloud }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Header 
        timeframe={timeframe} 
        setTimeframe={setTimeframe} 
        isSyncing={isSyncing} 
        totalRounds={rounds.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Navigation Tabs bar */}
        <div className="flex border-b border-slate-800/80 overflow-x-auto gap-2 no-scrollbar scroll-smooth">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === t.id
                    ? 'border-cyan-500 text-cyan-400 bg-slate-900/20'
                    : 'border-transparent text-slate-400 hover:text-white hover:border-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Switcher Render */}
        <div className="transition-all duration-300">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <SimulationOutput simulation={simulation} modelWeights={modelWeights} />
              <ExposureEstimator exposures={simulation ? simulation.estimated_exposures : null} />
            </div>
          )}

          {activeTab === 'lock-in' && (
            <LockInPredictor 
              simulation={simulation} 
              rounds={rounds} 
              timeframe={timeframe} 
            />
          )}

          {activeTab === 'exposure' && (
            <ExposureEstimator exposures={simulation ? simulation.estimated_exposures : null} />
          )}

          {activeTab === 'features' && (
            <FeaturesPanel features={features} rounds={rounds} />
          )}

          {activeTab === 'patterns' && (
            <PatternDiscovery patterns={patterns} />
          )}

          {activeTab === 'population' && (
            <PopulationSimulator agents={agents} totalBalance={totalAgentBalance} />
          )}

          {activeTab === 'backtest' && (
            <BacktestLab 
              timeframe={timeframe} 
              onRunBacktest={runBacktestSession} 
              backtestMetrics={backtestMetrics} 
              isRunning={isBacktesting}
            />
          )}

          {activeTab === 'importer' && (
            <DataImporter onImportData={handleDatasetImport} isImporting={false} />
          )}

          {activeTab === 'autotrader' && (
            <DaemonTrader />
          )}
        </div>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 p-4 text-center text-[11px] text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            © 2026 Wingo Market Simulation Engine (WMSE). Developed for statistical research only.
          </span>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Security Protocol: Active</span>
            <span className="hover:text-slate-400 cursor-pointer">Node Connectivity: 100%</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
