import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { RiskCheck } from './components/RiskCheck';
import { TradeHistory } from './components/TradeHistory';
import { HealthReport } from './components/HealthReport';
import { Settings } from './components/Settings';
import type { Trade } from './types/trading';
import { 
  getTrades, 
  saveTrade, 
  clearTrades, 
  getUserCapital, 
  saveUserCapital 
} from './lib/db';

const applyTheme = (theme: string) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.remove('light');
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    // System default theme resolution
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (systemPrefersDark) {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }
};

function App() {
  const [activePage, setActivePage] = useState<string>('landing');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [capital, setCapital] = useState<number>(100000);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Load database tables and check theme/auth session
  const loadDatabase = async () => {
    setLoading(true);
    try {
      const dbTrades = await getTrades();
      setTrades(dbTrades);
      const dbCapital = getUserCapital();
      setCapital(dbCapital);
      
      const cachedUser = localStorage.getItem('tradeguard_user');
      if (cachedUser) {
        setCurrentUser(cachedUser);
      }

      // Load and apply theme configs
      const cachedTheme = localStorage.getItem('tradeguard_theme') || 'system';
      applyTheme(cachedTheme);
    } catch (err) {
      console.error('Failed to load database state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  // System theme changes listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      const currentTheme = localStorage.getItem('tradeguard_theme') || 'system';
      if (currentTheme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const handleNavigate = (page: string) => {
    // Activate profile session automatically when entering the app
    const isInnerPage = ['dashboard', 'risk-check', 'history', 'health-report', 'settings'].includes(page);
    if (!currentUser && isInnerPage) {
      const defaultUser = 'Demo Trader';
      setCurrentUser(defaultUser);
      localStorage.setItem('tradeguard_user', defaultUser);
    }
    setActivePage(page);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('tradeguard_user');
    setActivePage('landing');
  };

  const handleSaveTrade = async (newTrade: Trade) => {
    await saveTrade(newTrade);
    const dbTrades = await getTrades();
    setTrades(dbTrades);
  };

  const handleUpdateCapital = (newCapital: number) => {
    saveUserCapital(newCapital);
    setCapital(newCapital);
  };

  const handleUpdateDisplayName = (name: string) => {
    setCurrentUser(name);
    localStorage.setItem('tradeguard_user', name);
  };

  const handleResetData = async () => {
    await clearTrades();
    const dbTrades = await getTrades();
    setTrades(dbTrades);
  };

  const handleTradeAdded = () => {
    setActivePage('history');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-navy-dark flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-4 border-slate-800 border-t-brand-blue rounded-full animate-spin mb-4"></div>
        <p className="font-semibold text-sm">Initializing Pre-Trade Guard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-navy-dark flex flex-col">
      {/* Navigation Header */}
      <Navbar 
        activePage={activePage} 
        onNavigate={handleNavigate} 
        trades={trades} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activePage === 'landing' && (
          <LandingPage onNavigate={handleNavigate} />
        )}
        
        {currentUser && (
          <>
            {activePage === 'dashboard' && (
              <Dashboard trades={trades} onNavigate={handleNavigate} />
            )}
            
            {activePage === 'risk-check' && (
              <RiskCheck 
                trades={trades}
                capital={capital}
                onTradeAdded={handleTradeAdded}
                onSaveTrade={handleSaveTrade}
                onUpdateCapital={handleUpdateCapital}
              />
            )}
            
            {activePage === 'history' && (
              <TradeHistory 
                trades={trades} 
                onClearHistory={handleResetData} 
              />
            )}
            
            {activePage === 'health-report' && (
              <HealthReport trades={trades} />
            )}
            
            {activePage === 'settings' && (
              <Settings 
                capital={capital}
                onUpdateCapital={handleUpdateCapital}
                onResetData={handleResetData}
                displayName={currentUser || 'Demo Trader'}
                onUpdateDisplayName={handleUpdateDisplayName}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
