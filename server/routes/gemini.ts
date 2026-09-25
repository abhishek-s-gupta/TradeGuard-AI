import { Router, Request, Response } from 'express';
import { explainRiskWithGemini } from '../services/geminiService';

const router = Router();

// Whitelist of allowed anonymized risk metrics
const ALLOWED_METRICS = [
  'riskScore',
  'riskLevel',
  'leverage',
  'positionExposurePercentage',
  'volatilityScore',
  'lossStreak',
  'revengeTradingDetected',
  'recentTradeCount',
  'proposedTradeSize',
  'averagePreviousTradeSize'
];

// Privacy Sanitization Layer
function sanitizeAiPayload(body: any): any {
  const sanitized: any = {};
  const strippedKeys: string[] = [];

  Object.keys(body).forEach((key) => {
    if (ALLOWED_METRICS.includes(key)) {
      sanitized[key] = body[key];
    } else {
      strippedKeys.push(key);
    }
  });

  if (strippedKeys.length > 0) {
    console.log(`[Privacy Shield] Sanitization Event: Stripped ${strippedKeys.length} non-whitelisted/sensitive keys from request: [${strippedKeys.join(', ')}].`);
  } else {
    console.log('[Privacy Shield] Sanitization Check: Payload verified. No unallowed keys or identifiers found.');
  }

  return sanitized;
}

// POST /api/gemini endpoint
router.post('/gemini', async (req: Request, res: Response): Promise<any> => {
  try {
    // Audit & Sanitize the request body
    const sanitized = sanitizeAiPayload(req.body);

    const { 
      riskScore, 
      riskLevel, 
      leverage, 
      positionExposurePercentage, 
      volatilityScore, 
      lossStreak,
      revengeTradingDetected,
      recentTradeCount,
      proposedTradeSize,
      averagePreviousTradeSize
    } = sanitized;

    // Validate sanitized parameters
    if (
      riskScore === undefined || 
      !riskLevel || 
      leverage === undefined || 
      positionExposurePercentage === undefined || 
      !volatilityScore || 
      lossStreak === undefined ||
      revengeTradingDetected === undefined ||
      recentTradeCount === undefined ||
      proposedTradeSize === undefined ||
      averagePreviousTradeSize === undefined
    ) {
      return res.status(400).json({ error: 'Missing required whitelisted anonymized risk metrics.' });
    }

    const explanation = await explainRiskWithGemini({
      riskScore,
      riskLevel,
      leverage,
      positionExposurePercentage,
      volatilityScore,
      lossStreak,
      revengeTradingDetected: !!revengeTradingDetected,
      recentTradeCount,
      proposedTradeSize,
      averagePreviousTradeSize
    });

    return res.json(explanation);
  } catch (error: any) {
    console.error('Error generating secure risk explanation:', error.message);
    return res.status(500).json({ 
      error: 'Failed to generate AI risk explanation. Fallback triggered.' 
    });
  }
});

// POST /api/health-summary endpoint
router.post('/health-summary', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      healthScore,
      riskDisciplineGrade,
      avgRiskScore,
      leverageViolationCount,
      revengeTradeCount,
      totalTradesCount,
      consecutiveLosses
    } = req.body;

    if (
      healthScore === undefined ||
      !riskDisciplineGrade ||
      avgRiskScore === undefined ||
      leverageViolationCount === undefined ||
      revengeTradeCount === undefined ||
      totalTradesCount === undefined ||
      consecutiveLosses === undefined
    ) {
      return res.status(400).json({ error: 'Missing required health metrics.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the backend server.');
    }

    // Singular/plural helpers to pass clean inputs to Gemini
    const tradeSuffix = leverageViolationCount === 1 ? 'trade' : 'trades';
    const revengeSuffix = revengeTradeCount === 1 ? 'revenge trade' : 'revenge trades';
    const lossSuffix = consecutiveLosses === 1 ? 'loss' : 'losses';

    const prompt = `
You are TradeGuard AI, a trading psychology & behavior assistant.
Analyze these trading discipline metrics and write a weekly health report summary:

- Trading Health Score: ${healthScore} / 100
- Risk Discipline Grade: ${riskDisciplineGrade}
- Average Risk Score: ${avgRiskScore} / 100
- Total Trades: ${totalTradesCount}
- High Leverage Violations (>=10x): ${leverageViolationCount} ${tradeSuffix}
- Ignored Revenge-Trading Warnings: ${revengeTradeCount} ${revengeSuffix}
- Active Consecutive Losses: ${consecutiveLosses} ${lossSuffix}

Instructions:
1. Write a concise 3-4 sentence paragraph that analyzes their performance.
2. Point out their main strengths and specific vulnerabilities based ONLY on the supplied metrics.
3. Offer one concrete rule to improve next week (e.g. "Do not place more than 2 trades in 10 minutes" or "Keep leverage under 5x on indices").
4. CRITICAL: Use only the supplied metrics. Never invent, estimate, or modify numeric values. If a metric is 0 or unavailable, do not mention it.
5. Use correct singular and plural grammar forms (e.g. say "1 trade" instead of "1 trades", "1 loss" instead of "1 losses").
6. The Trading Health Score and Grade are pre-calculated. Do not calculate, override, or invent different scores or statistics.

Generate a JSON response conforming strictly to this schema:
{
  "summary": string; // The generated 3-4 sentence paragraph.
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 250,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('No content returned from Gemini API.');
    }

    const result = JSON.parse(text);
    return res.json({ summary: result.summary });
  } catch (error: any) {
    console.error('Error generating secure health summary:', error.message);
    return res.status(500).json({ 
      error: 'Failed to generate health summary. Fallback triggered.' 
    });
  }
});

export default router;
