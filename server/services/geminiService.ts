import type { RiskLevel } from '../../src/types/trading';

export interface RiskExplainPayload {
  riskScore: number;
  riskLevel: RiskLevel;
  leverage: number;
  positionExposurePercentage: number;
  volatilityScore: string;
  lossStreak: number;
  revengeTradingDetected: boolean;
  recentTradeCount: number;
  proposedTradeSize: number;
  averagePreviousTradeSize: number;
}

export interface GeminiResponse {
  summary: string;
  keyFactors: string[];
  behaviorNote: string;
  educationalNudge: string;
}

export async function explainRiskWithGemini(payload: RiskExplainPayload): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the backend server.');
  }

  // Strictly anonymized prompt constructed using only minimized metrics
  const prompt = `
You are TradeGuard AI, an educational trading-risk explanation assistant.
The numerical risk score and behavioral detection have already been calculated by a deterministic rule engine.
Do not recalculate, change, or contradict the supplied score.
Explain the supplied result in simple language. Do not use complex jargon.
Do not provide guaranteed predictions, profit guarantees, buy/sell recommendations, or financial advice.
This is a simulated trading environment. Keep the explanation concise.

Deterministic calculation inputs (anonymized metrics):
- Risk Score: ${payload.riskScore} / 100
- Risk Level: ${payload.riskLevel}
- Leverage: ${payload.leverage}x
- Position Exposure Ratio: ${payload.positionExposurePercentage}% of total capital
- Volatility: ${payload.volatilityScore}
- Loss Streak: ${payload.lossStreak} consecutive losses
- Revenge Trading Warning: ${payload.revengeTradingDetected ? 'YES - user has high frequency of trades after loss and is scaling up size' : 'NO'}

If Revenge Trading was detected:
- Trades in last 10 minutes: ${payload.recentTradeCount}
- Proposed Trade Size (relative units): ${payload.proposedTradeSize}
- Average Previous Trade Size (relative units): ${payload.averagePreviousTradeSize}

Generate a JSON response conforming strictly to this TypeScript schema:
{
  "summary": string; // A cohesive 1-2 sentence overview explaining why this trade is categorized as this risk level based on the exposure ratio and leverage.
  "keyFactors": string[]; // Up to 3 main reasons contributing to the risk score (e.g. leverage multiplier, volatility).
  "behaviorNote": string; // Note on revenge trading warning or loss streaks if active, otherwise empty string.
  "educationalNudge": string; // A helpful educational tip to mitigate risk (e.g. recommend reducing position size, lowering leverage, or taking a cooldown pause).
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
          maxOutputTokens: 300,
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

  try {
    return JSON.parse(text) as GeminiResponse;
  } catch (err) {
    console.error('Failed to parse Gemini response as JSON:', text);
    throw new Error('Gemini response was not valid JSON.');
  }
}
