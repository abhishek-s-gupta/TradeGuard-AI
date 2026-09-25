import React, { useState, useEffect } from 'react';
import type { Trade, VolatilityLevel, RiskLevel, TradeDirection } from '../types/trading';
import { calculateRisk } from '../lib/riskEngine';
import type { RiskAnalysisResult } from '../lib/riskEngine';
import { detectRevengeTrading } from '../lib/revengeTrading';
import type { RevengeCheckResult } from '../lib/revengeTrading';
import { generateAiExplanation } from '../lib/gemini';
import { 
  ShieldAlert, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle,
  Info
} from 'lucide-react';

interface RiskCheckProps {
  trades: Trade[];
  capital: number;
  onTradeAdded: () => void;
  onSaveTrade: (trade: Trade) => Promise<void>;
  onUpdateCapital: (cap: number) => void;
}

export const RiskCheck: React.FC<RiskCheckProps> = ({ 
  trades, 
  capital: initialCapital, 
  onTradeAdded, 
  onSaveTrade,
  onUpdateCapital
}) => {
  // Form states
  const [asset, setAsset] = useState('BTC-PERP');
  const [direction, setDirection] = useState<TradeDirection>('LONG');
  const [capital, setCapital] = useState(initialCapital);
  const [positionSize, setPositionSize] = useState(15000);
  const [leverage, setLeverage] = useState(5);
  const [entryPrice, setEntryPrice] = useState(60000);
  const [stopLoss, setStopLoss] = useState(57000);
  const [takeProfit, setTakeProfit] = useState(65000);
  const [volatility, setVolatility] = useState<VolatilityLevel>('MEDIUM');
  const [adverseMovePct, setAdverseMovePct] = useState(8);

  // Analysis result states
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RiskAnalysisResult | null>(null);
  const [revengeResult, setRevengeResult] = useState<RevengeCheckResult | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  
  // Update entry price defaults when asset changes
  useEffect(() => {
    if (asset === 'BTC-PERP') {
      setEntryPrice(60000);
      setStopLoss(57000);
      setTakeProfit(66000);
      setVolatility('MEDIUM');
    } else if (asset === 'ETH-PERP') {
      setEntryPrice(2600);
      setStopLoss(2470);
      setTakeProfit(2860);
      setVolatility('MEDIUM');
    } else if (asset === 'NIFTY') {
      setEntryPrice(24300);
      setStopLoss(24100);
      setTakeProfit(24700);
      setVolatility('LOW');
    } else if (asset === 'BANKNIFTY') {
      setEntryPrice(52200);
      setStopLoss(51700);
      setTakeProfit(53200);
      setVolatility('HIGH');
    }
  }, [asset]);

  // Keep internal capital state in sync with parent prop
  useEffect(() => {
    setCapital(initialCapital);
  }, [initialCapital]);

  // Handler to analyze risk
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    setAiExplanation('');

    // Validate inputs
    if (capital <= 0 || positionSize <= 0 || leverage <= 0 || entryPrice <= 0 || stopLoss <= 0 || takeProfit <= 0) {
      alert("Invalid Input: Capital, Position Size, Leverage, Entry Price, Stop Loss, and Take Profit must be positive values greater than zero.");
      setAnalyzing(false);
      return;
    }

    // Update parent capital if edited in form
    onUpdateCapital(capital);

    // 1. Calculate consecutive losses in active history
    const proceededTrades = trades.filter(t => t.decision === 'PROCEEDED');
    const sortedTrades = [...proceededTrades].sort((a, b) => b.timestamp - a.timestamp);
    let losses = 0;
    for (const t of sortedTrades) {
      if (t.result === 'LOSS') losses++;
      else if (t.result === 'WIN') break;
    }

    // 2. Run deterministic risk engine
    const risk = calculateRisk({
      leverage,
      positionSize,
      capital,
      volatility,
      consecutiveLosses: losses
    });

    // 3. Run revenge trade check
    const revenge = detectRevengeTrading(positionSize, trades);

    setAnalysisResult(risk);
    setRevengeResult(revenge);

    // 4. Request Gemini explanation
    const explanation = await generateAiExplanation({
      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      breakdown: risk.breakdown,
      leverage,
      positionSize,
      capital,
      volatility,
      consecutiveLosses: losses,
      revengeTriggered: revenge.triggered,
      asset,
      tradeCount: revenge.tradeCount,
      avgSize: revenge.avgSize,
      currentSize: positionSize
    });

    setAiExplanation(explanation);
    setAnalyzing(false);
  };

  // Handler to confirm (proceed) or cancel simulated trade
  const handleDecision = async (decision: 'PROCEEDED' | 'CANCELLED') => {
    if (!analysisResult) return;

    // Simulate final result if proceeded
    let result: 'WIN' | 'LOSS' | 'PENDING' = 'PENDING';
    let pnl = 0;

    if (decision === 'PROCEEDED') {
      let winProb = 0.65;
      if (analysisResult.riskLevel === 'MODERATE') winProb = 0.45;
      else if (analysisResult.riskLevel === 'HIGH') winProb = 0.30;
      else if (analysisResult.riskLevel === 'CRITICAL') winProb = 0.15;

      const isWin = Math.random() < winProb;
      result = isWin ? 'WIN' : 'LOSS';

      const move = isWin ? 0.12 : -0.10;
      pnl = Math.round(positionSize * leverage * move);
    }

    const newTrade: Trade = {
      id: 'trade_' + Date.now(),
      timestamp: Date.now(),
      asset,
      direction,
      capital,
      positionSize,
      leverage,
      entryPrice,
      stopLoss,
      takeProfit,
      volatility,
      adverseMovePct,
      riskScore: analysisResult.riskScore,
      riskLevel: analysisResult.riskLevel,
      riskBreakdown: analysisResult.breakdown,
      revengeTriggered: revengeResult?.triggered || false,
      revengeDetails: revengeResult ? {
        tradeCount: revengeResult.tradeCount,
        lastTradeResult: revengeResult.lastTradeResult || 'PENDING',
        avgSize: revengeResult.avgSize,
        currentSize: revengeResult.currentSize,
        pctIncrease: revengeResult.pctIncrease,
        timeSinceLastLossSec: revengeResult.timeSinceLastLossSec
      } : undefined,
      aiExplanation,
      decision,
      result,
      pnl
    };

    await onSaveTrade(newTrade);
    
    setAnalysisResult(null);
    setRevengeResult(null);
    setAiExplanation('');
    onTradeAdded();
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'LOW': return 'text-brand-emerald border-brand-emerald/20 bg-brand-emerald/10';
      case 'MODERATE': return 'text-brand-blue border-brand-blue/20 bg-brand-blue/10';
      case 'HIGH': return 'text-brand-orange border-brand-orange/20 bg-brand-orange/10';
      case 'CRITICAL': return 'text-brand-red border-brand-red/20 bg-brand-red/10';
    }
  };

  const getRiskBg = (level: RiskLevel) => {
    switch (level) {
      case 'LOW': return 'bg-brand-emerald';
      case 'MODERATE': return 'bg-brand-blue';
      case 'HIGH': return 'bg-brand-orange';
      case 'CRITICAL': return 'bg-brand-red';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-16 pb-8 text-slate-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">Pre-Trade Risk Engine</h1>
        <p className="text-slate-400 text-sm mt-1">
          Simulate a leveraged trade order to run risk checks and behavioral analysis before committing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form (5 Cols) */}
        <div className="lg:col-span-5 bg-brand-navy-light/40 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Simulated Order Ticket</h2>
          <form onSubmit={handleAnalyze} className="space-y-4">
            
            {/* Asset & Direction */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Asset</label>
                <select 
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-brand-blue"
                >
                  <option value="BTC-PERP">BTC-PERP</option>
                  <option value="ETH-PERP">ETH-PERP</option>
                  <option value="NIFTY">NIFTY</option>
                  <option value="BANKNIFTY">BANKNIFTY</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Direction</label>
                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDirection('LONG')}
                    className={`flex-1 text-xs font-bold py-1.5 rounded transition-all cursor-pointer ${
                      direction === 'LONG' ? 'bg-brand-emerald text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    LONG
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection('SHORT')}
                    className={`flex-1 text-xs font-bold py-1.5 rounded transition-all cursor-pointer ${
                      direction === 'SHORT' ? 'bg-brand-red text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    SHORT
                  </button>
                </div>
              </div>
            </div>

            {/* Capital & Position Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Capital (₹)</label>
                <input 
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-brand-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Position Size (₹)</label>
                <input 
                  type="number"
                  value={positionSize}
                  onChange={(e) => setPositionSize(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-brand-blue"
                />
              </div>
            </div>

            {/* Leverage selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Leverage ({leverage}x)
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 5, 8, 10, 20].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setLeverage(val)}
                    className={`flex-1 min-w-[40px] text-xs font-bold py-2 rounded border transition-all cursor-pointer ${
                      leverage === val 
                        ? 'bg-brand-blue border-brand-blue text-white shadow-md shadow-brand-blue/15' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {val}x
                  </button>
                ))}
              </div>
            </div>

            {/* Market Prices & Sliders */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Entry Price</label>
                <input 
                  type="number"
                  value={entryPrice === 0 ? '' : entryPrice}
                  onChange={(e) => setEntryPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-brand-blue"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stop Loss</label>
                <input 
                  type="number"
                  value={stopLoss === 0 ? '' : stopLoss}
                  onChange={(e) => setStopLoss(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-brand-blue"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Take Profit</label>
                <input 
                  type="number"
                  value={takeProfit === 0 ? '' : takeProfit}
                  onChange={(e) => setTakeProfit(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-brand-blue"
                />
              </div>
            </div>

            {/* Volatility & Adverse Move */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Volatility Level</label>
                <select 
                  value={volatility}
                  onChange={(e) => setVolatility(e.target.value as VolatilityLevel)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-brand-blue"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Adverse Move ({adverseMovePct}%)
                </label>
                <input 
                  type="number"
                  value={adverseMovePct}
                  onChange={(e) => setAdverseMovePct(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-brand-blue"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={analyzing}
              className="w-full bg-brand-blue hover:bg-blue-600 disabled:bg-slate-700 text-white font-bold py-3.5 rounded-lg text-sm transition-all shadow-md shadow-brand-blue/15 mt-6 cursor-pointer flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Calculating Risk Metrics...
                </>
              ) : (
                'Analyze Risk'
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Pre-Trade Dashboard (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center min-h-[400px]">
          {analysisResult ? (
            <div className="bg-brand-navy-light/30 border border-slate-800 rounded-xl overflow-hidden animate-fadeIn flex-1 flex flex-col">
              
              {/* Header Banner */}
              <div className="bg-brand-navy-light/80 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  BEFORE YOU TAP "{direction === 'LONG' ? 'BUY' : 'SELL'}"
                </span>
                <span className="flex items-center gap-1.5 text-xs text-brand-blue font-bold">
                  <Info className="w-3.5 h-3.5" />
                  Integrable Safety Layer
                </span>
              </div>

              <div className="p-6 flex-1 space-y-6">
                
                {/* Risk Level Callout */}
                <div className={`border p-4 rounded-xl flex items-start gap-3 ${getRiskColor(analysisResult.riskLevel)}`}>
                  <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-base uppercase tracking-wider">{analysisResult.riskLevel} RISK TRADE</h3>
                    <p className="text-sm text-slate-300 mt-1">
                      {leverage}x leverage on {asset} risks <span className="font-bold text-white">{analysisResult.capitalAtRiskPct}%</span> of your capital on an {adverseMovePct}% adverse market move.
                    </p>
                  </div>
                </div>

                {/* Score & Nudges */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-slate-800/80 pb-6">
                  {/* Left: Giant Risk Score Meter */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Risk Score
                    </span>
                    <div className="relative flex items-center justify-center">
                      <span className="text-5xl font-black text-white">{analysisResult.riskScore}</span>
                    </div>
                    <span className="text-slate-500 text-[10px] mt-1">Scale 0 - 100</span>
                    
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div 
                        className={`h-full ${getRiskBg(analysisResult.riskLevel)}`}
                        style={{ width: `${analysisResult.riskScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Right: Behavioral Warnings & Nudges */}
                  <div className="md:col-span-7 space-y-3">
                    {revengeResult?.triggered ? (
                      <div className="bg-brand-red/10 border border-brand-red/30 rounded-lg p-3.5 text-xs text-brand-red flex gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-sm">Possible Revenge Trading</p>
                          <p className="mt-1 text-slate-300">
                            {revengeResult.tradeCount} trades in 10 min after a loss — pause?
                          </p>
                          <div className="mt-2 text-[10px] text-slate-400 space-y-0.5">
                            <p>• Last trade result: <span className="font-bold text-brand-red">LOSS</span></p>
                            <p>• Position size: ₹{revengeResult.currentSize.toLocaleString()} vs average ₹{revengeResult.avgSize.toLocaleString()} ({revengeResult.pctIncrease}% increase)</p>
                            <p>• Time since last loss: {revengeResult.timeSinceLastLossSec} seconds</p>
                          </div>
                        </div>
                      </div>
                    ) : analysisResult.riskScore >= 60 ? (
                      <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-lg p-3 text-xs text-brand-orange flex gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <div>
                          <p className="font-bold">Elevated Risk Warning</p>
                          <p className="text-slate-300">
                            This transaction contains high multipliers. Consider stepping down size.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-brand-emerald/10 border border-brand-emerald/30 rounded-lg p-3 text-xs text-brand-emerald flex gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <div>
                          <p className="font-bold">Risk parameters normal</p>
                          <p className="text-slate-300">
                            Discipline check passed. No behavioral red flags triggered.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Explanation / Nudge Box */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span>AI RISK NUDGE (GEMINI CO-PILOT)</span>
                  </h4>
                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 text-sm text-slate-300 leading-relaxed italic">
                    {aiExplanation ? (
                      aiExplanation
                    ) : (
                      <div className="space-y-2 animate-pulse py-1">
                        <div className="h-3 bg-slate-800 rounded w-full"></div>
                        <div className="h-3 bg-slate-800 rounded w-11/12"></div>
                        <div className="h-3 bg-slate-800 rounded w-3/4"></div>
                      </div>
                    )}
                  </div>
                  <div className="text-[9px] text-slate-500 text-right font-medium pr-1">
                    AI-generated risk explanation &bull; Not financial advice
                  </div>
                </div>

                {/* Technical Score Breakdown */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-400">
                  <p className="text-slate-500 mb-2">// Rules Engine Breakdown (Normalized Score & Weight)</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>Leverage Risk Contribution:</span>
                      <span className="text-slate-200">
                        {analysisResult.breakdown.leverageRisk} <span className="text-slate-500">({Math.round(analysisResult.breakdown.rawLeverageScore)} &times; 0.4)</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Position Exposure Contribution:</span>
                      <span className="text-slate-200">
                        {analysisResult.breakdown.positionSizeRisk} <span className="text-slate-500">({Math.round(analysisResult.breakdown.rawPositionScore)} &times; 0.3)</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volatility Contribution:</span>
                      <span className="text-slate-200">
                        {analysisResult.breakdown.volatilityRisk} <span className="text-slate-500">({analysisResult.breakdown.rawVolatilityScore} &times; 0.2)</span>
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                      <span>Loss Streak Contribution:</span>
                      <span className="text-slate-200">
                        {analysisResult.breakdown.lossStreakRisk} <span className="text-slate-500">({analysisResult.breakdown.rawLossStreakScore} &times; 0.1)</span>
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-white">
                      <span>Total Calculated Risk Score:</span>
                      <span>{analysisResult.riskScore}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="bg-brand-navy-light/50 border-t border-slate-800 p-4 grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleDecision('CANCELLED')}
                  className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold py-3 rounded-lg text-sm transition-all cursor-pointer text-center"
                >
                  Cancel Trade
                </button>
                <button
                  onClick={() => handleDecision('PROCEEDED')}
                  className="bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 rounded-lg text-sm transition-all cursor-pointer text-center shadow-lg shadow-brand-blue/10"
                >
                  Proceed Anyway
                </button>
              </div>

            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 flex flex-col items-center justify-center flex-1">
              <ShieldAlert className="w-10 h-10 mb-3 text-slate-600" />
              <p className="font-bold text-slate-400">Analysis Pending</p>
              <p className="text-xs max-w-sm mt-1 leading-relaxed">
                Fill out the order details ticket on the left and click **Analyze Risk** to evaluate the transaction risk profile before placement.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
