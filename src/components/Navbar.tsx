import React, { useState, useRef, useEffect } from 'react';
import type { Trade } from '../types/trading';
import { calculateHealthMetrics } from '../lib/tradingMetrics';
import { 
  Shield, 
  Menu, 
  X, 
  Activity, 
  Settings as SettingsIcon,
  FileText,
  ListCollapse,
  LayoutDashboard,
  ChevronDown,
  LogOut,
  User
} from 'lucide-react';

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  trades: Trade[];
  currentUser: string | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activePage, 
  onNavigate, 
  trades,
  currentUser,
  onLogout
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const metrics = calculateHealthMetrics(trades);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simplified navigation items for authenticated users
  const navItems = currentUser ? [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'risk-check', label: 'Risk Check', icon: Shield },
    { id: 'history', label: 'History', icon: ListCollapse },
    { id: 'health-report', label: 'Health Report', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ] : [
    { id: 'landing', label: 'Product Overview', icon: FileText }
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    onLogout();
  };

  return (
    <nav className="bg-brand-navy border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div 
            onClick={() => handleNavClick(currentUser ? 'dashboard' : 'landing')}
            className="flex items-center gap-2 cursor-pointer select-none shrink-0"
          >
            <div className="w-9 h-9 bg-brand-blue/10 border border-brand-blue/30 rounded-lg flex items-center justify-center text-brand-blue">
              <Shield className="w-5 h-5" fill="currentColor" fillOpacity="0.1" />
            </div>
            <div>
              <span className="font-extrabold text-white tracking-tight text-base">TradeGuard <span className="text-brand-blue">AI</span></span>
              <span className="block text-[7px] text-slate-500 uppercase tracking-widest font-bold">Risk Protection layer</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-brand-navy-light border border-slate-700 text-white shadow-sm' 
                      : 'text-slate-400 border border-transparent hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Section: Health index & Profile avatar dropdown */}
          <div className="flex items-center gap-4 shrink-0">
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800/80 rounded-lg px-3 py-1">
                <Activity className="w-3.5 h-3.5 text-brand-blue" />
                <div className="text-left">
                  <span className="block text-[7px] text-slate-500 uppercase font-bold tracking-wider">Health Index</span>
                  <span className="text-xs font-extrabold text-white">
                    {metrics.healthScore} <span className="text-[10px] font-semibold text-slate-400">({metrics.riskDisciplineGrade})</span>
                  </span>
                </div>
              </div>
            )}

            {currentUser ? (
              /* User Profile Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-brand-navy-light transition-all border border-transparent hover:border-slate-800 outline-none cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-blue/15 border border-brand-blue/30 text-brand-blue flex items-center justify-center font-bold text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="hidden md:block text-xs font-bold text-slate-200 select-none">Demo Trader</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-800/60">
                      <span className="block text-xs font-bold text-white">Demo Trader</span>
                      <span className="block text-[10px] text-slate-500 font-medium mt-0.5">Simulated Profile</span>
                    </div>

                    <button
                      onClick={() => { setDropdownOpen(false); onNavigate('settings'); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-xs font-bold text-slate-300 hover:bg-brand-navy-light hover:text-white transition-all cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Profile
                    </button>
                    
                    <button
                      onClick={() => { setDropdownOpen(false); onNavigate('settings'); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-xs font-bold text-slate-300 hover:bg-brand-navy-light hover:text-white transition-all cursor-pointer"
                    >
                      <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                      Trading Preferences
                    </button>
                    
                    <button
                      onClick={() => { setDropdownOpen(false); onNavigate('settings'); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-xs font-bold text-slate-300 hover:bg-brand-navy-light hover:text-white transition-all cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      Privacy & AI
                    </button>

                    <div className="border-t border-slate-850 my-1"></div>

                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-xs font-bold text-brand-red hover:bg-brand-red/10 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Link to select user if not authenticated */
              activePage !== 'landing' && (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="bg-brand-blue hover:bg-blue-600 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
                >
                  Enter App
                </button>
              )
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-400 hover:text-slate-200 outline-none p-1.5 cursor-pointer"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden bg-brand-navy border-b border-slate-800/80 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-left transition-all ${
                  isActive 
                    ? 'bg-brand-navy-light text-white border-l-4 border-brand-blue' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}

          {currentUser && (
            <>
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between px-4">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Health Index:</span>
                <span className="text-sm font-extrabold text-white bg-slate-900 border border-slate-850 px-2 py-0.5 rounded">
                  {metrics.healthScore} ({metrics.riskDisciplineGrade})
                </span>
              </div>

              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-brand-red text-left transition-all hover:bg-brand-red/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
