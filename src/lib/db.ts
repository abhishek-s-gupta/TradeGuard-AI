import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  writeBatch,
  doc
} from 'firebase/firestore';
import type { Trade } from '../types/trading';
import { getDemoTrades } from './demoData';

// Helper to get Firebase configuration
export function getFirebaseConfig() {
  const configStr = localStorage.getItem('tradeguard_firebase_config');
  if (!configStr) return null;
  try {
    return JSON.parse(configStr);
  } catch {
    return null;
  }
}

// Initialize Firestore if config is present
let firestoreDb: any = null;
export function getDb() {
  if (firestoreDb) return firestoreDb;
  const config = getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) return null;
  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    firestoreDb = getFirestore(app);
    return firestoreDb;
  } catch (err) {
    console.error('Failed to initialize Firebase app:', err);
    return null;
  }
}

const LOCAL_TRADES_KEY = 'tradeguard_trades';
const LOCAL_CAPITAL_KEY = 'tradeguard_capital';

export async function getTrades(): Promise<Trade[]> {
  const db = getDb();
  if (db) {
    try {
      const q = query(collection(db, 'trades'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const trades: Trade[] = [];
      querySnapshot.forEach((doc) => {
        trades.push({ id: doc.id, ...doc.data() } as Trade);
      });
      if (trades.length > 0) {
        // Also keep localStorage in sync
        localStorage.setItem(LOCAL_TRADES_KEY, JSON.stringify(trades));
        return trades;
      }
    } catch (err) {
      console.warn('Firebase read failed, using localStorage:', err);
    }
  }

  // Fallback to localStorage
  const localStr = localStorage.getItem(LOCAL_TRADES_KEY);
  if (localStr) {
    try {
      return JSON.parse(localStr);
    } catch {
      return [];
    }
  }

  // Seed demo data if first time
  const demoTrades = getDemoTrades();
  localStorage.setItem(LOCAL_TRADES_KEY, JSON.stringify(demoTrades));
  return demoTrades;
}

export async function saveTrade(trade: Trade): Promise<void> {
  // 1. Save to LocalStorage
  const localTrades = await getTrades();
  // Avoid duplicate ID if it exists
  const filtered = localTrades.filter(t => t.id !== trade.id);
  const updated = [trade, ...filtered];
  localStorage.setItem(LOCAL_TRADES_KEY, JSON.stringify(updated));

  // 2. Save to Firebase if configured
  const db = getDb();
  if (db) {
    try {
      await addDoc(collection(db, 'trades'), trade);
    } catch (err) {
      console.error('Failed to save trade to Firebase:', err);
    }
  }
}

export async function clearTrades(): Promise<void> {
  localStorage.removeItem(LOCAL_TRADES_KEY);
  
  const db = getDb();
  if (db) {
    try {
      const q = query(collection(db, 'trades'));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach((document) => {
        batch.delete(doc(db, 'trades', document.id));
      });
      await batch.commit();
    } catch (err) {
      console.error('Failed to clear Firebase trades:', err);
    }
  }

  // Reload demo trades
  const demoTrades = getDemoTrades();
  localStorage.setItem(LOCAL_TRADES_KEY, JSON.stringify(demoTrades));
}

export function getUserCapital(): number {
  const cap = localStorage.getItem(LOCAL_CAPITAL_KEY);
  if (cap) {
    const val = parseFloat(cap);
    if (!isNaN(val)) return val;
  }
  return 100000; // Default 1 Lakh Rupees
}

export function saveUserCapital(capital: number): void {
  localStorage.setItem(LOCAL_CAPITAL_KEY, capital.toString());
}
