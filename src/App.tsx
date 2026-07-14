import React, { useState, useEffect, useRef } from 'react';
import { Item, Market, Promotion, Settings, AppContextType, HistoryItem } from './types';
import { ListaCompras } from './components/ListaCompras';
import { Promocoes } from './components/Promocoes';
import { ModoCompra } from './components/ModoCompra';
import { MenuExtra } from './components/MenuExtra';
import { Roteiro } from './components/Roteiro';
import { AuthUI } from './components/Auth';
import {
  User, apiGetMe, apiLogout, apiGetSettings, apiSaveSettings,
  apiGetItems, apiSyncItems, apiGetMarkets, apiSyncMarkets,
  apiGetPromotions, apiSyncPromotions,
} from './lib/api';
import { ListTodo, Tags, ShoppingCart, Settings as SettingsIcon, Map } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const saved = localStorage.getItem('market_pro_promotions');
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      return parsed.filter((p: Promotion) => !p.expiryDate || p.expiryDate >= today);
    }
    return [];
  });
  const [settings, setSettings] = useState<Settings>({ budget: 0, darkMode: false });
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('market_pro_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [shoppingMarketId, setShoppingMarketId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'lista' | 'roteiro' | 'promocoes' | 'compras' | 'extras'>('lista');

  useEffect(() => { localStorage.setItem('market_pro_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('market_pro_promotions', JSON.stringify(promotions)); }, [promotions]);

  useEffect(() => {
    apiGetMe().then((u) => { setUser(u); setIsLoadingAuth(false); });
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [sData, iData, mData, pData] = await Promise.all([
          apiGetSettings(), apiGetItems(), apiGetMarkets(), apiGetPromotions(),
        ]);
        if (sData) setSettings({ budget: Number(sData.budget), darkMode: sData.dark_mode });
        if (iData) setItems(iData.map((i: any) => ({
          id: i.id, name: i.name, qty: Number(i.qty), unit: i.unit as any,
          category: i.category as any, isEssential: i.is_essential,
          onlyPromo: i.only_promo, isBought: i.is_bought,
          notes: i.notes || '', actualPrice: i.actual_price ? Number(i.actual_price) : 0,
        })));
        if (mData) setMarkets(mData.map((m: any) => ({ id: m.id, name: m.name })));
        if (pData) {
          const today = new Date().toISOString().split('T')[0];
          setPromotions(pData
            .filter((p: any) => !p.expiry_date || p.expiry_date >= today)
            .map((p: any) => ({
              id: p.id, marketId: p.market_id, itemName: p.item_name,
              price: Number(p.price), qty: Number(p.qty), unit: p.unit as any,
              expiryDate: p.expiry_date || '', notes: p.notes || '',
            })));
        }
      } catch (err) { console.error('Erro ao carregar dados:', err); }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#18181b';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F7F8F8';
    }
  }, [settings.darkMode]);

  const handleSetSettings = (newSettings: React.SetStateAction<Settings>) => {
    setSettings((prev) => {
      const next = typeof newSettings === 'function' ? newSettings(prev) : newSettings;
      apiSaveSettings(next.budget, next.darkMode);
      return next;
    });
  };

  // SYNC ITEMS (debounce 800ms)
  const syncItemsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleSetItems = (newItemsOrCb: React.SetStateAction<Item[]>) => {
    setItems((prev) => {
      const next = typeof newItemsOrCb === 'function' ? newItemsOrCb(prev) : newItemsOrCb;
      if (syncItemsTimeoutRef.current) clearTimeout(syncItemsTimeoutRef.current);
      syncItemsTimeoutRef.current = setTimeout(() => {
        if (!user) return;
        const payload = next.map(i => ({
          id: i.id, name: i.name, qty: i.qty, unit: i.unit, category: i.category,
          is_essential: i.isEssential || false, only_promo: i.onlyPromo || false,
          is_bought: i.isBought || false, notes: i.notes || null, actual_price: i.actualPrice || null,
        }));
        apiSyncItems(payload);
      }, 800);
      return next;
    });
  };

  // SYNC MARKETS (debounce 800ms)
  const syncMarketsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleSetMarkets = (newMarketsOrCb: React.SetStateAction<Market[]>) => {
    setMarkets((prev) => {
      const next = typeof newMarketsOrCb === 'function' ? newMarketsOrCb(prev) : newMarketsOrCb;
      if (syncMarketsTimeoutRef.current) clearTimeout(syncMarketsTimeoutRef.current);
      syncMarketsTimeoutRef.current = setTimeout(() => {
        if (!user) return;
        apiSyncMarkets(next.map(m => ({ id: m.id, name: m.name })));
      }, 800);
      return next;
    });
  };

  // SYNC PROMOTIONS (debounce 800ms)
  const syncPromotionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleSetPromotions = (newPromosOrCb: React.SetStateAction<Promotion[]>) => {
    setPromotions((prev) => {
      const next = typeof newPromosOrCb === 'function' ? newPromosOrCb(prev) : newPromosOrCb;
      if (syncPromotionsTimeoutRef.current) clearTimeout(syncPromotionsTimeoutRef.current);
      syncPromotionsTimeoutRef.current = setTimeout(() => {
        if (!user) return;
        const payload = next.map(p => ({
          id: p.id, market_id: p.marketId, item_name: p.itemName, price: p.price,
          qty: p.qty, unit: p.unit, expiry_date: p.expiryDate || null, notes: p.notes || null,
        }));
        apiSyncPromotions(payload);
      }, 800);
      return next;
    });
  };

  const handleLogout = async () => {
    await apiLogout();
    setUser(null); setItems([]); setMarkets([]); setPromotions([]);
    setSettings({ budget: 0, darkMode: false });
  };

  if (isLoadingAuth) return <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex items-center justify-center" />;
  if (!user) return <AuthUI onAuth={setUser} />;

  const context: AppContextType = {
    items, setItems: handleSetItems,
    markets, setMarkets: handleSetMarkets,
    promotions, setPromotions: handleSetPromotions,
    settings, setSettings: handleSetSettings,
    history, setHistory,
    shoppingMarketId, setShoppingMarketId,
    setActiveTab,
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-100 dark:bg-black font-sans text-soft-text-main dark:text-zinc-100 flex justify-center">
      <div className="w-full max-w-md bg-soft-bg dark:bg-zinc-900 min-h-[100dvh] relative shadow-2xl flex flex-col overflow-x-hidden">
        <main className="flex-1 relative pb-24">
          {activeTab === 'lista' && <ListaCompras context={context} />}
          {activeTab === 'roteiro' && <Roteiro context={context} />}
          {activeTab === 'promocoes' && <Promocoes context={context} />}
          {activeTab === 'compras' && <ModoCompra context={context} />}
          {activeTab === 'extras' && <MenuExtra context={context} onLogout={handleLogout} />}
        </main>

        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 px-2 py-2 z-50 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-5 w-full items-center">
            <NavButton active={activeTab === 'lista'} onClick={() => setActiveTab('lista')} icon={<ListTodo size={24} />} label="Lista" />
            <NavButton active={activeTab === 'roteiro'} onClick={() => setActiveTab('roteiro')} icon={<Map size={24} />} label="Rota" />
            <NavButton active={activeTab === 'promocoes'} onClick={() => setActiveTab('promocoes')} icon={<Tags size={24} />} label="Ofertas" />
            <NavButton active={activeTab === 'compras'} onClick={() => setActiveTab('compras')} icon={<ShoppingCart size={24} />} label="Comprar" />
            <NavButton active={activeTab === 'extras'} onClick={() => setActiveTab('extras')} icon={<SettingsIcon size={24} />} label="Config" />
          </div>
        </nav>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center justify-center w-full gap-1 pt-1.5 pb-1 transition-colors ${active ? 'text-emerald-500 font-bold' : 'text-zinc-400 dark:text-zinc-500 font-medium'}`}>
      <div className={active ? 'transform scale-110 transition-transform' : ''}>{icon}</div>
      <span className="text-[10px] uppercase tracking-wide leading-none whitespace-nowrap">{label}</span>
    </button>
  );
}
