import type { RiskLevel, VolatilityLevel } from '../types/trading';

export interface RiskInput {
  leverage: number;
  positionSize: number;
  capital: number;
  volatility: VolatilityLevel;
  consecutiveLosses: number;
}

export interface RiskBreakdown {
  leverageRisk: number;       // Weighted leverage component (0 - 40)
  positionSizeRisk: number;   // Weighted position size component (0 - 30)
  volatilityRisk: number;     // Weighted volatility component (0 - 20)
  lossStreakRisk: number;     // Weighted loss streak component (0 - 10)
  rawLeverageScore: number;   // Normalized leverage score (0 - 100)
  rawPositionScore: number;   // Normalized position score (0 - 100)
  rawVolatilityScore: number; // Normalized volatility score (0 - 100)
  rawLossStreakScore: number; // Normalized loss streak score (0 - 100)
}

export interface RiskAnalysisResult {
  riskScore: number;
  riskLevel: RiskLevel;
  breakdown: RiskBreakdown;
  capitalAtRiskPct: number;
}

export function calculateRisk(input: RiskInput): RiskAnalysisResult {
  const { leverage, positionSize, capital, volatility, consecutiveLosses } = input;

  // 1. Leverage Risk (1x to 20x normalized to 0-100)
  const rawLeverageScore = Math.min(100, Math.max(0, (leverage / 20) * 100));

  // 2. Position Size Risk (Exposure Ratio positionSize/capital normalized to 0-100)
  const exposureRatio = capital > 0 ? positionSize / capital : 0;
  const rawPositionScore = Math.min(100, Math.max(0, exposureRatio * 100));

  // 3. Volatility Risk (LOW = 20, MEDIUM = 50, HIGH = 85)
  let rawVolatilityScore = 20;
  if (volatility === 'MEDIUM') rawVolatilityScore = 50;
  if (volatility === 'HIGH') rawVolatilityScore = 85;

  // 4. Loss Streak (0 -> 0, 1 -> 25, 2 -> 50, 3 -> 75, 4+ -> 100)
  let rawLossStreakScore = 0;
  if (consecutiveLosses === 1) rawLossStreakScore = 25;
  else if (consecutiveLosses === 2) rawLossStreakScore = 50;
  else if (consecutiveLosses === 3) rawLossStreakScore = 75;
  else if (consecutiveLosses >= 4) rawLossStreakScore = 100;

  // Apply weights
  const leverageRisk = Math.round(rawLeverageScore * 0.4);
  const positionSizeRisk = Math.round(rawPositionScore * 0.3);
  const volatilityRisk = Math.round(rawVolatilityScore * 0.2);
  const lossStreakRisk = Math.round(rawLossStreakScore * 0.1);

  // Sum components exactly
  const riskScore = leverageRisk + positionSizeRisk + volatilityRisk + lossStreakRisk;

  // Determine Risk Level
  let riskLevel: RiskLevel = 'LOW';
  if (riskScore >= 80) {
    riskLevel = 'CRITICAL';
  } else if (riskScore >= 60) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 30) {
    riskLevel = 'MODERATE';
  }

  // Calculate capital at risk on a standard 8% adverse move
  const adverseMove = 0.08;
  const capitalAtRiskPct = Math.min(100, Math.round(exposureRatio * leverage * adverseMove * 100));

  return {
    riskScore,
    riskLevel,
    breakdown: {
      leverageRisk,
      positionSizeRisk,
      volatilityRisk,
      lossStreakRisk,
      rawLeverageScore,
      rawPositionScore,
      rawVolatilityScore,
      rawLossStreakScore,
    },
    capitalAtRiskPct,
  };
}
