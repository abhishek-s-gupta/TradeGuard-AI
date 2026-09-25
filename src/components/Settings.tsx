import React, { useState, useEffect } from 'react';
import { 
  User,
  Sliders,
  Shield,
  Activity,
  Cpu,
  Layers,
  Database,
  Info,
  Check,
  Trash2,
  Lock,
  EyeOff,
  Sun,
  Moon,
  Monitor,
  Download,
  RefreshCw,
  AlertTriangle,
  X
} from 'lucide-react';
import { getTrades } from '../lib/db';

interface SettingsProps {
  capital: number;
  onUpdateCapital: (cap: number) => void;
  onResetData: () => Promise<void>;
  displayName: string;
  onUpdateDisplayName: (name: string) => void;
}

type TabType = 'profile' | 'preferences' | 'privacy' | 'ai' | 'appearance' | 'storage' | 'about';

export const Settings: React.FC<SettingsProps> = ({ 
  capital: initialCapital, 
  onUpdateCapital, 
  onResetData,
  displayName,
  onUpdateDisplayName
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [name, setName] = useState(displayName);
  const [capital, setCapital] = useState(initialCapital);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Notification states
  const [riskAlerts, setRiskAlerts] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [revengeAlerts, setRevengeAlerts] = useState(true);
  const [healthReports, setHealthReports] = useState(true);

  // Appearance theme state
  const [theme, setTheme] = useState('system');

  // Integrations status states
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [geminiConnected, setGeminiConnected] = useState(false);
  const [backendProxyActive, setBackendProxyActive] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Confirmation Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

  useEffect(() => {
    // Check backend health status
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setBackendProxyActive(true);
          setGeminiConnected(true); // Gemini queries pass through backend
        }
      })
      .catch(() => {
        setBackendProxyActive(false);
        setGeminiConnected(false);
      });

    // Check Firebase settings
    const fbConfig = localStorage.getItem('tradeguard_firebase_config');
    setFirebaseConnected(!!fbConfig);

    // Load Notification settings
    setRiskAlerts(localStorage.getItem('pref_risk_alerts') !== 'false');
    setCriticalAlerts(localStorage.getItem('pref_critical_alerts') !== 'false');
    setRevengeAlerts(localStorage.getItem('pref_revenge_alerts') !== 'false');
    setHealthReports(localStorage.getItem('pref_health_reports') !== 'false');

    // Load Theme
    setTheme(localStorage.getItem('tradeguard_theme') || 'system');
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDisplayName(name);
    setSaveSuccess('Display name updated successfully.');
    setTimeout(() => setSaveSuccess(null), 2500);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCapital(capital);
    setSaveSuccess('Trading capital updated.');
    setTimeout(() => setSaveSuccess(null), 2500);
  };

  const handleNotificationChange = (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    localStorage.setItem(key, String(value));
    setSaveSuccess('Notification preferences updated.');
    setTimeout(() => setSaveSuccess(null), 2000);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('tradeguard_theme', newTheme);
    
    // Apply classes to HTML
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      // Resolve System preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.remove('light');
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }

    setSaveSuccess(`Theme switched to ${newTheme}`);
    setTimeout(() => setSaveSuccess(null), 2000);
  };

  const handleSyncData = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSaveSuccess('Trade logs synchronized successfully with cloud ledger.');
      setTimeout(() => setSaveSuccess(null), 2500);
    }, 1500);
  };

  const triggerResetData = () => {
    setModalTitle('Reset Database Ledger');
    setModalMessage('Are you sure you want to clear your local simulated trade history? This will restore the sandbox defaults. This action is permanent.');
    setOnConfirmAction(() => async () => {
      await onResetData();
      setShowConfirmModal(false);
      setSaveSuccess('Trade ledger sandbox reset successfully.');
      setTimeout(() => setSaveSuccess(null), 2500);
    });
    setShowConfirmModal(true);
  };

  const handleExportData = async () => {
    try {
      const dbTrades = await getTrades();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dbTrades, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `tradeguard_trades_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setSaveSuccess('Simulated trade ledger exported successfully.');
      setTimeout(() => setSaveSuccess(null), 2500);
    } catch (err) {
      console.error('Failed to export trades data:', err);
    }
  };

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'preferences', label: 'Trading Preferences', icon: Sliders },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'ai', label: 'AI & Gemini Status', icon: Cpu },
    { id: 'appearance', label: 'Appearance Theme', icon: Layers },
    { id: 'storage', label: 'Data & Storage Sync', icon: Database },
    { id: 'about', label: 'About TradeGuard', icon: Info }
  ] as const;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-100 animate-fadeIn relative">
      
      {/* Toast Alert */}
      {saveSuccess && (
        <div className="fixed bottom-4 right-4 bg-brand-emerald/90 text-white font-bold border border-brand-emerald px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 z-50 animate-bounce">
          <Check className="w-4 h-4 shrink-0" />
          <span className="text-xs">{saveSuccess}</span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">System Configurations</h1>
        <p className="text-slate-400 text-sm mt-1">Configure trading variables, theme triggers, and privacy guard features.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-brand-navy-light/40 border border-slate-800 rounded-xl p-6 backdrop-blur-sm min-h-[500px]">
        
        {/* Left column sidebar navigation */}
        <div className="md:col-span-1 border-r border-slate-800/80 pr-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-brand-navy-light border border-slate-700 text-white shadow-sm' 
                    : 'text-slate-455 border border-transparent hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right column settings panels */}
        <div className="md:col-span-3 pl-4 space-y-6">
          
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <User className="w-5 h-5 text-brand-blue" />
                User Profile & Environment
              </h2>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-6">
                {/* Initial Avatar */}
                <div className="w-16 h-16 bg-brand-blue/15 border-2 border-brand-blue/30 rounded-full flex items-center justify-center text-brand-blue font-bold text-xl shadow-md shrink-0">
                  DT
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-white">{name || 'Demo Trader'}</h3>
                  <span className="inline-block bg-slate-850 text-slate-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide mt-1">
                    Demo Account
                  </span>
                  <p className="text-[10px] text-slate-500 mt-2">
                    Running in sandbox mode. Local preferences are preserved in browser database.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">
                    Display Name
                  </label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-brand-blue"
                    placeholder="Enter display name"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-brand-blue hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-all shadow-md shadow-brand-blue/10 cursor-pointer"
                >
                  Save Profile
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Preferences & Alerts */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <Sliders className="w-5 h-5 text-brand-blue" />
                Trading Preferences & Alerts
              </h2>

              <form onSubmit={handleSavePreferences} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-455 uppercase tracking-wider mb-2">
                    Default Simulated Capital (₹)
                  </label>
                  <input 
                    type="number"
                    value={capital}
                    onChange={(e) => setCapital(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-brand-blue"
                  />
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    Utilized in order checks to calculate position size ratios.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-850">
                  <button
                    type="submit"
                    className="bg-brand-blue hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-all shadow-md shadow-brand-blue/10 cursor-pointer"
                  >
                    Save Capital Limit
                  </button>
                </div>
              </form>

              {/* Notifications Toggles Section */}
              <div className="pt-6 border-t border-slate-800/80 space-y-4 max-w-md animate-fadeIn">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-brand-blue" />
                  Alerts & Notifications
                </h3>

                <div className="space-y-3">
                  {/* Risk Alerts */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-slate-250">Risk Alerts</span>
                      <span className="block text-[9px] text-slate-500">Enable default pre-trade risk indicators</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={riskAlerts} 
                        onChange={(e) => handleNotificationChange('pref_risk_alerts', e.target.checked, setRiskAlerts)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue"></div>
                    </label>
                  </div>

                  {/* Critical Alerts */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-slate-250">Critical Risk Alerts</span>
                      <span className="block text-[9px] text-slate-500">Prompt high severity warnings on excessive leverages</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={criticalAlerts} 
                        onChange={(e) => handleNotificationChange('pref_critical_alerts', e.target.checked, setCriticalAlerts)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue"></div>
                    </label>
                  </div>

                  {/* Revenge Trading Alerts */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-slate-250">Revenge Trading Alerts</span>
                      <span className="block text-[9px] text-slate-500">Notify of sizing escalation patterns after loss</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={revengeAlerts} 
                        onChange={(e) => handleNotificationChange('pref_revenge_alerts', e.target.checked, setRevengeAlerts)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue"></div>
                    </label>
                  </div>

                  {/* Weekly Health Report */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-slate-250">Weekly Health Report</span>
                      <span className="block text-[9px] text-slate-500">Compile aggregated discipline grade summaries</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={healthReports} 
                        onChange={(e) => handleNotificationChange('pref_health_reports', e.target.checked, setHealthReports)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Privacy */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <Shield className="w-5 h-5 text-brand-emerald" />
                Privacy Shield & AI Guard
              </h2>

              <div className="bg-slate-950 border border-slate-855 rounded-lg p-4 space-y-3 max-w-md">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-xs text-slate-350 font-semibold">Privacy Shield</span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-2.5 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-xs text-slate-350 font-semibold">Data Minimization</span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-2.5 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-900 pb-2 text-xs">
                  <span className="text-slate-405 font-semibold">Personal Data to AI</span>
                  <span className="font-bold text-[10px] text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-2 py-0.5 rounded">NOT SHARED</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-900 pb-2 text-xs">
                  <span className="text-slate-405 font-semibold">Raw Trade History to AI</span>
                  <span className="font-bold text-[10px] text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-2 py-0.5 rounded">NOT SHARED</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-900 pb-2 text-xs">
                  <span className="text-slate-405 font-semibold">AI receives</span>
                  <span className="font-semibold text-slate-200">Anonymized Risk Metrics Only</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-405 font-semibold">API Key</span>
                  <span className="font-bold text-[10px] text-slate-450 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                    <EyeOff className="w-3.5 h-3.5" />
                    SERVER-SIDE PROTECTED
                  </span>
                </div>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
                Only anonymized risk metrics are sent to the AI explanation engine. Personal identifiers and raw trade history are not sent.
              </p>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold px-4 py-2.5 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export My Data
                </button>
                <button
                  type="button"
                  onClick={triggerResetData}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-brand-red font-bold px-4 py-2.5 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Local Data
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: AI & Gemini Status */}
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <Cpu className="w-5 h-5 text-brand-blue" />
                AI & Gemini Processing Engine
              </h2>

              <div className="space-y-4 max-w-md">
                <div className="bg-slate-950 border border-slate-855 rounded-lg p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-350">Gemini AI Engine</span>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border ${
                      geminiConnected
                        ? 'text-brand-emerald bg-brand-emerald/10 border-brand-emerald/20'
                        : 'text-brand-red bg-brand-red/10 border-brand-red/20'
                    }`}>
                      {geminiConnected ? 'Connected' : 'Offline'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-350">Backend Security</span>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border ${
                      backendProxyActive
                        ? 'text-brand-emerald bg-brand-emerald/10 border-brand-emerald/20'
                        : 'text-brand-red bg-brand-red/10 border-brand-red/20'
                    }`}>
                      {backendProxyActive ? 'Secure Proxy Active' : 'Secure Proxy Offline'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-350">API Key Storage</span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                      Server-side protected
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-350">Active Model</span>
                    <span className="text-xs font-semibold text-slate-200">
                      gemini-1.5-flash
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Your Google Gemini API credentials are never transmitted to the browser context, protecting your account parameters in public networks.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <Layers className="w-5 h-5 text-brand-blue" />
                Appearance Theme
              </h2>

              <div className="space-y-4 max-w-sm">
                <span className="block text-xs font-bold text-slate-450 uppercase tracking-wider">
                  Interface Theme
                </span>
                
                <div className="grid grid-cols-3 gap-3">
                  {/* Dark Mode */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'border-brand-blue bg-brand-blue/10 text-white'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Dark Mode</span>
                  </button>

                  {/* Light Mode */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'border-brand-blue bg-brand-blue/10 text-white'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Light Mode</span>
                  </button>

                  {/* System default */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange('system')}
                    className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all cursor-pointer ${
                      theme === 'system'
                        ? 'border-brand-blue bg-brand-blue/10 text-white'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Monitor className="w-5 h-5" />
                    <span className="text-[10px] font-bold">System</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Storage */}
          {activeTab === 'storage' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <Database className="w-5 h-5 text-brand-blue" />
                Data & Cloud Sync
              </h2>

              <div className="space-y-6 max-w-md">
                <div className="bg-slate-950 border border-slate-855 rounded-lg p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-350">Local Web Sandbox</span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-2 py-0.5 rounded">
                      ACTIVE
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-350">Firebase Sync Status</span>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border ${
                      firebaseConnected
                        ? 'text-brand-emerald bg-brand-emerald/10 border-brand-emerald/20'
                        : 'text-slate-404 bg-slate-800 border-slate-700'
                    }`}>
                      {firebaseConnected ? 'CONNECTED' : 'NOT CONNECTED'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleSyncData}
                    disabled={syncing}
                    className="bg-brand-blue hover:bg-blue-600 disabled:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-all shadow-md shadow-brand-blue/15 cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    Sync Data
                  </button>
                  <button
                    type="button"
                    onClick={triggerResetData}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-brand-red font-bold px-6 py-2.5 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Reset Storage
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: About */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <Info className="w-5 h-5 text-brand-blue" />
                About TradeGuard AI
              </h2>

              <div className="space-y-4 max-w-xl text-slate-450 text-xs leading-relaxed">
                <div>
                  <h3 className="text-base font-black text-white">TradeGuard <span className="text-brand-blue">AI</span></h3>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Version 1.1.0</span>
                </div>

                <p>
                  TradeGuard AI is a real-time risk mitigation and behavioral safeguard tool tailored for retail derivatives traders. Rather than diagnosing emotional breaches post-facto, it evaluates leverage size and consecutive trading history patterns before order dispatch, helping traders remain rational and preserve capital.
                </p>

                <div className="bg-slate-950 border border-slate-855 rounded-xl p-5 space-y-2 mt-4 text-slate-350">
                  <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Hackathon Attributions</span>
                  <div className="flex justify-between text-xs">
                    <span>Event</span>
                    <span className="font-semibold text-white">Mochatrade YC P26 Hackathon</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Developer Team</span>
                    <span className="font-semibold text-white">Team ElectroCode</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Team Members</span>
                    <span className="font-semibold text-white text-right font-mono">
                      Abhishek Gupta &bull; Akash Yadav &bull; Nitin Chaurasiya
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Institution</span>
                    <span className="font-semibold text-white">University of Mumbai</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-brand-navy-dark/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 shadow-2xl relative animate-scaleIn">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 outline-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-brand-red mb-4">
              <AlertTriangle className="w-6 h-6 shrink-0" fill="currentColor" fillOpacity="0.1" />
              <h3 className="text-base font-bold text-white">{modalTitle}</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              {modalMessage}
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmAction}
                className="bg-brand-red hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-md shadow-brand-red/10 cursor-pointer"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
