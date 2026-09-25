import React, { useState } from 'react';
import type { Trade, RiskLevel, TradeDecision, TradeResult } from '../types/trading';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Check, 
  X, 
  Trash2, 
  Filter,
  AlertTriangle
} from 'lucide-react';

interface TradeHistoryProps {
  trades: Trade[];
  onClearHistory: () => Promise<void>;
}

export const TradeHistory: React.FC<TradeHistoryProps> = ({ trades, onClearHistory }) => {
  const [filterDecision, setFilterDecision] = useState<'ALL' | 'PROCEEDED' | 'CANCELLED'>('ALL');
  const [filterRisk, setFilterRisk] = useState<'ALL' | RiskLevel>('ALL');

  const filteredTrades = trades.filter((t) => {
    const matchDecision = filterDecision === 'ALL' || t.decision === filterDecision;
    const matchRisk = filterRisk === 'ALL' || t.riskLevel === filterRisk;
    return matchDecision && matchRisk;
  });

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'LOW': return 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20';
      case 'MODERATE': return 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20';
      case 'HIGH': return 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20';
      case 'CRITICAL': return 'bg-brand-red/10 text-brand-red border border-brand-red/20';
    }
  };

  const getResultBadge = (result: TradeResult, decision: TradeDecision) => {
    if (decision === 'CANCELLED') {
      return <span className="text-slate-500 italic text-xs">Cancelled</span>;
    }
    switch (result) {
      case 'WIN':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-2 py-0.5 rounded">
            <ArrowUpRight className="w-3.5 h-3.5" />
            WIN
          </span>
        );
      case 'LOSS':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-red bg-brand-red/10 border border-brand-red/20 px-2 py-0.5 rounded">
            <ArrowDownRight className="w-3.5 h-3.5" />
            LOSS
          </span>
        );
      default:
        return (
          <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Simulated Trade History</h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse through your checks, warnings, cancellations, and outcomes.
          </p>
        </div>
        <button
          onClick={onClearHistory}
          className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-brand-red hover:bg-brand-red/10 hover:border-brand-red/30 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          Reset Demo Data
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-brand-navy-light/40 border border-slate-800 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 uppercase font-bold tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            Filter By:
          </div>
          
          {/* Decision Filters */}
          <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800/80">
            {(['ALL', 'PROCEEDED', 'CANCELLED'] as const).map((dec) => (
              <button
                key={dec}
                onClick={() => setFilterDecision(dec)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  filterDecision === dec ? 'bg-brand-blue text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {dec === 'ALL' ? 'ALL DECISIONS' : dec}
              </button>
            ))}
          </div>

          {/* Risk Level Filters */}
          <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800/80">
            {(['ALL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterRisk(lvl)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  filterRisk === lvl ? 'bg-brand-blue text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl === 'ALL' ? 'ALL RISKS' : lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Showing {filteredTrades.length} of {trades.length} records
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-brand-navy-light/20 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-brand-navy-light/50 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="p-4">Date / Time</th>
                <th className="p-4">Asset</th>
                <th className="p-4">Type</th>
                <th className="p-4">Margin Size</th>
                <th className="p-4">Leverage</th>
                <th className="p-4 text-center">Risk Rating</th>
                <th className="p-4">Behavioral Warning</th>
                <th className="p-4">User Action</th>
                <th className="p-4">Outcome</th>
                <th className="p-4 text-right">PnL Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-500 text-sm">
                    No simulated records found matching selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTrades.map((t) => (
                  <tr key={t.id} className="hover:bg-brand-navy-light/30 transition-all">
                    {/* Timestamp */}
                    <td className="p-4 text-xs text-slate-400 whitespace-nowrap">
                      <div>{new Date(t.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    
                    {/* Asset */}
                    <td className="p-4 font-bold text-slate-200">{t.asset}</td>
                    
                    {/* Direction */}
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        t.direction === 'LONG' ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-brand-red/10 text-brand-red'
                      }`}>
                        {t.direction}
                      </span>
                    </td>

                    {/* Position Size */}
                    <td className="p-4 text-slate-300">₹{t.positionSize.toLocaleString()}</td>
                    
                    {/* Leverage */}
                    <td className="p-4 text-slate-400">{t.leverage}x</td>
                    
                    {/* Risk Score & Badge */}
                    <td className="p-4">
                      <div className="flex flex-col items-center justify-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${getRiskBadge(t.riskLevel)}`}>
                          Score {t.riskScore}
                        </span>
                      </div>
                    </td>

                    {/* Behavior warnings */}
                    <td className="p-4 max-w-[200px] truncate text-xs text-slate-400">
                      {t.revengeTriggered ? (
                        <span className="flex items-center gap-1 text-brand-red font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Revenge Trade
                        </span>
                      ) : t.riskScore >= 60 ? (
                        <span className="text-brand-orange font-medium">High Risk Size</span>
                      ) : (
                        <span className="text-slate-500">None</span>
                      )}
                    </td>

                    {/* Decision */}
                    <td className="p-4">
                      {t.decision === 'PROCEEDED' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-brand-emerald font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          Executed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-semibold italic">
                          <X className="w-3.5 h-3.5" />
                          Discarded
                        </span>
                      )}
                    </td>

                    {/* Outcome */}
                    <td className="p-4">{getResultBadge(t.result, t.decision)}</td>

                    {/* Simulated PnL */}
                    <td className="p-4 text-right font-semibold">
                      {t.decision === 'CANCELLED' ? (
                        <span className="text-slate-600">-</span>
                      ) : (
                        <span className={t.pnl && t.pnl >= 0 ? 'text-brand-emerald' : 'text-brand-red'}>
                          {t.pnl && t.pnl >= 0 ? '+' : ''}₹{t.pnl?.toLocaleString() || '0'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
