import type { VolatilityLevel, RiskLevel } from '../types/trading';

interface ExplanationInput {
  riskScore: number;
  riskLevel: RiskLevel;
  breakdown: {
    leverageRisk: number;
    positionSizeRisk: number;
    volatilityRisk: number;
    lossStreakRisk: number;
  };
  leverage: number;
  positionSize: number;
  capital: number;
  volatility: VolatilityLevel;
  consecutiveLosses: number;
  revengeTriggered: boolean;
  asset: string;
  tradeCount?: number;
  avgSize?: number;
  currentSize?: number;
}

export async function generateAiExplanation(input: ExplanationInput): Promise<string> {
  try {
    // Data minimization: calculate capital exposure percentage and strip absolute currency/identity details
    const positionExposurePercentage = input.capital > 0 
      ? Math.round((input.positionSize / input.capital) * 100) 
      : 0;

    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        riskScore: input.riskScore,
        riskLevel: input.riskLevel,
        leverage: input.leverage,
        positionExposurePercentage,
        volatilityScore: input.volatility,
        lossStreak: input.consecutiveLosses,
        revengeTradingDetected: input.revengeTriggered,
        recentTradeCount: input.tradeCount ?? 0,
        proposedTradeSize: input.currentSize ?? input.positionSize,
        averagePreviousTradeSize: input.avgSize ?? input.positionSize
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.summary) {
      const summaryText = data.summary;
      const factorsText = data.keyFactors && data.keyFactors.length > 0
        ? ` Main risk factors: ${data.keyFactors.join(', ')}.`
        : '';
      const behaviorText = data.behaviorNote ? ` ${data.behaviorNote}` : '';
      const nudgeText = data.educationalNudge ? ` Recommendation: ${data.educationalNudge}` : '';
      
      return `${summaryText}${factorsText}${behaviorText}${nudgeText}`;
    }

    throw new Error('Invalid JSON format returned from backend.');
  } catch (error) {
    console.warn('Backend secure Gemini call failed. Falling back to local engine:', error);
    return generateLocalFallback(input);
  }
}

function generateLocalFallback(input: ExplanationInput): string {
  const { leverage, positionSize, capital, volatility, consecutiveLosses, revengeTriggered, asset } = input;
  const exposurePct = capital > 0 ? Math.round((positionSize / capital) * 100) : 0;
  
  const factors: string[] = [];
  
  if (leverage >= 10) {
    factors.push(`using high leverage (${leverage}x) on ${asset} which increases vulnerability to rapid liquidations`);
  } else if (leverage >= 5) {
    factors.push(`moderate leverage of ${leverage}x on ${asset}`);
  } else {
    factors.push(`low leverage of ${leverage}x`);
  }

  if (exposurePct >= 50) {
    factors.push(`allocating a critical portion (${exposurePct}%) of your total capital to a single position`);
  } else if (exposurePct >= 25) {
    factors.push(`allocating ${exposurePct}% of your capital, which is elevated`);
  } else {
    factors.push(`allocating a safe ${exposurePct}% of your capital`);
  }

  let behaviorNote = '';
  if (revengeTriggered) {
    behaviorNote = ' Additionally, our rule engine detected a possible Revenge Trading pattern because you are scaling up position sizes impulsively after recent losses.';
  } else if (consecutiveLosses >= 2) {
    behaviorNote = ` Also, you are currently on a ${consecutiveLosses}-trade loss streak. Your emotional discipline might be compromised.`;
  }

  let envNote = '';
  if (volatility === 'HIGH') {
    envNote = ' High market volatility makes price moves unpredictable, increasing the likelihood of triggering your stop loss prematurely.';
  }

  const baseExplanation = `This trade is marked as ${input.riskLevel} Risk because you are ${factors.join(' while ')}.${envNote}${behaviorNote}`;
  const recommendation = revengeTriggered 
    ? ' Action recommended: Reject this trade, log out, and take a 15-minute cooling-off period.'
    : input.riskScore >= 60 
      ? ' Action recommended: Consider lowering your leverage to under 5x or reducing the position size by half to mitigate downside risk.'
      : ' Action recommended: Proceed with caution, ensuring your stop loss is firmly set.';

  return `${baseExplanation}${recommendation}`;
}
