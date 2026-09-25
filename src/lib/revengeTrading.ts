import type { Trade } from '../types/trading';

export interface RevengeCheckResult {
  triggered: boolean;
  tradeCount: number;
  lastTradeResult: 'WIN' | 'LOSS' | 'PENDING' | null;
  avgSize: number;
  currentSize: number;
  pctIncrease: number;
  timeSinceLastLossSec: number;
}

export function detectRevengeTrading(
  newPositionSize: number,
  history: Trade[],
  currentTimestamp: number = Date.now()
): RevengeCheckResult {
  // Only check trades that were actually proceeded (executed)
  const proceededTrades = history.filter(t => t.decision === 'PROCEEDED');

  if (proceededTrades.length === 0) {
    return {
      triggered: false,
      tradeCount: 0,
      lastTradeResult: null,
      avgSize: 0,
      currentSize: newPositionSize,
      pctIncrease: 0,
      timeSinceLastLossSec: -1
    };
  }

  // Sort proceeded trades descending (newest first)
  const sortedHistory = [...proceededTrades].sort((a, b) => b.timestamp - a.timestamp);
  
  // 1. Count trades in the last 10 minutes (10 * 60 * 1000 ms)
  const tenMinutesAgo = currentTimestamp - 10 * 60 * 1000;
  const recentTrades = proceededTrades.filter(t => t.timestamp >= tenMinutesAgo);
  const trades_in_10min = recentTrades.length;

  // 2. Identify the last trade's outcome
  const lastTrade = sortedHistory[0];
  const last_trade_result = lastTrade.result;

  // Find time elapsed since the last loss
  const lastLossTrade = sortedHistory.find(t => t.result === 'LOSS');
  const timeSinceLastLossSec = lastLossTrade
    ? Math.max(0, Math.round((currentTimestamp - lastLossTrade.timestamp) / 1000))
    : -1;

  // 3. Compute baseline average position size (using the last 20 proceeded trades)
  const baselineTrades = sortedHistory.slice(0, 20);
  const sumSize = baselineTrades.reduce((sum, t) => sum + t.positionSize, 0);
  const avg_size = sumSize / baselineTrades.length;

  // 4. Check if current position size is greater than avg_size * 1.5
  const isSizeViolated = newPositionSize > avg_size * 1.5;

  // Rule:
  // IF trades_in_10min > 2 AND last_trade = LOSS AND new_size > avg_size * 1.5
  // THEN trigger nudge
  const triggered = trades_in_10min > 2 && last_trade_result === 'LOSS' && isSizeViolated;

  const pctIncrease = avg_size > 0 
    ? Math.round(((newPositionSize - avg_size) / avg_size) * 100)
    : 0;

  return {
    triggered,
    tradeCount: trades_in_10min,
    lastTradeResult: last_trade_result,
    avgSize: Math.round(avg_size),
    currentSize: newPositionSize,
    pctIncrease,
    timeSinceLastLossSec
  };
}
