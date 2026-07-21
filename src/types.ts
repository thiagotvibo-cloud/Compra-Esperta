import React from 'react';

export type Category = string;
export type Unit = 'kg' | 'g' | 'L' | 'ml' | 'un' | 'pct';

export interface Item {
 id: string;
 name: string;
 qty: number;
 unit: Unit;
 category: Category;
 isEssential: boolean;
 onlyPromo: boolean; // Só comprar se tiver promoção
 isBought: boolean;
 notes: string;
 actualPrice?: number; // Para ser preenchido durante o Modo Compra
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
 streak: number;
 totalSaved: number;
 lastActiveDate: string;
 purchaseCount: number;
}

export interface HistoryItem {
 id: string;
 date: string;
 marketId: string | null;
 totalSpent: number;
 economyGenerated: number;
 items: { nome: string; quantidade: number; subtotal: number}[];
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

