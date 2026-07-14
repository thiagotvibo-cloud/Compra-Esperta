const fs = require('fs');

const typesTs = `import React from 'react';

export type Category = string;
export type Unit = 'kg' | 'g' | 'L' | 'ml' | 'un' | 'pct';

export interface Item {
  id: string;
  name: string;
  qty: number;
  unit: Unit;
  category: Category;
  isEssential: boolean;
  onlyPromo: boolean;
  isBought: boolean;
  notes: string;
  actualPrice: number;
  isFavorite?: boolean;
  notFound?: boolean;
}

export interface Market {
  id: string;
  name: string;
}

export interface Promotion {
  id: string;
  marketId: string;
  itemName: string;
  price: number;
  qty: number;
  unit: Unit;
  expiryDate: string;
  notes: string;
}

export interface Settings {
  budget: number;
  darkMode: boolean;
}

export interface HistoryItem {
  id: string;
  date: string;
  marketId: string | null;
  totalSpent: number;
  economyGenerated: number;
  items: { nome: string; quantidade: number; subtotal: number }[];
}

export interface AppContextType {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  markets: Market[];
  setMarkets: React.Dispatch<React.SetStateAction<Market[]>>;
  promotions: Promotion[];
  setPromotions: React.Dispatch<React.SetStateAction<Promotion[]>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  shoppingMarketId: string;
  setShoppingMarketId: React.Dispatch<React.SetStateAction<string>>;
  setActiveTab: (tab: 'lista' | 'roteiro' | 'promocoes' | 'compras' | 'extras') => void;
}
`;

fs.writeFileSync('src/types.ts', typesTs);

const utilsTs = `import { Unit } from './types';

export const formatMoney = (val: number) => {
  if (isNaN(val)) return 'R$ 0,00';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const formatItemName = (name: string) => {
  return name.replace(/\\//g, '/\\u200B').replace(/-/g, '-\\u200B');
};

export const normalizeStr = (str: string) =>
  str.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").trim();

export const convertToBaseUnit = (qty: number, unit: Unit): { qty: number, unit: string } => {
  if (unit === 'g') return { qty: qty / 1000, unit: 'kg' };
  if (unit === 'ml') return { qty: qty / 1000, unit: 'L' };
  return { qty, unit };
};

export const getPricePerBaseUnit = (price: number, qty: number, unit: Unit) => {
  const base = convertToBaseUnit(qty, unit);
  if (base.qty === 0) return 0;
  return price / base.qty;
};

export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
`;

fs.writeFileSync('src/utils.ts', utilsTs);

const apiTs = `export interface User { id: string; email: string; }

export async function apiRegister(email: string, password: string): Promise<User> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao criar conta');
  return data.user;
}

export async function apiLogin(email: string, password: string): Promise<User> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao fazer login');
  return data.user;
}

export async function apiLogout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}

export async function apiGetMe(): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch { return null; }
}

export async function apiGetSettings(): Promise<{ budget: number; dark_mode: boolean } | null> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function apiSaveSettings(budget: number, darkMode: boolean): Promise<void> {
  await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ budget, dark_mode: darkMode }),
  });
}

export async function apiGetItems(): Promise<any[]> {
  try {
    const res = await fetch('/api/items');
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function apiSyncItems(items: any[]): Promise<void> {
  await fetch('/api/items/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
}

export async function apiGetMarkets(): Promise<any[]> {
  try {
    const res = await fetch('/api/markets');
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function apiSyncMarkets(markets: any[]): Promise<void> {
  await fetch('/api/markets/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ markets }),
  });
}

export async function apiGetPromotions(): Promise<any[]> {
  try {
    const res = await fetch('/api/promotions');
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function apiSyncPromotions(promotions: any[]): Promise<void> {
  await fetch('/api/promotions/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ promotions }),
  });
}
`;

fs.writeFileSync('src/lib/api.ts', apiTs);
