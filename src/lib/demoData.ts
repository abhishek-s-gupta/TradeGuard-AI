import type { Trade } from '../types/trading';
import { calculateRisk } from './riskEngine';

export function getDemoTrades(): Trade[] {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneMinute = 60 * 1000;

  const mockData: Omit<Trade, 'riskScore' | 'riskLevel' | 'riskBreakdown' | 'capitalAtRiskPct'>[] = [
    {
      id: 'trade_1',
      timestamp: now - 5 * oneDay,
      asset: 'NIFTY',
      direction: 'LONG',
      capital: 100000,
      positionSize: 10000,
      leverage: 5,
      entryPrice: 24200,
      stopLoss: 24000,
      takeProfit: 24600,
      volatility: 'LOW',
      adverseMovePct: 8,
      revengeTriggered: false,
      aiExplanation: 'Low risk trade. Exposure is 10% of capital with modest 5x leverage. Standard risk parameters within standard limits.',
      decision: 'PROCEEDED',
      result: 'WIN',
      pnl: 2500,
    },
    {
      id: 'trade_2',
      timestamp: now - 4 * oneDay,
      asset: 'BTC-PERP',
      direction: 'SHORT',
      capital: 102500,
      positionSize: 15000,
      leverage: 10,
      entryPrice: 58000,
      stopLoss: 59500,
      takeProfit: 55000,
      volatility: 'MEDIUM',
      adverseMovePct: 8,
      revengeTriggered: false,
      aiExplanation: 'Moderate risk. Leverage is 10x, and position exposure is 15% of your capital. Watch out for BTC volatility.',
      decision: 'PROCEEDED',
      result: 'LOSS',
      pnl: -5000,
    },
    {
      id: 'trade_3',
      timestamp: now - 3 * oneDay,
      asset: 'ETH-PERP',
      direction: 'LONG',
      capital: 97500,
      positionSize: 12000,
      leverage: 3,
      entryPrice: 2600,
      stopLoss: 2520,
      takeProfit: 2760,
      volatility: 'MEDIUM',
      adverseMovePct: 8,
      revengeTriggered: false,
      aiExplanation: 'Conservative trade. 3x leverage on ETH is relatively low, and exposure is 12%. Recent performance is stable.',
      decision: 'PROCEEDED',
      result: 'WIN',
      pnl: 1800,
    },
    {
      id: 'trade_4',
      timestamp: now - 2 * oneDay,
      asset: 'BANKNIFTY',
      direction: 'LONG',
      capital: 99300,
      positionSize: 25000,
      leverage: 8,
      entryPrice: 52000,
      stopLoss: 51200,
      takeProfit: 53600,
      volatility: 'HIGH',
      adverseMovePct: 8,
      revengeTriggered: false,
      aiExplanation: 'High risk trade. Heavy capital exposure (25%) on HIGH volatility BANKNIFTY at 8x leverage risks substantial drawdowns.',
      decision: 'PROCEEDED',
      result: 'LOSS',
      pnl: -8000,
    },
    {
      id: 'trade_5',
      timestamp: now - 1 * oneDay,
      asset: 'BTC-PERP',
      direction: 'LONG',
      capital: 91300,
      positionSize: 45000,
      leverage: 15,
      entryPrice: 61200,
      stopLoss: 59000,
      takeProfit: 65000,
      volatility: 'HIGH',
      adverseMovePct: 8,
      revengeTriggered: false,
      aiExplanation: 'This trade was CANCELLED by the trader. It had 15x leverage and nearly 50% capital exposure on high volatility, showing critical risk levels.',
      decision: 'CANCELLED',
      result: 'PENDING',
    },
    {
      id: 'trade_6',
      timestamp: now - 8 * oneMinute,
      asset: 'NIFTY',
      direction: 'SHORT',
      capital: 91300,
      positionSize: 12000,
      leverage: 5,
      entryPrice: 24350,
      volatility: 'LOW',
      adverseMovePct: 8,
      revengeTriggered: false,
      aiExplanation: 'Standard Nifty play. Shorting under normal parameters.',
      decision: 'PROCEEDED',
      result: 'LOSS',
      pnl: -1200,
    },
    {
      id: 'trade_7',
      timestamp: now - 5 * oneMinute,
      asset: 'NIFTY',
      direction: 'LONG',
      capital: 90100,
      positionSize: 10000,
      leverage: 5,
      entryPrice: 24300,
      volatility: 'LOW',
      adverseMovePct: 8,
      revengeTriggered: true,
      aiExplanation: 'Quick re-entry after previous loss. Leverage kept at 5x.',
      decision: 'PROCEEDED',
      result: 'LOSS',
      pnl: -1500,
    },
    {
      id: 'trade_8',
      timestamp: now - 2 * oneMinute,
      asset: 'NIFTY',
      direction: 'SHORT',
      capital: 88600,
      positionSize: 14000,
      leverage: 5,
      entryPrice: 24280,
      volatility: 'LOW',
      adverseMovePct: 8,
      revengeTriggered: true,
      aiExplanation: 'Third trade in under 10 minutes. Elevated loss streak risk detected.',
      decision: 'PROCEEDED',
      result: 'LOSS',
      pnl: -2000,
    }
  ];

  let consecutiveLosses = 0;
  
  return mockData.map((t, index) => {
    const pastTrades = mockData.slice(0, index);
    consecutiveLosses = 0;
    for (let i = pastTrades.length - 1; i >= 0; i--) {
      if (pastTrades[i].decision === 'PROCEEDED') {
        if (pastTrades[i].result === 'LOSS') {
          consecutiveLosses++;
        } else if (pastTrades[i].result === 'WIN') {
          break;
        }
      }
    }

    const risk = calculateRisk({
      leverage: t.leverage,
      positionSize: t.positionSize,
      capital: t.capital,
      volatility: t.volatility,
      consecutiveLosses,
    });

    return {
      ...t,
      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      riskBreakdown: risk.breakdown,
      capitalAtRiskPct: risk.capitalAtRiskPct,
    } as Trade;
  });
}
