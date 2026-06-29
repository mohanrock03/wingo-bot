export interface WingoRound {
  period_id: string;
  timestamp: string;
  result_number: number;
  server_time?: string;
  client_time?: string;
  delay?: number;
  metadata?: string;
}

export interface FeatureSet {
  period_id: string;
  result_number: number;
  // Sequence Features
  last_1?: number;
  last_2?: number;
  last_3?: number;
  last_5?: number;
  last_10?: number[];
  // Streak Features
  big_streak: number;
  small_streak: number;
  red_streak: number;
  green_streak: number;
  digit_streak: number;
  // Transitions
  digit_to_digit?: string;
  big_small_transition?: string;
  color_transition?: string;
  // Frequencies
  rolling_frequencies: { [key: number]: number };
  session_frequencies: { [key: number]: number };
  // Volatility
  entropy: number;
  transition_entropy: number;
  digit_dispersion: number;
  // Time Features
  hour: number;
  minute: number;
  session: string;
  weekday: number;
}

export interface Agent {
  id: string;
  personality: 'Trend Follower' | 'Reversal Player' | 'Martingale Player' | 'Pattern Player' | 'Number Player' | 'Random Player' | 'Whale Player' | 'Conservative Player' | 'Emotional Player' | 'Session Player';
  risk_tolerance: number;
  balance: number;
  bet_size: number;
  confidence: number;
  aggression: number;
  preferred_bets: string[];
  win_streak: number;
  loss_streak: number;
  memory: number[];
}

export interface ExposureEstimate {
  big_exposure: number;
  small_exposure: number;
  red_exposure: number;
  green_exposure: number;
  violet_exposure: number;
  digit_exposure: { [key: number]: number };
  estimated_money_per_outcome: { [key: string]: number };
  estimated_player_counts: number;
  estimated_whale_activity: number;
}

export interface ModelOutput {
  model_name: string;
  probabilities: { [key: number]: number };
  confidence: number;
}

export interface SimulationResult {
  period_id: string;
  timestamp: string;
  probabilities: { [key: string]: number };
  top_outcomes: string[];
  confidence: number;
  uncertainty: number;
  estimated_exposures: ExposureEstimate;
  model_agreement: { [model: string]: number };
  actual_number?: number;
}

export interface BacktestMetrics {
  top1_accuracy: number;
  top3_accuracy: number;
  cross_entropy: number;
  log_loss: number;
  brier_score: number;
  calibration: number;
  probability_sharpness: number;
  total_rounds: number;
}

export interface PatternDiscoveryReport {
  repeating_sequences: Array<{ sequence: number[]; frequency: number }>;
  transitions: { [key: string]: { [key: string]: number } };
  regime_changes: Array<{ round: string; old_regime: string; new_regime: string; confidence: number }>;
  time_dependencies: Array<{ hour: number; frequency_dist: { [num: number]: number } }>;
}

export interface AutoTraderState {
  enabled: boolean;
  balance: number;
  totalTrades: number;
  wins: number;
  losses: number;
  netProfit: number;
  lastActive: string;
}

export interface AutoTradeBet {
  type: 'digit' | 'size' | 'color';
  prediction: string;
  amount: number;
  won: boolean;
  payout: number;
}

export interface AutoTradeRecord {
  id: string;
  timestamp: string;
  timeframe: string;
  period_id: string;
  prediction_digit: number;
  prediction_size: 'Big' | 'Small';
  prediction_color: 'Red' | 'Green' | 'Violet';
  actual_number: number;
  actual_size: 'Big' | 'Small';
  actual_color: 'Red' | 'Green' | 'Violet';
  bets: AutoTradeBet[];
  net_result: number;
  balance_after: number;
}
