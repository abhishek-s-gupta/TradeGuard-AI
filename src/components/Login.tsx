import React from 'react';
import { Shield, ArrowRight, User } from 'lucide-react';

interface LoginProps {
  onLogin: (userName: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const handleDemoLogin = () => {
    onLogin('Abhishek Gupta');
  };

  return (
    <div className="relative min-h-screen bg-brand-navy-dark flex flex-col items-center justify-center text-slate-100 overflow-hidden px-4">
      {/* Background ambient blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-blue/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] bg-brand-emerald/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full text-center z-10 space-y-8">
        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-brand-blue/15 border border-brand-blue/40 rounded-2xl flex items-center justify-center text-brand-blue shadow-lg shadow-brand-blue/20">
            <Shield className="w-7 h-7" fill="currentColor" fillOpacity="0.1" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">TradeGuard <span className="text-brand-blue">AI</span></h1>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1 block">Real-Time Risk & Behavior Guard</span>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-brand-navy-light/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl text-left space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Select Demo Profile</h2>
            <p className="text-xs text-slate-500 mt-1">Hackathon MVP Demo Environment</p>
          </div>

          {/* User selector block */}
          <div 
            onClick={handleDemoLogin}
            className="flex items-center gap-4 bg-slate-900/60 border border-slate-800 hover:border-brand-blue/50 hover:bg-brand-blue/5 p-4 rounded-xl transition-all cursor-pointer group"
          >
            {/* Avatar */}
            <div className="w-12 h-12 bg-brand-blue/10 border border-brand-blue/30 rounded-full flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
              <User className="w-5 h-5" />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <span className="block text-sm font-bold text-white group-hover:text-brand-blue transition-all">Abhishek Gupta</span>
              <span className="block text-[10px] text-slate-400">Demo Trader &bull; University of Mumbai</span>
              <span className="block text-[8px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">FinTech Track</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-brand-blue transition-all" />
          </div>

          <div className="text-[10px] text-slate-500 text-center leading-relaxed">
            TradeGuard AI monitors leveraged positions and detects emotional revenge trading in real-time. Log in to access the simulator.
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-slate-600">
          Mochatrade YC P26 Hackathon &bull; Team ElectroCode
        </div>
      </div>
    </div>
  );
};
