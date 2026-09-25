import React from 'react';
import { 
  Shield, 
  Zap, 
  TrendingDown, 
  Check, 
  ArrowRight, 
  Activity, 
  ShieldAlert,
  Lock
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="relative overflow-hidden bg-brand-navy-dark min-h-screen text-slate-100">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] bg-brand-emerald/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-4 pt-16 pb-20 text-center z-10">
        <div className="inline-flex items-center gap-2 bg-brand-blue/10 border border-brand-blue/30 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider text-brand-blue mb-6">
          <Zap className="w-3.5 h-3.5" />
          MOCHATRADE YC P26 HACKATHON
        </div>
        
        <div className="inline-flex items-center gap-2 bg-brand-emerald/10 border border-brand-emerald/30 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider text-brand-emerald mb-6 ml-3">
          <Shield className="w-3.5 h-3.5" />
          TRACK: FINTECH (AI IN FINANCE)
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
          TradeGuard <span className="text-brand-blue">AI</span>
        </h1>
        
        <p className="text-xl md:text-2xl font-medium text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
          Your Trading Copilot — Real-Time Risk & Behavior Guard for Leveraged Trading
        </p>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          A real-time safety layer that intervenes <strong className="text-white">BEFORE</strong> a leveraged trade happens — not after the trader regrets it.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <button 
            onClick={() => onNavigate('risk-check')}
            className="flex items-center gap-2 bg-brand-blue hover:bg-blue-600 px-8 py-4 rounded-lg font-bold text-white shadow-lg shadow-brand-blue/20 transition-all cursor-pointer"
          >
            Launch Risk Simulator
            <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onNavigate('dashboard')}
            className="bg-brand-navy-light hover:bg-slate-800 border border-slate-700 px-8 py-4 rounded-lg font-bold text-slate-200 transition-all cursor-pointer"
          >
            Open Dashboard
          </button>
        </div>

        {/* Team Credits */}
        <div className="bg-brand-navy-light/40 border border-slate-800/80 rounded-xl p-4 max-w-lg mx-auto backdrop-blur-sm">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">Developed By</p>
          <p className="text-sm font-bold text-slate-200">Team ElectroCode</p>
          <p className="text-xs text-slate-400 mt-1">
            Abhishek Gupta &bull; Akash Yadav &bull; Nitin Chaurasiya
          </p>
          <p className="text-xs text-slate-500 mt-0.5">University of Mumbai</p>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="bg-brand-navy-light/30 border-y border-slate-800/80 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">The Leveraged Trading Crisis</h2>
            <p className="text-slate-400">Indian derivatives trading has exploded, but the financial toll is staggering.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Stat 1 */}
            <div className="bg-brand-navy-light/60 border border-brand-red/20 rounded-xl p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-brand-red/60"></div>
              <p className="text-6xl font-black text-brand-red mb-2">91%</p>
              <p className="text-lg font-semibold text-slate-200 mb-2">Traders Lost Money</p>
              <p className="text-xs text-slate-500">
                Of individual F&O / derivatives traders in India lost capital.
              </p>
              <div className="mt-4 inline-block bg-brand-navy-dark px-2.5 py-1 rounded text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                SEBI STUDY, FY25
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-brand-navy-light/60 border border-slate-800 rounded-xl p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-700"></div>
              <p className="text-4xl font-extrabold text-white mb-2">₹1.1+ Cr</p>
              <p className="text-lg font-semibold text-slate-200 mb-2">Average Loss</p>
              <p className="text-xs text-slate-500">
                Average loss incurred per active loss-making individual trader.
              </p>
              <div className="mt-4 inline-block bg-brand-navy-dark px-2.5 py-1 rounded text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                SEBI STUDY, FY25
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-brand-navy-light/60 border border-slate-800 rounded-xl p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-700"></div>
              <div className="flex justify-center gap-8 mb-2">
                <div>
                  <span className="block text-xs text-slate-400">FY24 Aggregate</span>
                  <span className="text-xl font-bold text-slate-300">₹74,812 Cr</span>
                </div>
                <div className="border-l border-slate-800"></div>
                <div>
                  <span className="block text-xs text-slate-400">FY25 Aggregate</span>
                  <span className="text-xl font-bold text-brand-orange">₹1,05,603 Cr</span>
                </div>
              </div>
              <p className="text-lg font-semibold text-slate-200 mt-4">Total Net Losses</p>
              <p className="text-xs text-slate-500">
                Aggregated losses by retail traders in index and stock options.
              </p>
              <div className="mt-2 inline-block bg-brand-navy-dark px-2.5 py-1 rounded text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                SEBI REPORT
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE SOLUTION SECTION */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Core Solution</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            A real-time copilot that intervenes before you trade — not after you regret it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-brand-navy-light/50 border border-slate-800 p-6 rounded-xl">
            <div className="w-12 h-12 bg-brand-blue/10 border border-brand-blue/30 rounded-lg flex items-center justify-center text-brand-blue mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pre-Trade Risk Score</h3>
            <p className="text-slate-400 text-sm">
              Instant rule-based rating from 0-100 that quantifies leverage, volatility, and position sizing risk before the buy button triggers.
            </p>
          </div>

          <div className="bg-brand-navy-light/50 border border-slate-800 p-6 rounded-xl">
            <div className="w-12 h-12 bg-brand-orange/10 border border-brand-orange/30 rounded-lg flex items-center justify-center text-brand-orange mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Revenge-Trade Detection</h3>
            <p className="text-slate-400 text-sm">
              Flags rapid, emotional re-entries and sizing escalation immediately following a series of losses using our deterministic rule logic.
            </p>
          </div>

          <div className="bg-brand-navy-light/50 border border-slate-800 p-6 rounded-xl">
            <div className="w-12 h-12 bg-brand-blue/10 border border-brand-blue/30 rounded-lg flex items-center justify-center text-brand-blue mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Plain-Language Explanations</h3>
            <p className="text-slate-400 text-sm">
              Gemini AI translates math, leverage multipliers, and liquidation risks into direct, actionable explanations to replace technical jargon.
            </p>
          </div>

          <div className="bg-brand-navy-light/50 border border-slate-800 p-6 rounded-xl">
            <div className="w-12 h-12 bg-brand-emerald/10 border border-brand-emerald/30 rounded-lg flex items-center justify-center text-brand-emerald mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Trading Health Report</h3>
            <p className="text-slate-400 text-sm">
              Monitors and rates behavioral discipline (leverage caps, revenge streaks, and risk management) rather than just tracking net profit or loss.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-brand-navy-light/20 border-t border-slate-800/80 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">How TradeGuard Works</h2>
            <p className="text-slate-400">The pre-trade safety layer intercepts the order flow to enforce guardrails.</p>
          </div>

          {/* Graphical Flow */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-brand-navy-light/60 border border-slate-800 rounded-xl p-8 mb-16">
            <div className="text-center px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg w-full md:w-auto">
              <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider">Step 1</span>
              <span className="text-sm font-semibold text-slate-300">User Places Order</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600 hidden md:block" />
            <div className="text-center px-4 py-2 bg-brand-blue/10 border border-brand-blue/30 rounded-lg w-full md:w-auto">
              <span className="block text-xs text-brand-blue font-bold uppercase tracking-wider">Step 2</span>
              <span className="text-sm font-semibold text-white">Engine Checks Risk & History</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600 hidden md:block" />
            <div className="text-center px-4 py-2 bg-brand-orange/10 border border-brand-orange/30 rounded-lg w-full md:w-auto">
              <span className="block text-xs text-brand-orange font-bold uppercase tracking-wider">Step 3</span>
              <span className="text-sm font-semibold text-white">Score & Nudge Shown</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600 hidden md:block" />
            <div className="text-center px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg w-full md:w-auto">
              <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider">Step 4</span>
              <span className="text-sm font-semibold text-slate-300">User Confirms / Cancels</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600 hidden md:block" />
            <div className="text-center px-4 py-2 bg-brand-emerald/10 border border-brand-emerald/30 rounded-lg w-full md:w-auto">
              <span className="block text-xs text-brand-emerald font-bold uppercase tracking-wider">Step 5</span>
              <span className="text-sm font-semibold text-white">Logged to Health Report</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-blue" />
              Rule-Based, Not a Black Box
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Unlike complex AI models that predict price or act as a black box, TradeGuard AI relies on a transparent, mathematical risk formula. 
              The AI does not decide your risk level; it translates the deterministic math into plain language so you understand exactly what you are risking.
            </p>
            <div className="bg-brand-navy-dark border border-slate-800 rounded-lg p-6 font-mono text-xs md:text-sm text-slate-300">
              <p className="text-slate-500 mb-2">// Exact Pitch Deck Risk Formula</p>
              <p className="font-bold text-white">
                Risk Score = (Leverage &times; 0.4) + (Position Size &times; 0.3) + (Volatility &times; 0.2) + (Loss Streak &times; 0.1)
              </p>
              <hr className="my-3 border-slate-800" />
              <p className="text-slate-400">All input metrics are normalized to a 0–100 scale before applying weights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* DIFFERENTIATION SECTION */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">How We Differentiate</h2>
          <p className="text-slate-400">TradeGuard is designed for the moment before the decision matters.</p>
        </div>

        <div className="overflow-x-auto bg-brand-navy-light/40 border border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-brand-navy-light/60">
                <th className="p-4 font-bold text-slate-300 text-sm">Feature</th>
                <th className="p-4 font-bold text-slate-400 text-sm">Existing Apps</th>
                <th className="p-4 font-bold text-brand-blue text-sm">TradeGuard AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr>
                <td className="p-4 font-semibold text-slate-200 text-sm">When it acts</td>
                <td className="p-4 text-slate-400 text-sm flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-brand-red shrink-0" />
                  After the trade (Journaling)
                </td>
                <td className="p-4 text-brand-emerald text-sm font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4.5 h-4.5 shrink-0" />
                    Before the trade (Prevention)
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-200 text-sm">Effort required</td>
                <td className="p-4 text-slate-400 text-sm">Manual logging after session</td>
                <td className="p-4 text-brand-emerald text-sm font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4.5 h-4.5 shrink-0" />
                    Zero-effort pre-trade risk check
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-200 text-sm">Integration</td>
                <td className="p-4 text-slate-400 text-sm">Standalone app or website</td>
                <td className="p-4 text-brand-emerald text-sm font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4.5 h-4.5 shrink-0" />
                    Integrates directly in order flow
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-200 text-sm">Focus market</td>
                <td className="p-4 text-slate-400 text-sm">Generic global traders</td>
                <td className="p-4 text-brand-emerald text-sm font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4.5 h-4.5 shrink-0" />
                    India-specific leverage & UPI trading
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SAFETY / DEMO WARNING FOOTER */}
      <footer className="bg-brand-navy-light/60 border-t border-slate-800 py-12 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4">
          <p className="mb-4">
            TradeGuard AI is an educational risk-awareness tool and does not provide financial advice or guarantee trading outcomes.
          </p>
          <p className="text-slate-600">
            &copy; 2026 Team ElectroCode. Created for the Mochatrade YC P26 Hackathon FinTech Track.
          </p>
        </div>
      </footer>
    </div>
  );
};
