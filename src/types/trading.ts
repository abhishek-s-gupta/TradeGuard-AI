export type TradeDirection = 'LONG' | 'SHORT';
export type TradeResult = 'WIN' | 'LOSS' | 'PENDING';
export type TradeDecision = 'PROCEEDED' | 'CANCELLED';
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type VolatilityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Trade {
  id: string;
  timestamp: number;
  asset: string;
  direction: TradeDirection;
  capital: number;
  positionSize: number;
  leverage: number;
  entryPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  volatility: VolatilityLevel;
  adverseMovePct: number;
  riskScore: number;
  riskLevel: RiskLevel;
  riskBreakdown: {
    leverageRisk: number;
    positionSizeRisk: number;
    volatilityRisk: number;
    lossStreakRisk: number;
  };
  revengeTriggered: boolean;
  revengeDetails?: {
    tradeCount: number;
    lastTradeResult: TradeResult;
    avgSize: number;
    currentSize: number;
    pctIncrease: number;
    timeSinceLastLossSec: number;
  };
  aiExplanation: string;
  decision: TradeDecision;
  result: TradeResult;
  pnl?: number;
}

export interface HealthReportData {
  healthScore: number;
  riskDisciplineGrade: string;
  avgRiskScore: number;
  leverageViolationCount: number; // trades with leverage >= 10x
  revengeTradeCount: number;
  totalTradesCount: number;
  consecutiveLosses: number;
  aiSummary: string;
  history: {
    date: string;
    score: number;
  }[];
}
