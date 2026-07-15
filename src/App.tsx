import { useState, useEffect } from 'react';
import { Item, Market, Promotion, Settings, AppContextType } from './types';
import { ListaCompras } from './components/ListaCompras';
import { Promocoes } from './components/Promocoes';
import { ModoCompra } from './components/ModoCompra';
import { MenuExtra } from './components/MenuExtra';
import { Roteiro } from './components/Roteiro';
import { AuthUI } from './components/Auth';
import { InstallPWA } from './components/InstallPWA';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { ListTodo, Tags, ShoppingCart, Settings as SettingsIcon, Map } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [items, setItems] = useState<Item[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [settings, setSettings] = useState<Settings>({ budget: 0, darkMode: false });
  const [activeTab, setActiveTab] = useState<'lista' | 'roteiro' | 'promocoes' | 'compras' | 'extras'>('lista');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync data with Supabase when session changes
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;
      
      const { data: sData } = await supabase.from('settings').select('*').eq('user_id', session.user.id).single();
      if (sData) {
        setSettings({ budget: sData.budget, darkMode: sData.dark_mode });
      } else {
        await supabase.from('settings').insert({ budget: 0, dark_mode: false });
      }

      const { data: iData } = await supabase.from('items').select('*').order('created_at');
      if (iData) {
        setItems(iData.map(i => ({
          id: i.id,
          name: i.name,
          qty: Number(i.qty),
          unit: i.unit as any,
          category: i.category as any,
          isEssential: i.is_essential,
          onlyPromo: i.only_promo,
          isBought: i.is_bought,
          notes: i.notes,
          actualPrice: i.actual_price ? Number(i.actual_price) : undefined
        })));
      }

      const { data: mData } = await supabase.from('markets').select('*').order('created_at');
      if (mData) setMarkets(mData.map(m => ({ id: m.id, name: m.name })));

      const { data: pData } = await supabase.from('promotions').select('*').order('created_at');
      if (pData) {
        setPromotions(pData.map(p => ({
          id: p.id,
          marketId: p.market_id,
          itemName: p.item_name,
          price: Number(p.price),
          qty: Number(p.qty),
          unit: p.unit as any,
          expiryDate: p.expiry_date,
          notes: p.notes
        })));
      }
    };

    fetchData();
  }, [session]);

  const updateSetting = async (key: string, value: any) => {
    if (!session?.user) return;
    await supabase.from('settings').update({ [key]: value }).eq('user_id', session.user.id);
  }

  // Effect specifically for darkMode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#1C1C1E';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F2F2F7'; // zinc-50 theme equivalent
    }
  }, [settings.darkMode]);

  const handleSetSettings = (newSettings: React.SetStateAction<Settings>) => {
    setSettings((prev) => {
      const next = typeof newSettings === 'function' ? newSettings(prev) : newSettings;
      updateSetting('budget', next.budget);
      updateSetting('dark_mode', next.darkMode);
      return next;
    });
  };

  const syncItems = async (newItems: typeof items) => {
    if (!session?.user) return;
    const itemsToUpsert = newItems.map(i => ({
      id: i.id,
      user_id: session.user.id,
      name: i.name,
      qty: i.qty,
      unit: i.unit,
      category: i.category,
      is_essential: i.isEssential || false,
      only_promo: i.onlyPromo || false,
      is_bought: i.isBought || false,
      notes: i.notes || null,
      actual_price: i.actualPrice || null
    }));
    
    // very naïve sync for this example: upsert everything, and also delete removed items
    const currentIds = newItems.map(i => i.id);
    const { data: existingIds } = await supabase.from('items').select('id');
    const idsToDelete = existingIds?.map(e => e.id).filter(id => !currentIds.includes(id)) || [];
    
    if (itemsToUpsert.length > 0) {
      await supabase.from('items').upsert(itemsToUpsert);
    }
    if (idsToDelete.length > 0) {
      await supabase.from('items').delete().in('id', idsToDelete);
    }
  };

  const handleSetItems = (newItemsOrCb: React.SetStateAction<Item[]>) => {
    setItems((prev) => {
      const next = typeof newItemsOrCb === 'function' ? newItemsOrCb(prev) : newItemsOrCb;
      syncItems(next);
      return next;
    });
  }

  const syncMarkets = async (newMarkets: typeof markets) => {
    if (!session?.user) return;
    const marketsToUpsert = newMarkets.map(m => ({ id: m.id, user_id: session.user.id, name: m.name }));
    const currentIds = newMarkets.map(m => m.id);
    const { data: existingIds } = await supabase.from('markets').select('id');
    const idsToDelete = existingIds?.map(e => e.id).filter(id => !currentIds.includes(id)) || [];
    
    if (marketsToUpsert.length > 0) await supabase.from('markets').upsert(marketsToUpsert);
    if (idsToDelete.length > 0) await supabase.from('markets').delete().in('id', idsToDelete);
  };

  const handleSetMarkets = (newMarketsOrCb: React.SetStateAction<Market[]>) => {
    setMarkets((prev) => {
      const next = typeof newMarketsOrCb === 'function' ? newMarketsOrCb(prev) : newMarketsOrCb;
      syncMarkets(next);
      return next;
    });
  }

  const syncPromotions = async (newPromos: typeof promotions) => {
    if (!session?.user) return;
    const promosToUpsert = newPromos.map(p => ({
      id: p.id,
      user_id: session.user.id,
      market_id: p.marketId,
      item_name: p.itemName,
      price: p.price,
      qty: p.qty,
      unit: p.unit,
      expiry_date: p.expiryDate || null,
      notes: p.notes || null
    }));
    const currentIds = newPromos.map(p => p.id);
    const { data: existingIds } = await supabase.from('promotions').select('id');
    const idsToDelete = existingIds?.map(e => e.id).filter(id => !currentIds.includes(id)) || [];
    
    if (promosToUpsert.length > 0) await supabase.from('promotions').upsert(promosToUpsert);
    if (idsToDelete.length > 0) await supabase.from('promotions').delete().in('id', idsToDelete);
  };

  const handleSetPromotions = (newPromosOrCb: React.SetStateAction<Promotion[]>) => {
    setPromotions((prev) => {
      const next = typeof newPromosOrCb === 'function' ? newPromosOrCb(prev) : newPromosOrCb;
      syncPromotions(next);
      return next;
    });
  }

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 flex items-center justify-center p-4"></div>;
  }

  if (!session) {
    return <AuthUI />;
  }

  const context: AppContextType = { 
    items, setItems: handleSetItems, 
    markets, setMarkets: handleSetMarkets, 
    promotions, setPromotions: handleSetPromotions, 
    settings, setSettings: handleSetSettings, 
    setActiveTab 
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors font-sans text-zinc-900 dark:text-zinc-100 flex flex-col">
      <main className="w-full max-w-lg mx-auto flex-1 relative mb-20 bg-zinc-50 dark:bg-black">
        
        {activeTab === 'lista' && <ListaCompras context={context} />}
        {activeTab === 'roteiro' && <Roteiro context={context} />}
        {activeTab === 'promocoes' && <Promocoes context={context} />}
        {activeTab === 'compras' && <ModoCompra context={context} />}
        {activeTab === 'extras' && <MenuExtra context={context} />}

      </main>

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[zinc-900]/80 backdrop-blur-lg border-t border-zinc-200 dark:border-[zinc-800] px-1 py-3 z-50 flex justify-center max-w-lg mx-auto md:rounded-t-2xl">
        <div className="flex justify-around w-full max-w-[450px]">
          <NavButton active={activeTab === 'lista'} onClick={() => setActiveTab('lista')} icon={<ListTodo size={22} />} label="Lista" />
          <NavButton active={activeTab === 'roteiro'} onClick={() => setActiveTab('roteiro')} icon={<Map size={22} />} label="Rota" />
          <NavButton active={activeTab === 'promocoes'} onClick={() => setActiveTab('promocoes')} icon={<Tags size={22} />} label="Promoções" />
          <NavButton active={activeTab === 'compras'} onClick={() => setActiveTab('compras')} icon={<ShoppingCart size={22} />} label="Comprar" primary />
          <NavButton active={activeTab === 'extras'} onClick={() => setActiveTab('extras')} icon={<SettingsIcon size={22} />} label="Definições" />
        </div>
      </nav>
      <InstallPWA />
    </div>
  );
}

function NavButton({ active, onClick, icon, label, primary }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-[68px] gap-1 transition-all ${
        primary 
          ? 'text-white' 
          : active 
            ? 'text-blue-600 dark:text-blue-500 font-semibold transform scale-110' 
            : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
      }`}
    >
      <div className={`${primary ? 'bg-blue-600 dark:bg-blue-500 p-3 rounded-2xl mb-1 transform -translate-y-2' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] uppercase tracking-wider leading-none whitespace-nowrap ${primary ? 'text-blue-600 dark:text-blue-500 font-semibold -mt-2' : ''}`}>{label}</span>
    </button>
  );
}
