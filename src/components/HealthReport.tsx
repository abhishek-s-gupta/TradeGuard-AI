import React, { useState, useEffect } from 'react';
import type { Trade } from '../types/trading';
import { calculateHealthMetrics, generateHealthSummary } from '../lib/tradingMetrics';
import { 
  Award, 
  Activity, 
  ShieldCheck, 
  RefreshCw, 
  AlertTriangle, 
  Compass
} from 'lucide-react';

interface HealthReportProps {
  trades: Trade[];
}

export const HealthReport: React.FC<HealthReportProps> = ({ trades }) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  const metrics = calculateHealthMetrics(trades);
  
  // Calculate shielded capital (capital saved by cancelling high risk trades)
  const cancelledTrades = trades.filter(t => t.decision === 'CANCELLED');
  const totalShieldedCapital = cancelledTrades.reduce((sum, t) => sum + t.positionSize, 0);

  // Calculate win rate
  const proceededTrades = trades.filter(t => t.decision === 'PROCEEDED');
  const wins = proceededTrades.filter(t => t.result === 'WIN').length;
  const winRate = proceededTrades.length > 0 ? Math.round((wins / proceededTrades.length) * 100) : 0;

  // Use a local storage cache for the AI summary to avoid unnecessary API requests
  const cacheKey = `tradeguard_health_summary_${trades.length}`;

  const fetchSummary = async (force = false) => {
    setLoadingAi(true);
    
    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setAiSummary(cached);
        setLoadingAi(false);
        return;
      }
    }

    try {
      const summary = await generateHealthSummary(metrics);
      setAiSummary(summary);
      localStorage.setItem(cacheKey, summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [trades.length]);

  const getScoreProgressBg = (score: number) => {
    if (score >= 80) return 'bg-brand-emerald';
    if (score >= 60) return 'bg-brand-blue';
    if (score >= 40) return 'bg-brand-orange';
    return 'bg-brand-red';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">Trading Health & Discipline Report</h1>
        <p className="text-slate-400 text-sm mt-1">
          Measure your adherence to risk limits and psychological discipline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Big Dial & Quick Metrics (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Health Score Gauge */}
          <div className="bg-brand-navy-light/40 border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded uppercase">
                Discipline Rating
              </span>
            </div>

            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Trading Health Score
            </span>

            {/* Simulated Dial */}
            <div className="relative flex items-center justify-center w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background track */}
                <circle
                  cx="80"
                  cy="80"
                  r="65"
                  className="stroke-slate-800"
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Score bar */}
                <circle
                  cx="80"
                  cy="80"
                  r="65"
                  className={`transition-all duration-1000 ${
                    metrics.healthScore >= 80 ? 'stroke-brand-emerald' : metrics.healthScore >= 60 ? 'stroke-brand-blue' : metrics.healthScore >= 40 ? 'stroke-brand-orange' : 'stroke-brand-red'
                  }`}
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={408.4}
                  strokeDashoffset={408.4 - (408.4 * metrics.healthScore) / 100}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white">{metrics.healthScore}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                  Grade {metrics.riskDisciplineGrade}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-xs mt-6">
              This score measures behavioral consistency, rule-adherence, and emotional control, not profitable payouts.
            </p>
          </div>

          {/* Core Behavioral Metrics */}
          <div className="bg-brand-navy-light/40 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Discipline Key Indicators</h3>
            
            {/* Capital Shielded */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-emerald" />
                <span className="text-xs text-slate-300 font-semibold">Capital Shielded</span>
              </div>
              <span className="text-sm font-extrabold text-brand-emerald">
                ₹{totalShieldedCapital.toLocaleString()}
              </span>
            </div>

            {/* Average Risk Score */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-blue" />
                <span className="text-xs text-slate-300 font-semibold">Avg Pre-Trade Risk</span>
              </div>
              <span className="text-sm font-bold text-slate-200">
                {metrics.avgRiskScore} / 100
              </span>
            </div>

            {/* Ignored Revenge Alerts */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-orange" />
                <span className="text-xs text-slate-300 font-semibold">Ignored Revenge Warnings</span>
              </div>
              <span className={`text-sm font-bold ${metrics.revengeTradeCount > 0 ? 'text-brand-red' : 'text-slate-400'}`}>
                {metrics.revengeTradeCount}
              </span>
            </div>

            {/* Win Rate */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-300 font-semibold">Win Rate (Simulated)</span>
              </div>
              <span className="text-sm font-bold text-slate-300">
                {winRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: AI weekly report summary & timeline chart (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* AI Weekly Summary Card */}
          <div className="bg-brand-navy-light/40 border border-slate-800 rounded-xl p-6 flex flex-col min-h-[220px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-brand-blue" />
                AI Behavioral Assessment
              </h2>
              <button
                onClick={() => fetchSummary(true)}
                disabled={loadingAi}
                className="text-slate-500 hover:text-slate-300 transition-all disabled:opacity-50 cursor-pointer"
                title="Regenerate Report Summary"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 text-slate-300 leading-relaxed text-sm italic flex-1 flex flex-col justify-center">
              {loadingAi ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-3 bg-slate-800 rounded w-full"></div>
                  <div className="h-3 bg-slate-800 rounded w-11/12"></div>
                  <div className="h-3 bg-slate-800 rounded w-4/5"></div>
                </div>
              ) : (
                aiSummary
              )}
            </div>
          </div>

          {/* Timeline Chart */}
          <div className="bg-brand-navy-light/40 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">
              Discipline Trend (Recent Sessions)
            </h3>

            <div className="flex items-end justify-between h-40 gap-2 px-2 mt-2">
              {metrics.history.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  <span className="opacity-0 group-hover:opacity-100 transition-all bg-slate-950 text-[10px] text-white font-bold px-1.5 py-0.5 rounded -translate-y-2 select-none absolute z-10">
                    {day.score}
                  </span>
                  
                  <div className="w-full bg-slate-900 rounded-t-sm h-32 flex items-end">
                    <div
                      className={`w-full rounded-t-sm hover:opacity-80 transition-all ${getScoreProgressBg(day.score)}`}
                      style={{ height: `${day.score}%` }}
                    />
                  </div>

                  <span className="text-[10px] text-slate-500 font-bold mt-2 uppercase">{day.date}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
