import type { Trade, HealthReportData } from '../types/trading';

export function calculateHealthMetrics(trades: Trade[]): Omit<HealthReportData, 'aiSummary'> {
  const proceededTrades = trades.filter(t => t.decision === 'PROCEEDED');
  const cancelledTrades = trades.filter(t => t.decision === 'CANCELLED');

  const totalTradesCount = proceededTrades.length;
  
  // Calculate average risk score
  const totalRiskScore = proceededTrades.reduce((sum, t) => sum + t.riskScore, 0);
  const avgRiskScore = totalTradesCount > 0 ? Math.round(totalRiskScore / totalTradesCount) : 0;

  // Calculate leverage violations (leverage >= 10x)
  const leverageViolationCount = proceededTrades.filter(t => t.leverage >= 10).length;

  // Calculate revenge trades executed (where revenge check was triggered and user still clicked Proceed)
  const revengeTradeCount = proceededTrades.filter(t => t.revengeTriggered).length;

  // Calculate consecutive loss streak at the current state (ordered by timestamp desc)
  const sortedProceeded = [...proceededTrades].sort((a, b) => b.timestamp - a.timestamp);
  let consecutiveLosses = 0;
  for (const t of sortedProceeded) {
    if (t.result === 'LOSS') {
      consecutiveLosses++;
    } else if (t.result === 'WIN') {
      break;
    }
  }

  // Calculate Trading Health Score (discipline score)
  // Base: 100 points
  let score = 100;

  // Deductions
  score -= revengeTradeCount * 15; // Heavy penalty for revenge trades
  score -= leverageViolationCount * 5; // Penalty for over-leveraging
  score -= proceededTrades.filter(t => t.riskScore >= 60).length * 8; // Penalty for proceeding with High/Critical risk
  score -= Math.max(0, consecutiveLosses - 1) * 3; // Small penalty for trading through active loss streaks

  // Rewards
  // Cancelled high-risk trades show risk discipline!
  const cancelledHighRiskCount = cancelledTrades.filter(t => t.riskScore >= 50).length;
  score += Math.min(20, cancelledHighRiskCount * 6); // Add up to 20 points for discipline

  // Clamp between 10 and 100
  const healthScore = Math.max(10, Math.min(100, Math.round(score)));

  // Risk Discipline Grade
  let riskDisciplineGrade = 'F';
  if (healthScore >= 90) riskDisciplineGrade = 'A+';
  else if (healthScore >= 80) riskDisciplineGrade = 'A';
  else if (healthScore >= 70) riskDisciplineGrade = 'B';
  else if (healthScore >= 60) riskDisciplineGrade = 'C';
  else if (healthScore >= 40) riskDisciplineGrade = 'D';

  // Mock static history for visualization on the chart
  const history = [
    { date: 'Mon', score: Math.min(100, Math.round(healthScore * 0.9)) },
    { date: 'Tue', score: Math.min(100, Math.round(healthScore * 0.95)) },
    { date: 'Wed', score: Math.min(100, Math.round(healthScore * 0.92)) },
    { date: 'Thu', score: Math.min(100, Math.round(healthScore * 1.05)) },
    { date: 'Fri', score: Math.min(100, Math.round(healthScore * 0.97)) },
    { date: 'Sat', score: Math.min(100, Math.round(healthScore * 1.01)) },
    { date: 'Sun', score: healthScore }
  ];

  return {
    healthScore,
    riskDisciplineGrade,
    avgRiskScore,
    leverageViolationCount,
    revengeTradeCount,
    totalTradesCount,
    consecutiveLosses,
    history
  };
}

export async function generateHealthSummary(metrics: Omit<HealthReportData, 'aiSummary'>): Promise<string> {
  try {
    const response = await fetch('/api/health-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metrics),
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    if (data && data.summary) {
      return data.summary.trim();
    }
    throw new Error('Invalid JSON format returned from backend.');
  } catch (error) {
    console.warn('Backend secure Gemini call failed for health summary, using local fallback:', error);
    return generateLocalHealthSummary(metrics);
  }
}

function generateLocalHealthSummary(metrics: Omit<HealthReportData, 'aiSummary'>): string {
  const { healthScore, riskDisciplineGrade, avgRiskScore, leverageViolationCount, revengeTradeCount, consecutiveLosses } = metrics;
  
  const intro = `Your Trading Health Score is ${healthScore}/100 (with an average pre-trade risk index of ${avgRiskScore}), placing you in the **${riskDisciplineGrade} (${getGradeLabel(riskDisciplineGrade)})** category.`;
  
  const observations: string[] = [];
  if (revengeTradeCount > 0) {
    const suffix = revengeTradeCount === 1 ? 'revenge trade' : 'revenge trades';
    observations.push(`you ignored our warning and executed ${revengeTradeCount} ${suffix}`);
  }
  if (leverageViolationCount > 0) {
    const suffix = leverageViolationCount === 1 ? 'trade' : 'trades';
    observations.push(`you entered ${leverageViolationCount} ${suffix} with excessive leverage (>= 10x)`);
  }
  if (consecutiveLosses >= 3) {
    const suffix = consecutiveLosses === 1 ? 'trade' : 'trades';
    observations.push(`you are currently on a critical loss streak of ${consecutiveLosses} ${suffix}`);
  }

  let critique = '';
  if (observations.length > 0) {
    critique = ` We noticed that ${observations.join(' and ')}. This significantly increases your probability of capital wipeout.`;
  } else {
    critique = ` You showed high discipline: no revenge trading and clean leverage limits. This is outstanding risk behavior.`;
  }

  let advice = '';
  if (healthScore >= 85) {
    advice = ' Rule for next week: Keep doing what you are doing. Focus on protecting capital first, P&L second.';
  } else if (revengeTradeCount > 0) {
    advice = ' Rule for next week: Make a firm commitment to close the trading terminal for 30 minutes after any two consecutive losses.';
  } else if (leverageViolationCount > 0) {
    advice = ' Rule for next week: Hard-cap your leverage at 5x for index futures (NIFTY) and 3x for volatile crypto/perpetual markets.';
  } else {
    advice = ' Rule for next week: Check your pre-trade risk score for every entry and try to keep position sizes below 15% of your capital.';
  }

  return `${intro}${critique}${advice}`;
}

function getGradeLabel(grade: string): string {
  switch (grade) {
    case 'A+': return 'Disciplined Elite';
    case 'A': return 'Safe Operator';
    case 'B': return 'Cautious Risk';
    case 'C': return 'Vulnerable';
    case 'D': return 'Revenge Prone';
    default: return 'Liquidation Danger';
  }
}
