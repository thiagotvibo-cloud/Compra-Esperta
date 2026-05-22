import React, { useState, useEffect, useRef } from 'react';
import { Item, Market, Promotion, Settings, AppContextType } from './types';
import { ListaCompras } from './components/ListaCompras';
import { Promocoes } from './components/Promocoes';
import { ModoCompra } from './components/ModoCompra';
import { MenuExtra } from './components/MenuExtra';
import { Roteiro } from './components/Roteiro';
import { AuthUI } from './components/Auth';
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
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        // If there's an error fetching the session (e.g. Invalid Refresh Token), clear the auth state
        supabase.auth.signOut();
      }
      setSession(session);
      setIsLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleError = (context: string, error: any) => {
    console.error(`❌ Erro Supabase (${context}):`, error?.message, error?.details, error);
    
    // Ignore auth/JWT/Refresh token errors quietly instead of alerting the user, and sign out automatically.
    const msg = error?.message || '';
    if (msg.includes('JWT') || msg.includes('Refresh Token') || msg.includes('token') || error?.code === '401' || error?.code === '403') {
      supabase.auth.signOut();
      return;
    }

    alert(`Erro Supabase: ${context}\nDetalhes: ${error?.message || JSON.stringify(error)}`);
  };

  const isSyncingItems = useRef(false);
  const isSyncingMarkets = useRef(false);
  const isSyncingPromotions = useRef(false);

  // Sync data with Supabase when session changes
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;
      
      try {
        const { data: sData, error: sErr } = await supabase.from('settings').select('*').eq('user_id', session.user.id).single();
        if (sErr && sErr.code !== 'PGRST116') handleError('Buscar Settings', sErr);
        
        if (sData) {
          setSettings({ budget: sData.budget, darkMode: sData.dark_mode });
        } else if (!sErr || sErr.code === 'PGRST116') {
          const { error: insErr } = await supabase.from('settings').insert({ budget: 0, dark_mode: false, user_id: session.user.id });
          if (insErr) handleError('Criar Settings', insErr);
        }

        const { data: iData, error: iErr } = await supabase.from('items').select('*').order('created_at');
        if (iErr) handleError('Buscar Itens', iErr);
        else if (iData && !isSyncingItems.current) {
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

        const { data: mData, error: mErr } = await supabase.from('markets').select('*').order('created_at');
        if (mErr) handleError('Buscar Mercados', mErr);
        else if (mData && !isSyncingMarkets.current) setMarkets(mData.map(m => ({ id: m.id, name: m.name })));

        const { data: pData, error: pErr } = await supabase.from('promotions').select('*').order('created_at');
        if (pErr) handleError('Buscar Promoções', pErr);
        else if (pData && !isSyncingPromotions.current) {
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
      } catch (err) {
        handleError('Exceção no Fetch API', err);
      }
    };

    fetchData();

    if (session?.user) {
      let channel: ReturnType<typeof supabase.channel>;
      let retryTimeout: NodeJS.Timeout;

      const setupRealtime = () => {
        if (channel) supabase.removeChannel(channel);
        
        channel = supabase.channel('schema-db-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, fetchData)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'markets' }, fetchData)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'promotions' }, fetchData)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, fetchData)
          .subscribe((status, err: any) => {
            console.log(`🔌 Supabase Realtime Status: ${status}`);
            if (status === 'SUBSCRIBED') {
              console.log('✅ Conexão Realtime estabelecida com sucesso!');
            } else if (status === 'CLOSED') {
              console.warn('⚠️ Conexão Realtime foi fechada.');
            } else if (status === 'CHANNEL_ERROR') {
              const errMsg = err?.message || err;
              if (String(errMsg).includes('1006') || String(errMsg).includes('transport failure') || String(errMsg).includes('closed')) {
                console.warn(`⚠️ Conexão Realtime interrompida (${errMsg}). Pode ser oscilação de rede. Tentando novamente em breve...`);
              } else {
                console.warn('⚠️ Erro no canal Realtime:', err);
              }
              // Tentar reconectar em caso de erro no canal
              clearTimeout(retryTimeout);
              retryTimeout = setTimeout(setupRealtime, 5000);
            } else if (status === 'TIMED_OUT') {
              console.error('⏱️ Conexão Realtime esgotou o tempo limite.');
            }
          });
      };

      setupRealtime();
        
      return () => {
        clearTimeout(retryTimeout);
        if (channel) supabase.removeChannel(channel);
      }
    }
  }, [session]);

  const updateSetting = async (key: string, value: any) => {
    if (!session?.user) return;
    try {
      const { error } = await supabase.from('settings').update({ [key]: value }).eq('user_id', session.user.id);
      if (error) handleError(`Atualizar Configuração (${key})`, error);
    } catch (err) {
      handleError(`Exceção ao Atualizar (${key})`, err);
    }
  }

  // Effect specifically for darkMode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#1C1C1E';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F7F8F8'; // Cinza Gelo
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
    try {
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
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validItemsToUpsert = itemsToUpsert.filter(i => uuidRegex.test(i.id));
      
      const currentIds = newItems.map(i => i.id);
      const { data: existingIds, error: selectErr } = await supabase.from('items').select('id');
      if (selectErr) return handleError('Listar Itens para Sincronização', selectErr);

      const idsToDelete = existingIds?.map(e => e.id).filter(id => !currentIds.includes(id)) || [];
      
      if (validItemsToUpsert.length > 0) {
        const { error: upErr } = await supabase.from('items').upsert(validItemsToUpsert);
        if (upErr) handleError('Salvar/Atualizar Itens', upErr);
      }
      if (idsToDelete.length > 0) {
        const { error: delErr } = await supabase.from('items').delete().in('id', idsToDelete);
        if (delErr) handleError('Excluir Itens', delErr);
      }
    } catch (err) {
      handleError('Exceção ao Sincronizar Itens', err);
    }
  };

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSetItems = (newItemsOrCb: React.SetStateAction<Item[]>) => {
    isSyncingItems.current = true;
    setItems((prev) => {
      const next = typeof newItemsOrCb === 'function' ? newItemsOrCb(prev) : newItemsOrCb;
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        syncItems(next).finally(() => {
          setTimeout(() => { isSyncingItems.current = false; }, 2000);
        });
      }, 800);
      return next;
    });
  }

  const syncMarkets = async (newMarkets: typeof markets) => {
    if (!session?.user) return;
    try {
      const marketsToUpsert = newMarkets.map(m => ({ id: m.id, user_id: session.user.id, name: m.name }));
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validMarketsToUpsert = marketsToUpsert.filter(m => uuidRegex.test(m.id));
      const currentIds = newMarkets.map(m => m.id);
      
      const { data: existingIds, error: selectErr } = await supabase.from('markets').select('id');
      if (selectErr) return handleError('Listar Mercados para Sincronização', selectErr);

      const idsToDelete = existingIds?.map(e => e.id).filter(id => !currentIds.includes(id)) || [];
      
      if (validMarketsToUpsert.length > 0) {
        const { error: upErr } = await supabase.from('markets').upsert(validMarketsToUpsert);
        if (upErr) handleError('Salvar/Atualizar Mercados', upErr);
      }
      if (idsToDelete.length > 0) {
        const { error: delErr } = await supabase.from('markets').delete().in('id', idsToDelete);
        if (delErr) handleError('Excluir Mercados', delErr);
      }
    } catch (err) {
      handleError('Exceção ao Sincronizar Mercados', err);
    }
  };

  const marketsSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSetMarkets = (newMarketsOrCb: React.SetStateAction<Market[]>) => {
    isSyncingMarkets.current = true;
    setMarkets((prev) => {
      const next = typeof newMarketsOrCb === 'function' ? newMarketsOrCb(prev) : newMarketsOrCb;
      if (marketsSyncTimeoutRef.current) clearTimeout(marketsSyncTimeoutRef.current);
      marketsSyncTimeoutRef.current = setTimeout(() => {
        syncMarkets(next).finally(() => {
          setTimeout(() => { isSyncingMarkets.current = false; }, 2000);
        });
      }, 800);
      return next;
    });
  }

  const syncPromotions = async (newPromos: typeof promotions) => {
    if (!session?.user) return;
    try {
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
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validPromosToUpsert = promosToUpsert.filter(p => uuidRegex.test(p.id));
      const currentIds = newPromos.map(p => p.id);
      
      const { data: existingIds, error: selectErr } = await supabase.from('promotions').select('id');
      if (selectErr) return handleError('Listar Promoções para Sincronização', selectErr);

      const idsToDelete = existingIds?.map(e => e.id).filter(id => !currentIds.includes(id)) || [];
      
      if (validPromosToUpsert.length > 0) {
        const { error: upErr } = await supabase.from('promotions').upsert(validPromosToUpsert);
        if (upErr) handleError('Salvar/Atualizar Promoções', upErr);
      }
      if (idsToDelete.length > 0) {
        const { error: delErr } = await supabase.from('promotions').delete().in('id', idsToDelete);
        if (delErr) handleError('Excluir Promoções', delErr);
      }
    } catch (err) {
      handleError('Exceção ao Sincronizar Promoções', err);
    }
  };

  const promotionsSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSetPromotions = (newPromosOrCb: React.SetStateAction<Promotion[]>) => {
    isSyncingPromotions.current = true;
    setPromotions((prev) => {
      const next = typeof newPromosOrCb === 'function' ? newPromosOrCb(prev) : newPromosOrCb;
      if (promotionsSyncTimeoutRef.current) clearTimeout(promotionsSyncTimeoutRef.current);
      promotionsSyncTimeoutRef.current = setTimeout(() => {
        syncPromotions(next).finally(() => {
          setTimeout(() => { isSyncingPromotions.current = false; }, 2000);
        });
      }, 800);
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
    <div className="min-h-[100dvh] bg-zinc-100 dark:bg-black font-sans text-soft-text-main dark:text-zinc-100 flex justify-center">
      <div className="w-full max-w-md bg-soft-bg dark:bg-[#1C1C1E] min-h-[100dvh] relative shadow-2xl flex flex-col overflow-x-hidden">
        <main className="flex-1 relative pb-24">
          
          {activeTab === 'lista' && <ListaCompras context={context} />}
          {activeTab === 'roteiro' && <Roteiro context={context} />}
          {activeTab === 'promocoes' && <Promocoes context={context} />}
          {activeTab === 'compras' && <ModoCompra context={context} />}
          {activeTab === 'extras' && <MenuExtra context={context} />}

        </main>

        {/* BOTTOM NAVIGATION */}
        <nav className="fixed bottom-0 w-full max-w-md bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800 px-2 py-3 z-50 flex justify-between items-end pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <div className="flex justify-between w-full">
            <NavButton active={activeTab === 'lista'} onClick={() => setActiveTab('lista')} icon={<ListTodo size={22} />} label="Lista" />
            <NavButton active={activeTab === 'roteiro'} onClick={() => setActiveTab('roteiro')} icon={<Map size={22} />} label="Rota" />
            <NavButton active={activeTab === 'promocoes'} onClick={() => setActiveTab('promocoes')} icon={<Tags size={22} />} label="Promoções" />
            <NavButton active={activeTab === 'compras'} onClick={() => setActiveTab('compras')} icon={<ShoppingCart size={22} />} label="Comprar" primary />
            <NavButton active={activeTab === 'extras'} onClick={() => setActiveTab('extras')} icon={<SettingsIcon size={22} />} label="Config" />
          </div>
        </nav>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, primary }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center flex-1 min-w-[60px] gap-1.5 transition-all ${
        primary 
          ? 'text-white translate-y-[-12px]' 
          : active 
            ? 'text-soft-primary font-semibold transform scale-105' 
            : 'text-zinc-400 dark:text-zinc-500 hover:text-soft-text-muted dark:hover:text-zinc-300'
      }`}
    >
      <div className={`${primary ? 'bg-soft-primary p-3.5 rounded-full shadow-primary text-white' : ''} ${primary && !active ? 'opacity-90' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] uppercase tracking-wider leading-none whitespace-nowrap ${primary ? 'text-soft-primary font-bold mt-1' : ''}`}>{label}</span>
    </button>
  );
}
