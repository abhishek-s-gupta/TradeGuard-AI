import React from 'react';
import type { Trade } from '../types/trading';
import { calculateHealthMetrics } from '../lib/tradingMetrics';
import { 
  Activity, 
  ShieldAlert, 
  Award,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface DashboardProps {
  trades: Trade[];
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ trades, onNavigate }) => {
  const metrics = calculateHealthMetrics(trades);
  
  // Calculate total simulated PnL
  const proceededTrades = trades.filter(t => t.decision === 'PROCEEDED');
  const totalPnL = proceededTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  
  // Calculate win rate
  const wins = proceededTrades.filter(t => t.result === 'WIN').length;
  const winRate = proceededTrades.length > 0 ? Math.round((wins / proceededTrades.length) * 100) : 0;

  // Calculate capital protected (Shielded capital from cancelled trades)
  const cancelledTrades = trades.filter(t => t.decision === 'CANCELLED');
  const totalCapitalProtected = cancelledTrades.reduce((sum, t) => sum + t.positionSize, 0);

  // Calculate high risk trades detected
  const highRiskTradesCount = trades.filter(t => t.riskScore >= 60).length;

  // Get last 4 trades
  const recentTrades = trades.slice(0, 4);

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-100 animate-fadeIn">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-brand-navy-light/40 border border-slate-800 rounded-xl p-6 mb-8 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {getGreeting()}, <span className="text-brand-blue">Demo Trader</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Pre-trade safety layer is active. Monitored session is fully protected.
          </p>
        </div>
        <button
          onClick={() => onNavigate('risk-check')}
          className="flex items-center gap-2 bg-brand-blue hover:bg-blue-600 px-6 py-3 rounded-lg text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-brand-blue/20"
        >
          <Zap className="w-4 h-4" />
          Check New Trade
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Health Score Card */}
        <div className="bg-brand-navy-light/50 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trading Health</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              metrics.healthScore >= 80 
                ? 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20' 
                : metrics.healthScore >= 60 
                  ? 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20' 
                  : 'bg-brand-red/10 text-brand-red border border-brand-red/20'
            }`}>
              Grade {metrics.riskDisciplineGrade}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white">{metrics.healthScore}</span>
            <span className="text-slate-500 text-sm">/ 100</span>
          </div>
          <p className="text-[10px] text-slate-450">Behavioral risk discipline score</p>
        </div>

        {/* Monitored Trades Card */}
        <div className="bg-brand-navy-light/50 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trades Monitored</span>
            <span className="text-slate-500">
              <Activity className="w-4 h-4 text-brand-blue" />
            </span>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl font-extrabold text-white">{trades.length}</span>
            <span className="text-slate-550 text-xs ml-1">({proceededTrades.length} executed)</span>
          </div>
          <p className="text-[10px] text-slate-450">{cancelledTrades.length} {cancelledTrades.length === 1 ? 'trade' : 'trades'} safely intercepted & cancelled</p>
        </div>

        {/* High Risk Intercepts Card */}
        <div className="bg-brand-navy-light/50 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High Risk Warnings</span>
            <span className="text-slate-500">
              <ShieldAlert className="w-4 h-4 text-brand-orange" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white">{highRiskTradesCount}</span>
            {metrics.consecutiveLosses > 1 && (
              <span className="text-[10px] font-bold text-brand-red bg-brand-red/10 border border-brand-red/20 px-2 py-0.5 rounded">
                Streak: {metrics.consecutiveLosses}L
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-455">
            {metrics.revengeTradeCount} revenge size escalations detected
          </p>
        </div>

        {/* Capital Protected Card */}
        <div className="bg-brand-navy-light/50 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Capital Shielded</span>
            <span className="text-slate-500">
              <ShieldCheck className="w-4 h-4 text-brand-emerald" />
            </span>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl font-extrabold text-brand-emerald">
              ₹{totalCapitalProtected.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-slate-450">Exposure blocked via risk nudges</p>
        </div>

      </div>

      {/* Main Grid: Left Recent Trades, Right Alerts Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Activity Log */}
        <div className="lg:col-span-2 bg-brand-navy-light/30 border border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Monitored Activity Ledger</h2>
            <button
              onClick={() => onNavigate('history')}
              className="text-brand-blue hover:text-blue-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              View Full History
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTrades.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No recent simulated trades. Go to Risk Check to run one!
            </div>
          ) : (
            <div className="space-y-4">
              {recentTrades.map((trade) => (
                <div 
                  key={trade.id} 
                  className="flex items-center justify-between bg-brand-navy-light/60 border border-slate-800/85 hover:border-slate-700 rounded-lg p-4 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      trade.decision === 'CANCELLED' 
                        ? 'bg-slate-500' 
                        : trade.result === 'WIN' 
                          ? 'bg-brand-emerald' 
                          : 'bg-brand-red'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-200">{trade.asset}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          trade.direction === 'LONG' ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-brand-red/10 text-brand-red'
                        }`}>
                          {trade.direction}
                        </span>
                        <span className="text-xs text-slate-500">
                          {trade.leverage}x
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' • '} Exposure: ₹{trade.positionSize.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        trade.riskLevel === 'LOW' 
                          ? 'bg-brand-emerald/10 text-brand-emerald' 
                          : trade.riskLevel === 'MODERATE' 
                            ? 'bg-brand-blue/10 text-brand-blue' 
                            : trade.riskLevel === 'HIGH' 
                              ? 'bg-brand-orange/10 text-brand-orange' 
                              : 'bg-brand-red/10 text-brand-red'
                      }`}>
                        Score {trade.riskScore}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                      {trade.decision === 'CANCELLED' ? (
                        <span className="text-slate-500 italic">Discarded</span>
                      ) : (
                        <span className={trade.pnl && trade.pnl >= 0 ? 'text-brand-emerald' : 'text-brand-red'}>
                          {trade.pnl && trade.pnl >= 0 ? '+' : ''}₹{trade.pnl?.toLocaleString() || '0'}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Alerts and Nudges */}
        <div className="space-y-6">
          <div className="bg-brand-navy-light/30 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-emerald" />
              Real-Time Risk Alerts
            </h3>
            
            {metrics.consecutiveLosses >= 2 ? (
              <div className="bg-brand-red/10 border border-brand-red/35 rounded-lg p-4 text-sm text-brand-red">
                <p className="font-bold mb-1">Loss Streak Detected!</p>
                <p className="text-xs text-slate-300">
                  You have logged {metrics.consecutiveLosses} consecutive losses. The pre-trade risk engine has heavily adjusted loss-streak weights. Take a break to prevent revenge trades!
                </p>
              </div>
            ) : metrics.healthScore >= 80 ? (
              <div className="bg-brand-emerald/10 border border-brand-emerald/35 rounded-lg p-4 text-sm text-brand-emerald">
                <p className="font-bold mb-1">Risk Discipline Excellent</p>
                <p className="text-xs text-slate-300">
                  Your discipline rating is currently in the green. You are successfully filtering high-leverage and sized positions.
                </p>
              </div>
            ) : (
              <div className="bg-brand-blue/10 border border-brand-blue/35 rounded-lg p-4 text-sm text-brand-blue">
                <p className="font-bold mb-1 text-white">Pre-Trade Check Active</p>
                <p className="text-xs text-slate-305">
                  The risk layer is active. Use the simulator to verify how TradeGuard flags leverage violations and size exposure ratios.
                </p>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400">P&L (Simulated)</span>
                <span className={`font-semibold ${totalPnL >= 0 ? 'text-brand-emerald' : 'text-brand-red'}`}>
                  {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400">Monitored Win Rate</span>
                <span className="font-semibold text-slate-200">{winRate}%</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-1">
                <span className="text-slate-400">Average Risk Index</span>
                <span className="font-semibold text-slate-200">{metrics.avgRiskScore} / 100</span>
              </div>
            </div>
          </div>

          {/* Quick instructions panel */}
          <div className="bg-brand-navy-light/20 border border-slate-800 rounded-xl p-6 text-xs text-slate-405 leading-relaxed">
            <h4 className="font-bold text-slate-300 mb-2">Simulate Risk Scenarios:</h4>
            <ul className="list-disc pl-4 space-y-1.5">
              <li>Open **Risk Check** and enter an order with high leverage (e.g. 10x) and HIGH volatility.</li>
              <li>Toggle position sizes to see how the mathematical engine adjusts your raw exposure risk.</li>
              <li>Trigger multiple losses in the simulator to test how **Revenge Trading Detection** halts sizing escalation.</li>
            </ul>
          </div>
        </div>
        
      </div>
    </div>
  );
};
