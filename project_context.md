# Contexto do Projeto: Compra Esperta

Este documento contém a descrição arquitetural e o código-fonte completo do aplicativo web "Compra Esperta".

## 1. Descrição do Projeto
- **Nome:** Compra Esperta
- **Stack:** React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide React, Supabase (Auth + DB).
- **Objetivo:** Aplicativo de gestão de compras de supermercado com funcionalidades de lista de compras inteligente, modo compra (para ser usado dentro do supermercado), roteiro/inteligência de mercado (para achar o supermercado com mais promoções), gestão de ofertas e configurações do usuário.
- **Estrutura:**
  - PWA habilitado via `vite-plugin-pwa`.
  - Design mobile-first (max-w-md no container principal), mas com versão adaptada para desktop.
  - Estado compartilhado gerenciado via React Context ou passagem de props no App.tsx.

## 2. Árvore de Arquivos
```text
src/
├── App.tsx (Root component, roteamento via abas)
├── index.css (Estilos globais, Tailwind, Scrollbar customizada)
├── main.tsx (Entry point)
├── types.ts (Interfaces de tipagem global)
├── utils.ts (Funções utilitárias, classes utilitárias)
├── components/
│   ├── Auth.tsx (Login/Cadastro via Supabase)
│   ├── ErrorBoundary.tsx (Tratamento de erros)
│   ├── ListaCompras.tsx (Lista de planejamento e catálogo de adição rápida)
│   ├── ModoCompra.tsx (Modo de navegação no mercado)
│   ├── Promocoes.tsx (Gestão de ofertas por mercado)
│   ├── Roteiro.tsx (Inteligência para indicar melhor mercado com base nas ofertas)
│   └── MenuExtra.tsx (Configurações, gestão de mercados, conquistas)
├── lib/
│   └── supabase.ts (Cliente do Supabase)
```

## 3. Código-Fonte


### `src/types.ts`
```tsx
import React from 'react'; export type Category = string;
export type Unit = 'kg' | 'g' | 'L' | 'ml' | 'un' | 'pct'; export interface Item { id: string; name: string; qty: number; unit: Unit; category: Category; isEssential: boolean; onlyPromo: boolean; /* Só comprar se tiver promoção */ isBought: boolean; notes: string; actualPrice?: number; /* Para ser preenchido durante o Modo Compra */ isFavorite?: boolean; notFound?: boolean;
} export interface Market { id: string; name: string;
} export interface Promotion { id: string; marketId: string; itemName: string; price: number; qty: number; unit: Unit; expiryDate: string; notes: string;
} export interface Settings { budget: number; darkMode: boolean; streak: number; totalSaved: number; lastActiveDate: string; purchaseCount: number;
} export interface HistoryItem { id: string; date: string; marketId: string | null; totalSpent: number; economyGenerated: number; items: { nome: string; quantidade: number; subtotal: number}[];
} export interface AppContextType { items: Item[]; setItems: React.Dispatch<React.SetStateAction<Item[]>>; markets: Market[]; setMarkets: React.Dispatch<React.SetStateAction<Market[]>>; promotions: Promotion[]; setPromotions: React.Dispatch<React.SetStateAction<Promotion[]>>; settings: Settings; setSettings: React.Dispatch<React.SetStateAction<Settings>>; history: HistoryItem[]; setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>; shoppingMarketId: string; setShoppingMarketId: React.Dispatch<React.SetStateAction<string>>; setActiveTab: (tab: 'lista' | 'roteiro' | 'promocoes' | 'compras' | 'extras') => void;
} 
```

### `src/utils.ts`
```tsx
import { Unit} from './types'; export const formatMoney = (val: number) => { if (isNaN(val)) return 'R$ 0,00'; return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'});
}; export const formatItemName = (name: string) => { return name.replace(/\//g, '/\u200B').replace(/-/g, '-\u200B');
}; /* Remove acentos e deixa minúsculo para busca/matching eficiente */
export const normalizeStr = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim(); /* Converte unidades de base para facilitar a comparação (g -> kg, ml -> L) */
export const convertToBaseUnit = (qty: number, unit: Unit): { qty: number, unit: string} => { if (unit === 'g') return { qty: qty / 1000, unit: 'kg'}; if (unit === 'ml') return { qty: qty / 1000, unit: 'L'}; return { qty, unit};
}; /* Ex: Encontra quanto custa 1 kg sabendo que 300g custam R$ 5,00 */
export const getPricePerBaseUnit = (price: number, qty: number, unit: Unit) => { const base = convertToBaseUnit(qty, unit); if (base.qty === 0) return 0; return price / base.qty;
}; /* Gera ID único */
export const generateId = () => { if (typeof crypto !== 'undefined' && crypto.randomUUID) { return crypto.randomUUID();
} return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) { var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16);
});
}; export const CATEGORY_EMOJI: Record<string, string> = { 'Açougue e Peixaria': '🥩', 'Frios e Laticínios': '🧀', 'Hortifruti': '🥦', 'Bebidas': '🥤', 'Mercearia': '🍚', 'Limpeza': '🧼', 'Higiene e Perfumaria': '🧴', 'Padaria': '🍞', 'Congelados': '🧊', 'Pet Shop': '🐾', 'Outros': '🛒'
}; export const CATEGORY_EMOJI_UPDATED: Record<string, string> = { 'Açougue': '🥩', 'Açougue e Aves': '🥩', 'Açougue e Peixaria': '🥩', 'Peixaria': '🐟', 'Hortifruti': '🥦', 'Laticínios e Frios': '🧀', 'Frios e Laticínios': '🧀', 'Congelados': '🧊', 'Mercearia': '🍚', 'Padaria': '🍞', 'Padaria, Biscoitos e Doces': '🥖', 'Bebidas': '🧃', 'Limpeza': '🧼', 'Higiene e Perfumaria': '🧴', 'Higiene e Limpeza': '🧼', 'Bebês': '🍼', 'Pet Shop': '🐾', 'Outros': '🛒'
};

```

### `src/lib/supabase.ts`
```tsx
import { createClient} from '@supabase/supabase-js'; const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '').trim(); let finalUrl = supabaseUrl;
let finalKey = supabaseAnonKey; if (!finalUrl || !finalUrl.startsWith('http') || !finalKey) { console.warn("As variáveis de ambiente do Supabase estão ausentes. Verifique o painel do Vercel e adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."); finalUrl = 'https://placeholder.supabase.co'; finalKey = 'placeholder';
} export const supabase = createClient(finalUrl, finalKey); 
```

### `src/App.tsx`
```tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Item,
  Market,
  Promotion,
  Settings,
  AppContextType,
  HistoryItem,
} from "./types";
import { ListaCompras } from "./components/ListaCompras";
import { Promocoes } from "./components/Promocoes";
import { ModoCompra } from "./components/ModoCompra";
import { MenuExtra } from "./components/MenuExtra";
import { Roteiro } from "./components/Roteiro";
import { AuthUI } from "./components/Auth";
import { supabase } from "./lib/supabase";
import { Session } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "motion/react";
import {
  ListTodo,
  Tags,
  ShoppingCart,
  Settings as SettingsIcon,
  Map,
} from "lucide-react";
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [settings, setSettings] = useState<Settings>({
    budget: 0,
    darkMode: false,
    streak: 0,
    totalSaved: 0,
    lastActiveDate: "",
    purchaseCount: 0,
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [shoppingMarketId, setShoppingMarketId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "lista" | "roteiro" | "promocoes" | "compras" | "extras"
  >("lista");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error("Session error:", error);
          /* If there is an error fetching the session, clear the auth state */ supabase.auth
            .signOut()
            .catch(console.error);
        }
        setSession(session);
        setIsLoadingAuth(false);
      })
      .catch((err) => {
        console.error("Session promise error:", err);
        supabase.auth.signOut().catch(console.error);
        setSession(null);
        setIsLoadingAuth(false);
      });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setSession(null);
      } else {
        setSession(session);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  const handleError = (context: string, error: any) => {
    /* Ignore auth/JWT/Refresh token errors quietly instead of alerting the user, and sign out automatically. */ const msg =
      typeof error === "string"
        ? error
        : error?.message || JSON.stringify(error) || "";
    if (
      msg.includes("JWT") ||
      msg.includes("Refresh Token") ||
      msg.includes("token") ||
      error?.code === "401" ||
      error?.code === "403"
    ) {
      supabase.auth.signOut().catch(console.error);
      return;
    }
    /* Ignore missing table errors silently */ if (
      error?.code === "42P01" ||
      error?.code === "PGRST205" ||
      msg.includes("schema cache")
    ) {
      return;
    }
    console.error(
      `❌ Erro Supabase (${context}):`,
      error?.message,
      error?.details,
      error,
    );
    showToast(`Erro: ${context}. ${error?.message || ""}`);
  };
  const isSyncingItems = useRef(false);
  const isSyncingMarkets = useRef(false);
  const isSyncingPromotions = useRef(false);
  const isSyncingHistory = useRef(false);
  /* Sync data with Supabase when session changes */ useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;
      try {
        const { data: sData, error: sErr } = await supabase
          .from("settings")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
        if (sErr && sErr.code !== "PGRST116")
          handleError("Buscar Settings", sErr);
        if (sData) {
          setSettings({
            budget: sData.budget || 0,
            darkMode: sData.dark_mode || false,
            streak: sData.streak || 0,
            totalSaved: Number(sData.total_saved) || 0,
            lastActiveDate: sData.last_active_date || "",
            purchaseCount: sData.purchase_count || 0,
          });
          /* Lógica de Streak */ const today = new Date()
            .toISOString()
            .split("T")[0];
          const yesterday = new Date(Date.now() - 86400000)
            .toISOString()
            .split("T")[0];
          const dbLastActive = sData.last_active_date || "";
          if (dbLastActive !== today) {
            handleSetSettings((prev) => ({
              ...prev,
              streak:
                dbLastActive === yesterday
                  ? (sData.streak || 0) + 1
                  : dbLastActive
                    ? 1
                    : 0,
              lastActiveDate: today,
            }));
          }
        } else if (!sErr || sErr.code === "PGRST116") {
          const { error: insErr } = await supabase
            .from("settings")
            .upsert(
              {
                budget: 0,
                dark_mode: false,
                streak: 0,
                total_saved: 0,
                last_active_date: new Date().toISOString().split("T")[0],
                purchase_count: 0,
                user_id: session.user.id,
              },
              { onConflict: "user_id" },
            );
          if (insErr && insErr.code !== "23505")
            handleError("Criar Settings", insErr);
        }
        const { data: iData, error: iErr } = await supabase
          .from("items")
          .select("*")
          .order("created_at");
        if (iErr) handleError("Buscar Itens", iErr);
        else if (iData && !isSyncingItems.current) {
          setItems(
            iData.map((i) => ({
              id: i.id,
              name: i.name,
              qty: Number(i.qty),
              unit: i.unit as any,
              category: i.category as any,
              isEssential: i.is_essential,
              onlyPromo: i.only_promo,
              isBought: i.is_bought,
              notes: i.notes,
              actualPrice: i.actual_price ? Number(i.actual_price) : undefined,
            })),
          );
        }
        const { data: mData, error: mErr } = await supabase
          .from("markets")
          .select("*")
          .order("created_at");
        if (mErr) handleError("Buscar Mercados", mErr);
        else if (mData && !isSyncingMarkets.current)
          setMarkets(mData.map((m) => ({ id: m.id, name: m.name })));
        const { data: pData, error: pErr } = await supabase
          .from("promotions")
          .select("*")
          .order("created_at");
        if (pErr) handleError("Buscar Promoções", pErr);
        else if (pData && !isSyncingPromotions.current) {
          const loadedPromos = pData.map((p) => ({
            id: p.id,
            marketId: p.market_id,
            itemName: p.item_name,
            price: Number(p.price),
            qty: Number(p.qty),
            unit: p.unit as any,
            expiryDate: p.expiry_date,
            notes: p.notes,
          }));
          const today = new Date().toISOString().split("T")[0];
          const validPromos = loadedPromos.filter(
            (p) => !p.expiryDate || p.expiryDate >= today,
          );
          setPromotions(validPromos);
          /* Se encontrou promos expiradas, remove do banco */ if (
            validPromos.length < loadedPromos.length
          ) {
            const expiredIds = loadedPromos
              .filter((p) => p.expiryDate && p.expiryDate < today)
              .map((p) => p.id);
            if (expiredIds.length > 0) {
              supabase
                .from("promotions")
                .delete()
                .in("id", expiredIds)
                .then(({ error }) => {
                  if (error) console.error(error);
                });
            }
          }
        }
        const { data: hData, error: hErr } = await supabase
          .from("history")
          .select("*")
          .order("date", { ascending: false });
        if (hErr && hErr.code !== "42P01")
          handleError(
            "Buscar Histórico",
            hErr,
          ); /* 42P01/PGRST205 is table undefined, handle gracefully */
        else if (hData && !isSyncingHistory.current) {
          setHistory(
            hData.map((h) => ({
              id: h.id,
              date: h.date,
              marketId: h.market_id,
              totalSpent: Number(h.total_spent),
              economyGenerated: Number(h.economy_generated),
              items: h.items,
            })),
          );
        }
      } catch (err) {
        handleError("Exceção no Fetch API", err);
      }
    };
    fetchData();
    if (session?.user) {
      let channel: ReturnType<typeof supabase.channel>;
      let retryTimeout: NodeJS.Timeout;
      const setupRealtime = () => {
        if (channel) supabase.removeChannel(channel);
        channel = supabase
          .channel("schema-db-changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "items" },
            fetchData,
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "markets" },
            fetchData,
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "promotions" },
            fetchData,
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "settings" },
            fetchData,
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "history" },
            fetchData,
          )
          .subscribe((status, err: any) => {
            console.log(`🔌 Supabase Realtime Status: ${status}`);
            if (status === "SUBSCRIBED") {
              console.log("✅ Conexão Realtime estabelecida com sucesso!");
            } else if (status === "CLOSED") {
              console.warn("⚠️ Conexão Realtime foi fechada.");
            } else if (status === "CHANNEL_ERROR") {
              const errMsg = err?.message || err;
              if (
                String(errMsg).includes("1006") ||
                String(errMsg).includes("transport failure") ||
                String(errMsg).includes("closed")
              ) {
                console.warn(
                  `⚠️ Conexão Realtime interrompida (${errMsg}). Pode ser oscilação de rede. Tentando novamente em breve...`,
                );
              } else {
                console.warn("⚠️ Erro no canal Realtime:", err);
              }
              /* Tentar reconectar em caso de erro no canal */ clearTimeout(
                retryTimeout,
              );
              retryTimeout = setTimeout(setupRealtime, 5000);
            } else if (status === "TIMED_OUT") {
              console.warn("⏱️ Conexão Realtime esgotou o tempo limite.");
              clearTimeout(retryTimeout);
              retryTimeout = setTimeout(setupRealtime, 5000);
            }
          });
      };
      setupRealtime();
      return () => {
        clearTimeout(retryTimeout);
        if (channel) supabase.removeChannel(channel);
      };
    }
  }, [session]);
  const updateSetting = async (key: string, value: any) => {
    if (!session?.user) return;
    try {
      const { error } = await supabase
        .from("settings")
        .update({ [key]: value })
        .eq("user_id", session.user.id);
      if (error) handleError(`Atualizar Configuração (${key})`, error);
    } catch (err) {
      handleError(`Exceção ao Atualizar (${key})`, err);
    }
  };
  /* Effect specifically for darkMode */ useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#1C1C1E";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "#F0FDF4"; /* Cinza Gelo */
    }
  }, [settings.darkMode]);
  const handleSetSettings = (newSettings: React.SetStateAction<Settings>) => {
    setSettings((prev) => {
      const next =
        typeof newSettings === "function" ? newSettings(prev) : newSettings;
      updateSetting("budget", next.budget);
      updateSetting("dark_mode", next.darkMode);
      return next;
    });
  };
  const syncItems = async (newItems: typeof items) => {
    if (!session?.user) return;
    try {
      const itemsToUpsert = newItems.map((i) => ({
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
        actual_price: i.actualPrice || null,
      }));
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validItemsToUpsert = itemsToUpsert.filter((i) =>
        uuidRegex.test(i.id),
      );
      const currentIds = newItems.map((i) => i.id);
      const { data: existingIds, error: selectErr } = await supabase
        .from("items")
        .select("id");
      if (selectErr)
        return handleError("Listar Itens para Sincronização", selectErr);
      const idsToDelete =
        existingIds
          ?.map((e) => e.id)
          .filter((id) => !currentIds.includes(id)) || [];
      if (validItemsToUpsert.length > 0) {
        const { error: upErr } = await supabase
          .from("items")
          .upsert(validItemsToUpsert);
        if (upErr) handleError("Salvar/Atualizar Itens", upErr);
      }
      if (idsToDelete.length > 0) {
        const { error: delErr } = await supabase
          .from("items")
          .delete()
          .in("id", idsToDelete);
        if (delErr) handleError("Excluir Itens", delErr);
      }
    } catch (err) {
      handleError("Exceção ao Sincronizar Itens", err);
    }
  };
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleSetItems = (newItemsOrCb: React.SetStateAction<Item[]>) => {
    isSyncingItems.current = true;
    setItems((prev) => {
      const next =
        typeof newItemsOrCb === "function" ? newItemsOrCb(prev) : newItemsOrCb;
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        syncItems(next).finally(() => {
          setTimeout(() => {
            isSyncingItems.current = false;
          }, 2000);
        });
      }, 800);
      return next;
    });
  };
  const syncMarkets = async (newMarkets: typeof markets) => {
    if (!session?.user) return;
    try {
      const marketsToUpsert = newMarkets.map((m) => ({
        id: m.id,
        user_id: session.user.id,
        name: m.name,
      }));
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validMarketsToUpsert = marketsToUpsert.filter((m) =>
        uuidRegex.test(m.id),
      );
      const currentIds = newMarkets.map((m) => m.id);
      const { data: existingIds, error: selectErr } = await supabase
        .from("markets")
        .select("id");
      if (selectErr)
        return handleError("Listar Mercados para Sincronização", selectErr);
      const idsToDelete =
        existingIds
          ?.map((e) => e.id)
          .filter((id) => !currentIds.includes(id)) || [];
      if (validMarketsToUpsert.length > 0) {
        const { error: upErr } = await supabase
          .from("markets")
          .upsert(validMarketsToUpsert);
        if (upErr) handleError("Salvar/Atualizar Mercados", upErr);
      }
      if (idsToDelete.length > 0) {
        const { error: delErr } = await supabase
          .from("markets")
          .delete()
          .in("id", idsToDelete);
        if (delErr) handleError("Excluir Mercados", delErr);
      }
    } catch (err) {
      handleError("Exceção ao Sincronizar Mercados", err);
    }
  };
  const marketsSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleSetMarkets = (newMarketsOrCb: React.SetStateAction<Market[]>) => {
    isSyncingMarkets.current = true;
    setMarkets((prev) => {
      const next =
        typeof newMarketsOrCb === "function"
          ? newMarketsOrCb(prev)
          : newMarketsOrCb;
      if (marketsSyncTimeoutRef.current)
        clearTimeout(marketsSyncTimeoutRef.current);
      marketsSyncTimeoutRef.current = setTimeout(() => {
        syncMarkets(next).finally(() => {
          setTimeout(() => {
            isSyncingMarkets.current = false;
          }, 2000);
        });
      }, 800);
      return next;
    });
  };
  const syncPromotions = async (newPromos: typeof promotions) => {
    if (!session?.user) return;
    try {
      const promosToUpsert = newPromos.map((p) => ({
        id: p.id,
        user_id: session.user.id,
        market_id: p.marketId,
        item_name: p.itemName,
        price: p.price,
        qty: p.qty,
        unit: p.unit,
        expiry_date: p.expiryDate || null,
        notes: p.notes || null,
      }));
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validPromosToUpsert = promosToUpsert.filter((p) =>
        uuidRegex.test(p.id),
      );
      const currentIds = newPromos.map((p) => p.id);
      const { data: existingIds, error: selectErr } = await supabase
        .from("promotions")
        .select("id");
      if (selectErr)
        return handleError("Listar Promoções para Sincronização", selectErr);
      const idsToDelete =
        existingIds
          ?.map((e) => e.id)
          .filter((id) => !currentIds.includes(id)) || [];
      if (validPromosToUpsert.length > 0) {
        const { error: upErr } = await supabase
          .from("promotions")
          .upsert(validPromosToUpsert);
        if (upErr) handleError("Salvar/Atualizar Promoções", upErr);
      }
      if (idsToDelete.length > 0) {
        const { error: delErr } = await supabase
          .from("promotions")
          .delete()
          .in("id", idsToDelete);
        if (delErr) handleError("Excluir Promoções", delErr);
      }
    } catch (err) {
      handleError("Exceção ao Sincronizar Promoções", err);
    }
  };
  const promotionsSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleSetPromotions = (
    newPromosOrCb: React.SetStateAction<Promotion[]>,
  ) => {
    isSyncingPromotions.current = true;
    setPromotions((prev) => {
      const next =
        typeof newPromosOrCb === "function"
          ? newPromosOrCb(prev)
          : newPromosOrCb;
      if (promotionsSyncTimeoutRef.current)
        clearTimeout(promotionsSyncTimeoutRef.current);
      promotionsSyncTimeoutRef.current = setTimeout(() => {
        syncPromotions(next).finally(() => {
          setTimeout(() => {
            isSyncingPromotions.current = false;
          }, 2000);
        });
      }, 800);
      return next;
    });
  };
  const syncHistory = async (newHistory: typeof history) => {
    if (!session?.user) return;
    try {
      const historyToUpsert = newHistory.map((h) => ({
        id: h.id,
        user_id: session.user.id,
        date: h.date,
        market_id: h.marketId || null,
        total_spent: h.totalSpent,
        economy_generated: h.economyGenerated,
        items: h.items || [],
      }));
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validHistoryToUpsert = historyToUpsert.filter((h) =>
        uuidRegex.test(h.id),
      );
      const currentIds = newHistory.map((h) => h.id);
      const { data: existingIds, error: selectErr } = await supabase
        .from("history")
        .select("id");
      if (selectErr && selectErr.code !== "42P01")
        return handleError("Listar Histórico para Sincronização", selectErr);
      const idsToDelete =
        existingIds
          ?.map((e) => e.id)
          .filter((id) => !currentIds.includes(id)) || [];
      if (validHistoryToUpsert.length > 0) {
        const { error: upErr } = await supabase
          .from("history")
          .upsert(validHistoryToUpsert);
        if (upErr && upErr.code !== "42P01")
          handleError("Salvar/Atualizar Histórico", upErr);
      }
      if (idsToDelete.length > 0) {
        const { error: delErr } = await supabase
          .from("history")
          .delete()
          .in("id", idsToDelete);
        if (delErr && delErr.code !== "42P01")
          handleError("Excluir Histórico", delErr);
      }
    } catch (err) {
      handleError("Exceção ao Sincronizar Histórico", err);
    }
  };
  const historySyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleSetHistory = (
    newHistoryOrCb: React.SetStateAction<HistoryItem[]>,
  ) => {
    isSyncingHistory.current = true;
    setHistory((prev) => {
      const next =
        typeof newHistoryOrCb === "function"
          ? newHistoryOrCb(prev)
          : newHistoryOrCb;
      if (historySyncTimeoutRef.current)
        clearTimeout(historySyncTimeoutRef.current);
      historySyncTimeoutRef.current = setTimeout(() => {
        syncHistory(next).finally(() => {
          setTimeout(() => {
            isSyncingHistory.current = false;
          }, 2000);
        });
      }, 800);
      return next;
    });
  };
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    }
  };
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-transparent text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-4"></div>
    );
  }
  if (!session) {
    return <AuthUI />;
  }
  const context: AppContextType = {
    items,
    setItems: handleSetItems,
    markets,
    setMarkets: handleSetMarkets,
    promotions,
    setPromotions: handleSetPromotions,
    settings,
    setSettings: handleSetSettings,
    history,
    setHistory: handleSetHistory,
    shoppingMarketId,
    setShoppingMarketId,
    setActiveTab,
  };
  return (
    <div className="min-h-[100dvh] bg-transparent text-zinc-900 dark:text-zinc-100 flex justify-center md:items-center md:p-6">
      {" "}
      <div className="w-full max-w-md md:max-w-5xl bg-transparent md:bg-white md:dark:bg-zinc-900 min-h-[100dvh] md:min-h-[85vh] md:h-[85vh] relative shadow-2xl flex flex-col md:flex-row md:rounded-[32px] md:overflow-hidden md:border border-zinc-200 dark:border-zinc-800 overflow-x-hidden">
        
        {/* DESKTOP SIDE NAVIGATION */}
        <nav className="hidden md:flex flex-col w-24 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 py-8 items-center gap-8 z-50 shrink-0">
          <div className="w-12 h-12 bg-green-700 text-white rounded-2xl flex justify-center items-center font-bold text-xl mb-4 shadow-lg">CE</div>
          <div className="flex flex-col gap-4 w-full px-2">
            <NavButton active={activeTab === "lista"} onClick={() => setActiveTab("lista")} icon={<ListTodo size={28} />} label="Lista" />
            <NavButton active={activeTab === "roteiro"} onClick={() => setActiveTab("roteiro")} icon={<Map size={28} />} label="Rota" />
            <NavButton active={activeTab === "promocoes"} onClick={() => setActiveTab("promocoes")} icon={<Tags size={28} />} label="Ofertas" />
            <NavButton active={activeTab === "compras"} onClick={() => setActiveTab("compras")} icon={<ShoppingCart size={28} />} label="Comprar" />
          </div>
          <div className="mt-auto w-full px-2">
             <NavButton active={activeTab === "extras"} onClick={() => setActiveTab("extras")} icon={<SettingsIcon size={28} />} label="Config" />
          </div>
        </nav>

        {" "}
        {showInstallBanner && (
          <div className="bg-green-700 text-white p-3 flex justify-between items-center z-50 rounded-b-xl shadow-md mx-2 mt-2">
            {" "}
            <div className="text-sm font-medium">
              Instalar Compra Esperta no seu dispositivo
            </div>{" "}
            <div className="flex gap-2">
              {" "}
              <button
                onClick={() => setShowInstallBanner(false)}
                className="text-green-100 hover:text-white px-2 py-1 text-sm font-semibold"
              >
                Agora não
              </button>{" "}
              <button
                onClick={handleInstallClick}
                className="bg-white dark:bg-zinc-900 text-green-700 dark:text-green-500 px-3 py-1 rounded-full text-sm font-bold shadow-sm active:scale-[0.97] transition-transform duration-150 transition-transform"
              >
                Instalar
              </button>{" "}
            </div>{" "}
          </div>
        )}{" "}
        {toastMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-500 text-white px-4 py-2 rounded-xl shadow-lg font-medium text-sm transition-opacity duration-300">
            {" "}
            {toastMessage}{" "}
          </div>
        )}{" "}
        <main className="flex-1 relative pb-24 md:pb-0 overflow-x-hidden md:overflow-y-auto">
          {" "}
          <AnimatePresence mode="wait">
            {" "}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
            >
              {" "}
              {activeTab === "lista" && <ListaCompras context={context} />}{" "}
              {activeTab === "roteiro" && <Roteiro context={context} />}{" "}
              {activeTab === "promocoes" && <Promocoes context={context} />}{" "}
              {activeTab === "compras" && <ModoCompra context={context} />}{" "}
              {activeTab === "extras" && <MenuExtra context={context} />}{" "}
            </motion.div>{" "}
          </AnimatePresence>{" "}
        </main>{" "}
        {/* BOTTOM NAVIGATION */}{" "}
        <nav className="md:hidden fixed bottom-0 w-full max-w-md bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-2 py-2 z-50 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          {" "}
          <div className="grid grid-cols-5 w-full items-center">
            {" "}
            <NavButton
              active={activeTab === "lista"}
              onClick={() => setActiveTab("lista")}
              icon={<ListTodo size={24} />}
              label="Lista"
            />{" "}
            <NavButton
              active={activeTab === "roteiro"}
              onClick={() => setActiveTab("roteiro")}
              icon={<Map size={24} />}
              label="Rota"
            />{" "}
            <NavButton
              active={activeTab === "promocoes"}
              onClick={() => setActiveTab("promocoes")}
              icon={<Tags size={24} />}
              label="Ofertas"
            />{" "}
            <NavButton
              active={activeTab === "compras"}
              onClick={() => setActiveTab("compras")}
              icon={<ShoppingCart size={24} />}
              label="Comprar"
            />{" "}
            <NavButton
              active={activeTab === "extras"}
              onClick={() => setActiveTab("extras")}
              icon={<SettingsIcon size={24} />}
              label="Config"
            />{" "}
          </div>{" "}
        </nav>{" "}
      </div>{" "}
    </div>
  );
}
function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full gap-1 pt-1.5 pb-1 transition-colors relative ${
        active
          ? "text-green-700 dark:text-green-500 font-bold"
          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-500 dark:text-zinc-400 font-medium"
      }`}
    >
      {" "}
      <div
        className={`${active ? "transform scale-110 transition-transform" : ""}`}
      >
        {" "}
        {icon}{" "}
      </div>{" "}
      <span className="text-[10px] leading-none whitespace-nowrap">
        {label}
      </span>{" "}
      {active ? (
        <motion.div
          layoutId="activeTabDot"
          className="w-1.5 h-1.5 rounded-full bg-green-700 absolute -bottom-1.5"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      ) : (
        <div className="w-1.5 h-1.5 absolute -bottom-1.5" />
      )}{" "}
    </button>
  );
}

```

### `src/components/Auth.tsx`
```tsx
import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { ShoppingCart } from "lucide-react";
export const AuthUI: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Verifique seu email para o link de confirmação!");
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro na autenticação.");
    } finally {
      setLoading(false);
    }
  };
  const url =
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const isConfigured = url && url.startsWith("http") && key;
  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
      {" "}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl">
        {" "}
        <div className="text-center mb-8">
          {" "}
          <div className="w-20 h-20 bg-green-700 rounded-[20px] flex items-center justify-center text-white mx-auto mb-4 shadow-primary">
            {" "}
            <ShoppingCart size={40} strokeWidth={2.5} />{" "}
          </div>{" "}
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Compra Esperta
          </h1>{" "}
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">
            Entre para sincronizar suas listas
          </p>{" "}
        </div>{" "}
        {!isConfigured && (
          <div className="bg-orange-50 text-orange-600 p-4 rounded-xl mb-6 text-sm font-medium border border-orange-200">
            {" "}
            <strong>Atenção:</strong> Configure as variáveis{" "}
            <code className="bg-orange-100 px-1 py-0.5 rounded">
              VITE_SUPABASE_URL
            </code>{" "}
            e{" "}
            <code className="bg-orange-100 px-1 py-0.5 rounded">
              VITE_SUPABASE_ANON_KEY
            </code>{" "}
            no menu Settings (ícone de engrenagem) aqui no AI Studio para usar a
            autenticação no modo Preview. Na Vercel, configure-as nas
            Environment Variables.{" "}
          </div>
        )}{" "}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium">
            {" "}
            {error}{" "}
          </div>
        )}{" "}
        <form onSubmit={handleAuth} className="space-y-4">
          {" "}
          <div>
            {" "}
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
              Email
            </label>{" "}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 rounded-[20px] px-4 py-3 focus:outline-none ring-0 placeholder-zinc-400 dark:placeholder-zinc-500"
              placeholder="Seu email"
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
              Senha
            </label>{" "}
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 rounded-[20px] px-4 py-3 focus:outline-none ring-0 placeholder-zinc-400 dark:placeholder-zinc-500"
              placeholder="Sua senha"
            />{" "}
          </div>{" "}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-700-hover text-white font-semibold rounded-full py-4 mt-4 disabled:opacity-50 transition-colors shadow-primary"
          >
            {" "}
            {loading ? "Aguarde..." : isLogin ? "Entrar" : "Cadastrar"}{" "}
          </button>{" "}
        </form>{" "}
        <div className="mt-6 text-center">
          {" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-green-700 dark:text-green-500 hoverdark:hover:text-green-500 dark:text-green-500-hover transition-colors"
          >
            {" "}
            {isLogin
              ? "Não tem uma conta? Cadastre-se"
              : "Já tem uma conta? Entre"}{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

```

### `src/components/ListaCompras.tsx`
```tsx
import React, { useState, useMemo, useEffect } from "react";
import { Item, Category, Unit, AppContextType } from "../types";
import {
  generateId,
  formatItemName,
  formatMoney,
  CATEGORY_EMOJI_UPDATED,
} from "../utils";
import {
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Search,
  ChevronRight,
  Calculator,
  BadgePlus,
  Star,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { PRODUCT_CATALOG } from "../data/catalog";
import { motion, AnimatePresence } from "motion/react";
export const ListaCompras: React.FC<{ context: AppContextType }> = ({
  context,
}) => {
  const { items, setItems, settings } = context;
  const [showCatalog, setShowCatalog] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tip, setTip] = useState<string | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const fetchTip = async () => {
    const essentialItems = items
      .filter((i) => i.isEssential)
      .map((i) => i.name);
    if (essentialItems.length === 0) return;
    setIsLoadingTip(true);
    try {
      const response = await fetch("/api/tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essentialItems }),
      });
      if (!response.ok) {
        if (response.status === 404) {
          /* If the endpoint doesn't exist (e.g. in production), silently ignore it and mark as'fetched' to avoid retries */ setTip(
            "",
          );
          return;
        }
        throw new Error("Failed to fetch tip");
      }
      const data = await response.json();
      if (data.tip) setTip(data.tip);
    } catch (error) {
      console.error("Failed to fetch tip:", error);
      setTip(""); /* Store empty string on error to prevent constant retries */
    } finally {
      setIsLoadingTip(false);
    }
  };
  useEffect(() => {
    const essentialItemsCount = items.filter((i) => i.isEssential).length;
    if (essentialItemsCount > 0 && !tip && !isLoadingTip) {
      fetchTip();
    }
  }, [items]);
  const handleAddFromCatalog = (itemName: string, categoryName: string) => {
    setItems((prevItems) => {
      const normalizedItemName = itemName.trim().toLowerCase();
      const existingItem = prevItems.find(
        (i) => i.name.trim().toLowerCase() === normalizedItemName,
      );
      if (existingItem) {
        return prevItems.filter((i) => i.id !== existingItem.id);
      } else {
        const newItem: Item = {
          id: generateId(),
          name: itemName,
          qty: 1,
          unit: "un" /* Padrão */,
          category: categoryName as Category,
          isEssential: false,
          onlyPromo: false,
          isBought: false,
          notes: "",
          actualPrice: 0,
        };
        return [...prevItems, newItem];
      }
    });
  };
  const clearBought = () => {
    setItems(items.map((item) => ({ ...item, isBought: false })));
    setShowClearConfirm(false);
  };
  const getBestOffer = (itemName: string) => {
    const promos = context.promotions.filter(
      (p) => p.itemName.toLowerCase() === itemName.toLowerCase(),
    );
    if (promos.length === 0) return null;
    return promos.reduce((prev, curr) =>
      prev.price < curr.price ? prev : curr,
    );
  };
  const calculateEstimatedTotal = () => {
    let total = 0;
    const globalDefault = 15.0;
    items.forEach((item) => {
      const bestOffer = getBestOffer(item.name);
      if (bestOffer) {
        total += bestOffer.price * item.qty;
      } else {
        total += globalDefault * item.qty;
      }
    });
    return total;
  };
  const calculateEconomy = () => {
    let totalWithoutOffers = 0;
    let totalWithOffers = 0;
    const globalDefault = 15.0;
    items.forEach((item) => {
      const bestOffer = getBestOffer(item.name);
      if (bestOffer) {
        totalWithoutOffers += globalDefault * item.qty;
        /* ou preço médio se houvesse, mas usarei default por enquanto */ totalWithOffers +=
          bestOffer.price * item.qty;
      }
    });
    return Math.max(0, totalWithoutOffers - totalWithOffers);
  };
  const expectedTotal = calculateEstimatedTotal();
  const progOrçamento =
    settings.budget > 0 ? (expectedTotal / settings.budget) * 100 : 0;
  const progressPercent = Math.min(progOrçamento, 100);
  const normalizedItemNamesForCatalog = useMemo(() => {
    return new Set(items.map((i) => i.name.trim().toLowerCase()));
  }, [items]);
  const uniqueCategories = Array.from(new Set(items.map((i) => i.category)));
  const groupedItems = uniqueCategories
    .map((cat) => ({
      category: cat || "Sem Categoria",
      items: items
        .filter((i) => i.category === cat)
        .sort((a, b) => {
          if (a.isBought === b.isBought) {
            if (a.isEssential && !b.isEssential) return -1;
            if (!a.isEssential && b.isEssential) return 1;
            return a.name.localeCompare(b.name);
          }
          return a.isBought ? 1 : -1;
        }),
    }))
    .sort((a, b) => String(a.category).localeCompare(String(b.category)));
  const totalItems = items.length;
  const boughtItems = items.filter((i) => i.isBought).length;
  const flatCatalog = useMemo(() => {
    return PRODUCT_CATALOG.flatMap((cat) =>
      cat.subcategories.flatMap((sub) =>
        sub.items.map((item) => ({
          name: item,
          category: cat.name,
          searchKey: item
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""),
        })),
      ),
    );
  }, []);
  const frequentItems = useMemo(() => {
    const counts: Record<string, number> = {};
    context.history.forEach((h) => {
      h.items?.forEach((i) => {
        const lowerName = i.nome.trim().toLowerCase();
        counts[lowerName] = (counts[lowerName] || 0) + 1;
      });
    });
    return Object.fromEntries(
      Object.entries(counts).filter(([_, count]) => count >= 2),
    );
  }, [context.history]);
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return flatCatalog.filter((i) => i.searchKey.includes(query));
  }, [searchQuery, flatCatalog]);
  return (
    <div className="pb-28 bg-transparent min-h-screen relative">
      {" "}
      {/* HEADER MARKET PRO */}{" "}
      <div
        className={`bg-gradient-to-br from-green-600 to-green-500 rounded-b-[40px] overflow-hidden relative px-6 text-center text-white shadow-primary z-10 transition-all duration-300 ${scrolled ? "pt-[calc(env(safe-area-inset-top)+8px)] pb-3" : "pt-[calc(env(safe-area-inset-top)+20px)] pb-14"}`}
      >
        {" "}
        <div className="absolute rounded-full border-[12px] border-white/10" style={{ width: 280, height: 280, top: -100, left: -100 }}></div>
        <div className="absolute rounded-full bg-black/10" style={{ width: 140, height: 140, bottom: -20, right: -20 }}></div>
        <div className="absolute inset-0 opacity-100 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("/pattern-dark.svg")', backgroundSize: '100px 100px', backgroundRepeat: 'repeat' }}></div>{" "}
        <div className="flex flex-col items-center relative z-10">
          {" "}
          <p className="text-green-50 font-semibold text-[11px] mb-1.5">
            {" "}
            Orçamento Planejado{" "}
          </p>{" "}
          <h1 className="text-[44px] font-bold tracking-tight leading-none mb-3">
            {" "}
            <span className="money-value">
              {formatMoney(settings.budget)}
            </span>{" "}
          </h1>{" "}
          <div className="bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-[13px] font-semibold text-white flex items-center gap-2">
            {" "}
            {boughtItems} de {totalItems} itens no carrinho{" "}
          </div>{" "}
          {settings.budget > 0 && expectedTotal > 0 && (
            <div className="w-full mt-5 bg-black/10 rounded-3xl p-3 border border-white/10 text-left">
              {" "}
              <div className="flex justify-between text-[11px] font-bold mb-2 text-green-100">
                {" "}
                <span>
                  {" "}
                  Total Estimado:{""}{" "}
                  <span className="money-value">
                    {" "}
                    {formatMoney(expectedTotal)}{" "}
                  </span>{" "}
                </span>{" "}
                <span className={progOrçamento > 100 ? "text-red-200" : ""}>
                  {" "}
                  {Math.round(progOrçamento)}%{" "}
                </span>{" "}
              </div>{" "}
              <div className="h-2 rounded-full bg-black/20 overflow-hidden">
                {" "}
                <div
                  className={`h-full rounded-full transition-all duration-300 ${progOrçamento > 100 ? "bg-red-400" : "bg-white"}`}
                  style={{ width: `${progressPercent}%` }}
                />{" "}
              </div>{" "}
              {calculateEconomy() > 0 && (
                <div className="mt-2 text-[11px] font-bold text-green-100 flex items-center gap-1.5">
                  {" "}
                  <span className="bg-green-500/20 text-green-100 px-1.5 py-0.5 rounded-md">
                    {" "}
                    Se comprar onde tem oferta, você poupará{""}{" "}
                    <span className="money-value">
                      {" "}
                      {formatMoney(calculateEconomy())}{" "}
                    </span>{" "}
                    .{" "}
                  </span>{" "}
                </div>
              )}{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
      {/* OVERLAP SHORTCUT CARDS */}{" "}
      <div className="px-5 -mt-8 relative z-20">
        {" "}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 shadow-sm border border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-2">
          {" "}
          <div
            className="flex flex-col items-center justify-start gap-2 cursor-pointer"
            onClick={() => setShowCatalog(true)}
          >
            {" "}
            <div className="w-14 h-14 rounded-full bg-green-50 text-green-700 dark:text-green-500 /30 flex items-center justify-center transition-transform hover:scale-105 active:scale-[0.97] transition-transform duration-150 shadow-sm border border-green-100 /30">
              {" "}
              <BadgePlus size={24} strokeWidth={2.5} />{" "}
            </div>{" "}
            <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 text-center leading-tight">
              {" "}
              Adicionar{" "}
            </span>{" "}
          </div>{" "}
          <div
            className="flex flex-col items-center justify-start gap-2 cursor-pointer"
            onClick={() => context.setActiveTab("compras")}
          >
            {" "}
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 /30 flex items-center justify-center transition-transform hover:scale-105 active:scale-[0.97] transition-transform duration-150 shadow-sm border border-blue-100 /30">
              {" "}
              <Calculator size={24} strokeWidth={2.5} />{" "}
            </div>{" "}
            <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 text-center leading-tight">
              {" "}
              Modo <br /> Compra{" "}
            </span>{" "}
          </div>{" "}
          <div
            className="flex flex-col items-center justify-start gap-2 cursor-pointer"
            onClick={() => setShowClearConfirm(true)}
          >
            {" "}
            <div className="w-14 h-14 rounded-full bg-transparent text-zinc-500 dark:text-zinc-400 flex items-center justify-center transition-transform hover:scale-105 active:scale-[0.97] transition-transform duration-150 shadow-sm border border-zinc-200 dark:border-zinc-800 /50">
              {" "}
              <Check strokeWidth={3} size={24} />{" "}
            </div>{" "}
            <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 text-center leading-tight">
              {" "}
              Limpar{" "}
            </span>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="px-4 mt-6 space-y-6">
        {" "}
        {/* DICA DO GEMINI */}{" "}
        <AnimatePresence>
          {" "}
          {tip && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="bg-green-50 /20 p-4 rounded-3xl border border-emerald-200 flex items-start gap-3"
            >
              {" "}
              <Lightbulb
                className="text-green-700 dark:text-green-500 shrink-0 mt-0.5"
                size={20}
              />{" "}
              <div>
                {" "}
                <h4 className="text-[12px] font-semibold text-green-700 dark:text-green-500 mb-1">
                  {" "}
                  Dica da IA{" "}
                </h4>{" "}
                <p className="text-[13px] text-zinc-900 dark:text-zinc-100 font-medium leading-snug">
                  {" "}
                  {tip}{" "}
                </p>{" "}
              </div>{" "}
            </motion.div>
          )}{" "}
        </AnimatePresence>{" "}
        {/* LISTA DE ITENS */}{" "}
        <div className="overflow-y-auto">
          {" "}
          <AnimatePresence mode="popLayout">
            {" "}
            {items.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", bounce: 0.3 }}
                className="text-center text-zinc-500 dark:text-zinc-400 py-12 flex flex-col items-center"
              >
                {" "}
                <span className="text-5xl block mb-3 opacity-50">📋</span>{" "}
                <p className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
                  {" "}
                  Sua lista está vazia.{" "}
                </p>{" "}
                <p className="text-sm mt-1 font-medium text-zinc-500 dark:text-zinc-400">
                  {" "}
                  Adicione itens para planejar a ida ao mercado.{" "}
                </p>{" "}
              </motion.div>
            )}{" "}
            {groupedItems.map((group) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                key={group.category}
                className="mb-6"
              >
                {" "}
                <motion.div
                  layout
                  className="text-[13px] font-bold text-zinc-500 dark:text-zinc-400 mt-2 mb-3 pl-1"
                >
                  {" "}
                  {CATEGORY_EMOJI_UPDATED[group.category as string] || "🛒"}
                  {""} {group.category}
                  {""}{" "}
                  <span className="lowercase text-[11px] ml-1.5 bg-zinc-200 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                    {" "}
                    {group.items.length}{" "}
                  </span>{" "}
                </motion.div>{" "}
                <motion.div layout className="flex flex-col gap-3">
                  {" "}
                  <AnimatePresence mode="popLayout">
                    {" "}
                    {group.items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -40, scale: 0.8 }}
                        animate={{
                          opacity: item.isBought ? 0.6 : 1,
                          x: 0,
                          scale: item.isBought ? 0.98 : 1,
                        }}
                        exit={{ opacity: 0, scale: 0.8, x: 20 }}
                        transition={{ type: "spring", bounce: 0.3 }}
                        className={`flex items-center gap-3.5 p-3.5 rounded-3xl border ${item.isBought ? "bg-zinc-500/10 border-zinc-200 dark:border-zinc-800 border-dashed" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm"}`}
                      >
                        {" "}
                        <button
                          onClick={() =>
                            setItems(
                              items.map((i) =>
                                i.id === item.id
                                  ? { ...i, isBought: !i.isBought }
                                  : i,
                              ),
                            )
                          }
                          className={`shrink-0 w-8 h-8 border-[2px] rounded-full flex items-center justify-center transition-colors ${item.isBought ? "bg-green-700 border-green-600" : "border-zinc-300"}`}
                        >
                          {" "}
                          {item.isBought && (
                            <Check
                              size={18}
                              strokeWidth={4}
                              className="text-white"
                            />
                          )}{" "}
                        </button>{" "}
                        <div className="flex-1 min-w-0">
                          {" "}
                          <motion.div
                            animate={{
                              color: item.isBought
                                ? "#9ca3af"
                                : "var(--color-text-main)",
                            }}
                            className={`font-semibold text-[16px] flex items-start gap-2 leading-snug ${item.isBought ? "line-through text-zinc-500 dark:text-zinc-400" : "text-zinc-900 dark:text-zinc-100"}`}
                          >
                            {" "}
                            <span className="min-w-0 flex-1 break-words">
                              {" "}
                              {formatItemName(item.name)}{" "}
                            </span>{" "}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setItems(
                                  items.map((i) =>
                                    i.id === item.id
                                      ? { ...i, isFavorite: !i.isFavorite }
                                      : i,
                                  ),
                                );
                              }}
                              className={`mt-0.5 shrink-0 transition-transform hover:scale-110 active:scale-90 ${item.isFavorite || frequentItems[item.name.trim().toLowerCase()] ? "text-yellow-500" : "text-zinc-500 dark:text-zinc-400 hover:text-yellow-400 opacity-50 hover:opacity-100"}`}
                              title={
                                item.isFavorite
                                  ? "Remover dos favoritos"
                                  : frequentItems[
                                        item.name.trim().toLowerCase()
                                      ]
                                    ? "Frequente no seu histórico"
                                    : "Marcar como favorito"
                              }
                            >
                              {" "}
                              <Star
                                size={16}
                                className={
                                  item.isFavorite ||
                                  frequentItems[item.name.trim().toLowerCase()]
                                    ? "fill-yellow-500"
                                    : ""
                                }
                                strokeWidth={
                                  item.isFavorite ||
                                  frequentItems[item.name.trim().toLowerCase()]
                                    ? 0
                                    : 2
                                }
                              />{" "}
                            </button>{" "}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setItems(
                                  items.map((i) =>
                                    i.id === item.id
                                      ? { ...i, isEssential: !i.isEssential }
                                      : i,
                                  ),
                                );
                              }}
                              className={`mt-0.5 shrink-0 transition-transform hover:scale-110 active:scale-90 ${item.isEssential ? "text-amber-500" : "text-zinc-500 dark:text-zinc-400 hover:text-amber-400 opacity-50 hover:opacity-100"}`}
                              title={
                                item.isEssential
                                  ? "Remover prioridade"
                                  : "Marcar como prioridade"
                              }
                            >
                              {" "}
                              <ExternalLink
                                size={16}
                                className={
                                  item.isEssential ? "text-amber-500" : ""
                                }
                                strokeWidth={2}
                              />{" "}
                            </button>{" "}
                          </motion.div>{" "}
                          {getBestOffer(item.name) &&
                            (() => {
                              const promo = getBestOffer(item.name)!;
                              const market = context.markets.find(
                                (m) => m.id === promo.marketId,
                              );
                              return (
                                <div className="text-[11px] font-semibold text-green-700 bg-green-100 /20 px-2 py-0.5 rounded-[12px] mt-1 inline-block border-none whitespace-normal text-wrap max-w-full">
                                  {" "}
                                  <span>
                                    {" "}
                                    Melhor:{""}{" "}
                                    <span className="money-value">
                                      {" "}
                                      {formatMoney(promo.price)}{" "}
                                    </span>
                                    {""}{" "}
                                    {market ? `no ${market.name}` : ""}{" "}
                                  </span>{" "}
                                </div>
                              );
                            })()}{" "}
                        </div>{" "}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {" "}
                          <div className="flex items-center bg-transparent rounded-xl px-1.5 py-1">
                            {" "}
                            <input
                              type="number"
                              step="0.01"
                              value={item.qty || ""}
                              onChange={(e) =>
                                setItems(
                                  items.map((i) =>
                                    i.id === item.id
                                      ? {
                                          ...i,
                                          qty: parseFloat(e.target.value) || 0,
                                        }
                                      : i,
                                  ),
                                )
                              }
                              className="w-[36px] bg-transparent text-center text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none placeholder-zinc-400"
                            />{" "}
                            <select
                              value={item.unit}
                              onChange={(e) =>
                                setItems(
                                  items.map((i) =>
                                    i.id === item.id
                                      ? { ...i, unit: e.target.value as any }
                                      : i,
                                  ),
                                )
                              }
                              className="bg-transparent text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 pr-0.5 focus:outline-none cursor-pointer appearance-none"
                              style={{
                                WebkitAppearance: "none",
                                MozAppearance: "none",
                              }}
                            >
                              {" "}
                              <option value="un">un</option>{" "}
                              <option value="kg">kg</option>{" "}
                              <option value="g">g</option>{" "}
                              <option value="L">L</option>{" "}
                              <option value="ml">ml</option>{" "}
                              <option value="pct">pct</option>{" "}
                            </select>{" "}
                          </div>{" "}
                          <button
                            onClick={() =>
                              setItems(items.filter((i) => i.id !== item.id))
                            }
                            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-red-500 hover:bg-red-50 :bg-red-900/20 rounded-xl transition-colors"
                          >
                            {" "}
                            <Trash2 size={18} />{" "}
                          </button>{" "}
                        </div>{" "}
                      </motion.div>
                    ))}{" "}
                  </AnimatePresence>{" "}
                </motion.div>{" "}
              </motion.div>
            ))}{" "}
          </AnimatePresence>{" "}
        </div>{" "}
      </div>{" "}
      {/* CLEAR CONFIRM MODAL */}{" "}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-[110] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowClearConfirm(false)}
        >
          {" "}
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <div className="w-16 h-16 bg-red-100 /30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              {" "}
              <Trash2 size={32} />{" "}
            </div>{" "}
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {" "}
              Opções de Limpeza{" "}
            </h3>{" "}
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-[14px]">
              {" "}
              O que você deseja fazer?{" "}
            </p>{" "}
            <div className="flex flex-col gap-3">
              {" "}
              <button
                onClick={() => {
                  clearBought();
                  setShowClearConfirm(false);
                }}
                className="w-full py-3.5 rounded-3xl font-bold text-white bg-orange-500 hover:bg-orange-600 active:scale-[0.97] transition-transform duration-150 transition-all shadow-sm"
              >
                {" "}
                Desmarcar Itens (Limpar Carrinho){" "}
              </button>{" "}
              <button
                onClick={() => {
                  setItems([]);
                  setShowClearConfirm(false);
                }}
                className="w-full py-3.5 rounded-3xl font-bold text-white bg-red-500 hover:bg-red-600 active:scale-[0.97] transition-transform duration-150 transition-all shadow-sm"
              >
                {" "}
                Apagar Tudo (Limpar Lista){" "}
              </button>{" "}
              <button
                onClick={() => setShowClearConfirm(false)}
                className="w-full py-3.5 mt-2 rounded-3xl font-bold text-zinc-500 dark:text-zinc-400 bg-transparent active:scale-[0.97] transition-transform duration-150 transition-all"
              >
                {" "}
                Cancelar{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* MODAL BOTTOM SHEET DO CATÁLOGO HIDDEN */}{" "}
      {showCatalog && (
        <div
          className="fixed inset-0 z-[100] flex justify-center items-end bg-black/40 backdrop-blur-[2px] animate-in fade-in"
          onClick={() => setShowCatalog(false)}
        >
          {" "}
          <div
            className="w-full max-w-lg bg-zinc-50 dark:bg-zinc-900 rounded-t-[32px] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom border-none"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-zinc-50 dark:bg-zinc-900 z-10">
              {" "}
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {" "}
                Adicionar Produto{" "}
              </h2>{" "}
              <button
                onClick={() => {
                  setShowCatalog(false);
                  setSearchQuery("");
                }}
                className="p-2 bg-white dark:bg-zinc-900 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100 :text-zinc-200 transition-colors flex items-center justify-center -mr-2"
              >
                {" "}
                <ChevronDown size={24} />{" "}
              </button>{" "}
            </div>{" "}
            <div className="px-4 pt-4 pb-2 bg-zinc-50 dark:bg-zinc-900 sticky top-[73px] z-10">
              {" "}
              <div className="relative">
                {" "}
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
                />{" "}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar itens..."
                  className="w-full pl-11 pr-4 py-4 bg-white dark:bg-zinc-900 border-none rounded-[20px] focus:outline-none focus:ring-2 focus:ring-green-600 text-[15px] transition-colors placeholder-zinc-400"
                />{" "}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hoverdark:hover:text-green-500 dark:text-green-500 :text-zinc-200 bg-transparent rounded-full p-1.5"
                  >
                    {" "}
                    <X size={14} />{" "}
                  </button>
                )}{" "}
              </div>{" "}
            </div>{" "}
            <div className="overflow-y-auto p-4 space-y-4 bg-transparent">
              {" "}
              {searchQuery ? (
                searchResults.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 dark:text-zinc-400">
                    {" "}
                    <p className="mb-4">Nenhum produto encontrado.</p>{" "}
                    <button
                      onClick={() =>
                        handleAddFromCatalog(searchQuery, "Outros")
                      }
                      className="px-6 py-3 bg-green-700 text-white font-semibold rounded-full shadow-sm hover:bg-green-700-hover transition-colors active:scale-[0.97]"
                    >
                      {" "}
                      Adicionar"{searchQuery}"{" "}
                    </button>{" "}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-zinc-900 #1C1C1E] rounded-3xl border-none p-5">
                    {" "}
                    <h4 className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 mb-4">
                      {" "}
                      Resultados da Busca{" "}
                    </h4>{" "}
                    <div className="flex flex-wrap gap-2">
                      {" "}
                      {searchResults.map((item, index) => {
                        const isAdded = normalizedItemNamesForCatalog.has(
                          item.name.trim().toLowerCase(),
                        );
                        return (
                          <button
                            key={index}
                            onClick={() =>
                              handleAddFromCatalog(item.name, item.category)
                            }
                            className={`px-4 py-2 text-[14px] font-medium rounded-full transition-colors flex items-start gap-1.5 active:scale-[0.97] transition-transform duration-150 text-left max-w-full border ${isAdded ? "bg-green-700 text-white border-green-600 shadow-sm" : "bg-transparent hover:bg-green-50 dark:hover:bg-emerald-900/30 text-zinc-500 dark:text-zinc-400 hoverdark:hover:text-green-500 dark:text-green-500 dark:hover:text-green-500 dark:text-green-500 border-zinc-200 dark:border-zinc-800"}`}
                          >
                            {" "}
                            {isAdded ? (
                              <Check
                                size={14}
                                strokeWidth={3}
                                className="shrink-0 mt-0.5 text-white"
                              />
                            ) : (
                              <Plus
                                size={14}
                                className="opacity-50 shrink-0 mt-0.5"
                              />
                            )}{" "}
                            <span className="leading-snug break-words">
                              {" "}
                              {formatItemName(item.name)}{" "}
                            </span>{" "}
                          </button>
                        );
                      })}{" "}
                    </div>{" "}
                    <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
                      {" "}
                      <p className="text-zinc-500 dark:text-zinc-400 text-[13px] mb-3">
                        {" "}
                        Não encontrou o que queria?{" "}
                      </p>{" "}
                      <button
                        onClick={() => {
                          handleAddFromCatalog(searchQuery, "Outros");
                          setSearchQuery("");
                        }}
                        className="px-5 py-2.5 bg-transparent text-zinc-900 dark:text-zinc-100 text-[14px] font-semibold rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm hover:bg-transparent :bg-zinc-700 transition-colors"
                      >
                        {" "}
                        Adicionar"{searchQuery}"como item avulso{" "}
                      </button>{" "}
                    </div>{" "}
                  </div>
                )
              ) : (
                PRODUCT_CATALOG.map((cat, i) => {
                  const isExpanded = expandedCategory === cat.name;
                  return (
                    <div
                      key={i}
                      className="bg-white dark:bg-zinc-900 #1C1C1E] rounded-3xl border-none overflow-hidden transition-all shadow-sm"
                    >
                      {" "}
                      <button
                        onClick={() =>
                          setExpandedCategory(isExpanded ? null : cat.name)
                        }
                        className="w-full px-5 py-5 flex items-center justify-between text-left focus:outline-none"
                      >
                        {" "}
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-[15px] flex items-center gap-3">
                          {" "}
                          <span className="text-xl">{cat.icon}</span>{" "}
                          {cat.name}{" "}
                        </span>{" "}
                        {isExpanded ? (
                          <ChevronUp
                            size={20}
                            className="text-zinc-500 dark:text-zinc-400"
                          />
                        ) : (
                          <ChevronDown
                            size={20}
                            className="text-zinc-500 dark:text-zinc-400"
                          />
                        )}{" "}
                      </button>{" "}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-0 space-y-4 border-t border-zinc-200 dark:border-zinc-800/50">
                          {" "}
                          {cat.subcategories.map((sub, j) => (
                            <div key={j} className="pt-2">
                              {" "}
                              <h4 className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 mb-3">
                                {" "}
                                {sub.name}{" "}
                              </h4>{" "}
                              <div className="flex flex-wrap gap-2">
                                {" "}
                                {sub.items.map((itemName, k) => {
                                  const isAdded =
                                    normalizedItemNamesForCatalog.has(
                                      itemName.trim().toLowerCase(),
                                    );
                                  return (
                                    <button
                                      key={k}
                                      onClick={() =>
                                        handleAddFromCatalog(itemName, cat.name)
                                      }
                                      className={`px-4 py-2 text-[14px] font-medium rounded-full transition-colors flex items-start gap-1.5 active:scale-[0.97] transition-transform duration-150 text-left max-w-full border ${isAdded ? "bg-green-700 text-white border-green-600 shadow-sm" : "bg-transparent hover:bg-green-50 dark:hover:bg-emerald-900/30 text-zinc-500 dark:text-zinc-400 hoverdark:hover:text-green-500 dark:text-green-500 dark:hover:text-green-500 dark:text-green-500 border-zinc-200 dark:border-zinc-800"}`}
                                    >
                                      {" "}
                                      {isAdded ? (
                                        <Check
                                          size={14}
                                          strokeWidth={3}
                                          className="shrink-0 mt-0.5 text-white"
                                        />
                                      ) : (
                                        <Plus
                                          size={14}
                                          className="opacity-50 shrink-0 mt-0.5"
                                        />
                                      )}{" "}
                                      <span className="leading-snug text-wrap">
                                        {" "}
                                        {formatItemName(itemName)}{" "}
                                      </span>{" "}
                                    </button>
                                  );
                                })}{" "}
                              </div>{" "}
                            </div>
                          ))}{" "}
                        </div>
                      )}{" "}
                    </div>
                  );
                })
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
};

```

### `src/components/ModoCompra.tsx`
```tsx
import { motion, AnimatePresence } from "motion/react";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { AppContextType, Item, HistoryItem } from "../types";
import {
  formatMoney,
  formatItemName,
  generateId,
  CATEGORY_EMOJI_UPDATED,
} from "../utils";
import {
  Check,
  AlertTriangle,
  Plus,
  Minus,
  Search,
  CreditCard,
  X,
  Trash2,
  Store,
  Ban,
  ShoppingBag,
} from "lucide-react";
export const ModoCompra: React.FC<{ context: AppContextType }> = ({
  context,
}) => {
  const {
    items,
    setItems,
    settings,
    markets,
    promotions,
    setHistory,
    history,
    shoppingMarketId,
    setShoppingMarketId,
  } = context;
  const [searchTerm, setSearchTerm] = useState("");
  const [showAvulso, setShowAvulso] = useState(false);
  const [avulsoVal, setAvulsoVal] = useState("");
  const [delayedSorting, setDelayedSorting] = useState<boolean>(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [purchaseSummary, setPurchaseSummary] = useState<{
    total: number;
    economy: number;
    itemCount: number;
    marketName: string;
  } | null>(null);
  const activeItems = useMemo(() => items.filter((i) => !i.notFound), [items]);
  const [scaleTotal, setScaleTotal] = useState(false);
  const [lastBoughtName, setLastBoughtName] = useState("");
  const [showBoughtToast, setShowBoughtToast] = useState(false);
  const totalSpent = useMemo(() => {
    return activeItems
      .filter((i) => i.isBought)
      .reduce(
        (acc, curr) => acc + (curr.actualPrice || 0) * (curr.qty || 1),
        0,
      );
  }, [activeItems]);
  const prevTotalRef = useRef(totalSpent);
  useEffect(() => {
    if (totalSpent !== prevTotalRef.current) {
      setScaleTotal(true);
      const t = setTimeout(() => setScaleTotal(false), 150);
      prevTotalRef.current = totalSpent;
      return () => clearTimeout(t);
    }
  }, [totalSpent]);
  const toggleBought = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, isBought: !item.isBought } : item,
      ),
    );
    setDelayedSorting(true);
  };
  const markNotFound = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, notFound: true, isBought: false } : item,
      ),
    );
  };
  useEffect(() => {
    if (delayedSorting) {
      const timer = setTimeout(() => {
        setDelayedSorting(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [delayedSorting, items]);
  const updatePrice = (id: string, newPrice: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, actualPrice: newPrice } : item,
      ),
    );
  };
  const handlePriceInput = (id: string, inputValue: string) => {
    const numericStr = inputValue.replace(/\D/g, "");
    if (!numericStr) {
      updatePrice(id, 0);
      return;
    }
    const newPrice = parseInt(numericStr, 10) / 100;
    updatePrice(id, newPrice);
  };
  const getPriceDisplayValue = (price: number) => {
    if (!price) return "";
    return price.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  const updateQtyExplicit = (id: string, newQty: number) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, qty: newQty } : item)),
    );
  };
  const handleQtyChange = (id: string, inputValue: string, unit: string) => {
    const isFractional = ["kg", "l"].includes(unit.toLowerCase());
    const numericStr = inputValue.replace(/\D/g, "");
    if (isFractional) {
      if (!numericStr) {
        updateQtyExplicit(id, 0);
        return;
      }
      updateQtyExplicit(id, parseInt(numericStr, 10) / 1000);
    } else {
      if (!numericStr) {
        updateQtyExplicit(id, 0);
        return;
      }
      updateQtyExplicit(id, parseInt(numericStr, 10));
    }
  };
  const getQtyDisplayValue = (qty: number, unit: string) => {
    const isFractional = ["kg", "l"].includes(unit.toLowerCase());
    if (isFractional)
      return (qty || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
    return (qty || 0).toString();
  };
  const handleAvulsoAdd = () => {
    const numericStr = avulsoVal.replace(/\D/g, "");
    if (!numericStr) return;
    const newPrice = parseInt(numericStr, 10) / 100;
    if (newPrice <= 0) return;
    setItems([
      ...items,
      {
        id: generateId(),
        name: `Item Avulso`,
        category: "Outros",
        qty: 1,
        unit: "un",
        actualPrice: newPrice,
        isBought: true,
        isEssential: false,
        onlyPromo: false,
        notes: "",
      },
    ]);
    setAvulsoVal("");
    setShowAvulso(false);
  };
  const handleMarketSelect = (marketId: string) => {
    setShoppingMarketId(marketId);
    if (!marketId) return;
    const marketPromos = promotions.filter((p) => p.marketId === marketId);
    setItems((prev) =>
      prev.map((item) => {
        if (item.isBought) return item;
        /* Conserva valor preenchido manualmente */ const promo =
          marketPromos.find((p) => p.itemName === item.name);
        if (promo) {
          return { ...item, actualPrice: promo.price };
        }
        return item;
      }),
    );
  };
  const budgetPercent =
    settings.budget > 0 ? (totalSpent / settings.budget) * 100 : 0;
  let headerColor = "bg-green-700";
  let textColor = "text-white";
  let subTextColor = "text-green-100";
  let pulseClass = "";
  if (budgetPercent > 100) {
    headerColor = "bg-red-600";
    textColor = "text-white";
    subTextColor = "text-red-100";
    pulseClass = "animate-pulse";
  } else if (budgetPercent >= 90) {
    headerColor = "bg-red-200";
    textColor = "text-red-800";
    subTextColor = "text-red-700";
  } else if (budgetPercent >= 70) {
    headerColor = "bg-orange-500";
    textColor = "text-white";
    subTextColor = "text-orange-100";
  }
  const finishPurchase = () => {
    let economy = 0;
    if (settings.budget > 0) {
      economy = settings.budget - totalSpent;
    } else {
      /* Simplification of economy if no budget */ const expectedTotal =
        activeItems.reduce((acc, curr) => acc + 15.0 * curr.qty, 0);
      /* 15 = placeholder */ economy = expectedTotal - totalSpent;
    }
    const h: HistoryItem = {
      id: generateId(),
      date: new Date().toISOString(),
      marketId: shoppingMarketId || null,
      totalSpent: totalSpent,
      economyGenerated: Math.max(0, economy),
      /* para não ficar negativo se passou */ items: activeItems
        .filter((i) => i.isBought)
        .map((i) => ({
          nome: i.name,
          quantidade: i.qty,
          subtotal: (i.actualPrice || 0) * i.qty,
        })),
    };
    setHistory([h, ...history]);
    setItems(
      items.map((i) => ({
        ...i,
        isBought: false,
        actualPrice: 0,
        notFound: false,
      })),
    );
    setShowFinishConfirm(false);
    context.setActiveTab("lista");
  };
  const itemsByCategory = useMemo(() => {
    const filteredItems = activeItems.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    const grouped = filteredItems.reduce(
      (acc, item) => {
        const cat = item.category || "Outros";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      },
      {} as Record<string, Item[]>,
    );
    if (!delayedSorting) {
      Object.keys(grouped).forEach((cat) => {
        grouped[cat].sort((a, b) => {
          if (a.isBought === b.isBought) {
            if (a.isEssential && !b.isEssential) return -1;
            if (!a.isEssential && b.isEssential) return 1;
            return a.name.localeCompare(b.name);
          }
          return a.isBought ? 1 : -1;
        });
      });
    }
    return grouped;
  }, [activeItems, searchTerm, delayedSorting]);
  /* Se não tem itens */ if (items.length === 0)
    return (
      <div className="p-10 text-center text-zinc-500 dark:text-zinc-400 font-medium">
        Sua lista está vazia. Adicione itens antes de ir às compras.
      </div>
    );
  return (
    <div className="pb-36 bg-transparent min-h-screen">
      {" "}
      {}{" "}
      <div
        className={`sticky top-0 z-30 pt-[calc(env(safe-area-inset-top)+20px)] px-6 pb-8 rounded-b-[40px] overflow-hidden shadow-lg transition-colors duration-500 ${headerColor} ${pulseClass}`}
      >
        {" "}
        <div className="absolute rounded-full border-[12px] border-white/10" style={{ width: 280, height: 280, top: -100, left: -100 }}></div>
        <div className="absolute rounded-full bg-black/10" style={{ width: 140, height: 140, bottom: -20, right: -20 }}></div>
        <div className="absolute inset-0 opacity-100 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("/pattern-dark.svg")', backgroundSize: '100px 100px', backgroundRepeat: 'repeat' }}></div>{" "}
        {}{" "}
        <div className="relative z-10 mb-4 bg-black/10 backdrop-blur-sm rounded-3xl flex items-center gap-2 px-3 py-2 border border-white/10">
          {" "}
          <Store className={textColor} size={16} />{" "}
          <select
            value={shoppingMarketId}
            onChange={(e) => handleMarketSelect(e.target.value)}
            className={`flex-1 bg-transparent border-none focus:outline-none font-semibold text-[14px] cursor-pointer appearance-none ${textColor}`}
          >
            {" "}
            <option value="" className="text-zinc-900 dark:text-zinc-100">
              -- Selecione o Mercado --
            </option>{" "}
            {markets.map((m) => (
              <option className="text-zinc-900 dark:text-zinc-100" key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}{" "}
          </select>{" "}
        </div>{" "}
        <div className="flex justify-between items-end relative z-10">
          {" "}
          <div>
            {" "}
            <div className={`text-[12px] font-semibold mb-1 ${subTextColor}`}>
              Valor no Carrinho
            </div>{" "}
            <div
              className={`text-[36px] font-bold tracking-tight leading-none ${textColor}`}
            >
              {" "}
              <span className="text-[20px] font-semibold mr-1 opacity-80">
                R$
              </span>{" "}
              <span
                className={`money-value transition-transform duration-150 inline-block ${scaleTotal ? "scale-[1.06]" : "scale-100"}`}
              >
                {totalSpent.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>{" "}
            </div>{" "}
            {settings.budget > 0 && (
              <div className={`text-[13px] font-medium mt-1 ${subTextColor}`}>
                {" "}
                de R${" "}
                {settings.budget.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}{" "}
                ·{" "}
                {budgetPercent > 100 ? (
                  <span className="font-bold ml-1">
                    Estourou R${" "}
                    {(totalSpent - settings.budget).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                ) : (
                  <span className="ml-1">
                    Faltam R${" "}
                    {(settings.budget - totalSpent).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                )}{" "}
              </div>
            )}{" "}
          </div>{" "}
          {budgetPercent >= 70 && budgetPercent < 100 && (
            <div className="bg-black/10 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold backdrop-blur-sm">
              {" "}
              <AlertTriangle size={14} /> Atenção{" "}
            </div>
          )}{" "}
          {budgetPercent >= 100 && (
            <div className="bg-black/20 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold backdrop-blur-sm">
              {" "}
              ⛔ Passou!{" "}
            </div>
          )}{" "}
        </div>{" "}
        <div
          className={`mt-4 relative z-10 text-[13px] font-semibold flex items-center gap-2 ${subTextColor}`}
        >
          {" "}
          <span>
            {activeItems.filter((i) => i.isBought).length} de{" "}
            {activeItems.length} itens
          </span>{" "}
          <span>·</span>{" "}
          <span>
            {activeItems.filter((i) => !i.isBought).length} pendentes
          </span>{" "}
        </div>{" "}
        {/* PROGRESS BAR */}{" "}
        {settings.budget > 0 && (
          <div className="mt-3 relative z-10">
            {" "}
            <div
              className={`h-2.5 rounded-full overflow-hidden bg-black/10 border border-white/10 shadow-inner`}
            >
              {" "}
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${budgetPercent >= 90 ? "bg-red-500" : "bg-white dark:bg-zinc-900"}`}
                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
              />{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
      <AnimatePresence>
        {" "}
        {showBoughtToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[calc(env(safe-area-inset-top)+80px)] left-4 right-4 z-50 bg-green-700-hover text-white py-2.5 px-4 rounded-2xl text-center font-semibold text-sm shadow-lg pointer-events-none"
          >
            {" "}
            ✅ {lastBoughtName} adicionado!{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
      <div className="px-4 mt-6">
        {" "}
        {/* COMPACT SEARCH & AVULSO */}{" "}
        <div className="flex gap-2 mb-6">
          {" "}
          <div className="relative flex-1">
            {" "}
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
            />{" "}
            <input
              type="text"
              placeholder="Buscar no carrinho..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 py-3.5 rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-600 font-medium placeholder-zinc-400 text-[15px] shadow-sm"
            />{" "}
          </div>{" "}
          <button
            onClick={() => setShowAvulso(!showAvulso)}
            className={`shrink-0 p-3.5 rounded-3xl border flex items-center justify-center transition-colors ${showAvulso ? "bg-green-700-hover text-white border-green-700" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 shadow-sm"}`}
          >
            {" "}
            <Plus size={22} />{" "}
          </button>{" "}
        </div>{" "}
        {showAvulso && (
          <div className="mb-6 p-4 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
            {" "}
            <div className="bg-green-50 p-3 rounded-full text-green-700 dark:text-green-500">
              <CreditCard size={20} />
            </div>{" "}
            <div className="relative flex-1">
              {" "}
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-zinc-500 dark:text-zinc-400">
                R$
              </span>{" "}
              <input
                type="tel"
                autoFocus
                placeholder="0,00"
                value={avulsoVal}
                onChange={(e) => {
                  const numericStr = e.target.value.replace(/\D/g, "");
                  if (!numericStr) {
                    setAvulsoVal("");
                    return;
                  }
                  const val = parseInt(numericStr, 10) / 100;
                  setAvulsoVal(
                    val.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }),
                  );
                }}
                className="w-full bg-transparent pl-7 pr-2 py-1 outline-none font-bold text-[20px] text-zinc-900 dark:text-zinc-100"
                onKeyDown={(e) => e.key === "Enter" && handleAvulsoAdd()}
              />{" "}
            </div>{" "}
            <button
              onClick={handleAvulsoAdd}
              className="bg-green-700-hover text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-md active:scale-[0.97] transition-transform duration-150"
            >
              Adicionar
            </button>{" "}
          </div>
        )}{" "}
        {/* ITEMS LIST */}{" "}
        <div className="flex flex-col gap-6">
          {" "}
          {Object.entries<Item[]>(itemsByCategory)
            .sort(([catA], [catB]) => catA.localeCompare(catB))
            .map(([category, catItems]) => {
              const catSubtotal = catItems.reduce(
                (acc, item) =>
                  acc +
                  (typeof item.actualPrice === "number"
                    ? item.actualPrice
                    : 0) *
                    (typeof item.qty === "number" ? item.qty : 1),
                0,
              );
              return (
                <div key={category} className="space-y-3">
                  {" "}
                  <div className="flex items-center gap-3 px-2">
                    {" "}
                    <h3 className="text-[14px] font-bold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {CATEGORY_EMOJI_UPDATED[category] || "🛒"} {category}
                    </h3>{" "}
                    <div className="flex-1 border-t border-dashed border-zinc-200 dark:border-zinc-800"></div>{" "}
                    {catSubtotal > 0 && (
                      <div className="text-[14px] font-bold text-green-700 dark:text-green-500 whitespace-nowrap">
                        {" "}
                        R${" "}
                        {catSubtotal.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                      </div>
                    )}{" "}
                  </div>{" "}
                  <div className="flex flex-col gap-3">
                    {" "}
                    {catItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-3xl border transition-all duration-500 ease-out flex gap-3 items-center ${
                          item.isBought
                            ? "bg-transparent border-dashed border-zinc-200 dark:border-zinc-800 opacity-40 scale-[0.98]"
                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm opacity-100 scale-100"
                        }`}
                      >
                        {" "}
                        {/* HUGE CHECK TARGET */}{" "}
                        <button
                          onClick={() => toggleBought(item.id)}
                          className={`w-[52px] h-[52px] shrink-0 rounded-full flex items-center justify-center transition-all ${
                            item.isBought
                              ? "bg-green-700 border-none"
                              : "bg-transparent border-[3px] border-zinc-200 dark:border-zinc-800"
                          }`}
                        >
                          {" "}
                          {item.isBought && (
                            <Check
                              size={28}
                              strokeWidth={4}
                              className="text-white"
                            />
                          )}{" "}
                        </button>{" "}
                        <div className="flex-1 min-w-0 py-1">
                          {" "}
                          <div className="flex items-start justify-between">
                            {" "}
                            <div
                              className={`text-[17px] font-semibold leading-tight pr-2 flex-1 min-w-0 break-words ${item.isBought ? "line-through text-zinc-500 dark:text-zinc-400" : "text-zinc-900 dark:text-zinc-100"}`}
                            >
                              {" "}
                              {item.name}{" "}
                            </div>{" "}
                            {!item.isBought && (
                              <button
                                onClick={() => markNotFound(item.id)}
                                className="text-amber-500 bg-amber-50 px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0"
                              >
                                <Ban size={14} /> Não achei
                              </button>
                            )}{" "}
                          </div>{" "}
                          {/* INPUTS ROW */}{" "}
                          <div
                            className="flex items-center gap-2 mt-2.5"
                            onClick={(e) => {
                              if (item.isBought) e.stopPropagation();
                            }}
                          >
                            {" "}
                            {/* QTY */}{" "}
                            <div
                              className={`flex items-center rounded-xl p-1 shrink-0 ${item.isBought ? "bg-transparent" : "bg-transparent"}`}
                            >
                              {" "}
                              {["kg", "l"].includes(item.unit.toLowerCase()) ? (
                                <input
                                  disabled={item.isBought}
                                  type="tel"
                                  value={getQtyDisplayValue(
                                    item.qty,
                                    item.unit,
                                  )}
                                  onChange={(e) =>
                                    handleQtyChange(
                                      item.id,
                                      e.target.value,
                                      item.unit,
                                    )
                                  }
                                  className="w-[60px] bg-transparent text-center text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                                />
                              ) : (
                                <>
                                  {" "}
                                  <button
                                    disabled={item.isBought}
                                    onClick={() =>
                                      updateQtyExplicit(
                                        item.id,
                                        Math.max(0, item.qty - 1),
                                      )
                                    }
                                    className="p-1 text-zinc-500 dark:text-zinc-400 active:bg-white dark:bg-zinc-900 :bg-zinc-700 rounded-lg"
                                  >
                                    <Minus size={14} />
                                  </button>{" "}
                                  <input
                                    disabled={item.isBought}
                                    type="tel"
                                    value={getQtyDisplayValue(
                                      item.qty,
                                      item.unit,
                                    )}
                                    onChange={(e) =>
                                      handleQtyChange(
                                        item.id,
                                        e.target.value,
                                        item.unit,
                                      )
                                    }
                                    className="w-6 bg-transparent text-center text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                                  />{" "}
                                  <button
                                    disabled={item.isBought}
                                    onClick={() =>
                                      updateQtyExplicit(item.id, item.qty + 1)
                                    }
                                    className="p-1 text-zinc-500 dark:text-zinc-400 active:bg-white dark:bg-zinc-900 :bg-zinc-700 rounded-lg"
                                  >
                                    <Plus size={14} />
                                  </button>{" "}
                                </>
                              )}{" "}
                              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 pr-1">
                                {item.unit}
                              </span>{" "}
                            </div>{" "}
                            <div className="text-zinc-500 dark:text-zinc-400 font-semibold text-xs">
                              ×
                            </div>{" "}
                            {/* PRICE */}{" "}
                            <div className="relative flex-1">
                              {" "}
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                                R$
                              </span>{" "}
                              <input
                                disabled={item.isBought}
                                type="tel"
                                value={getPriceDisplayValue(
                                  item.actualPrice || 0,
                                )}
                                onChange={(e) =>
                                  handlePriceInput(item.id, e.target.value)
                                }
                                placeholder="0,00"
                                className={`w-full pl-6 pr-2 py-2 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-green-600 text-[14px] transition-colors ${
                                  item.isBought
                                    ? "bg-transparent text-zinc-500 dark:text-zinc-400"
                                    : "bg-transparent text-green-700 dark:text-green-500"
                                }`}
                              />{" "}
                            </div>{" "}
                          </div>{" "}
                          {}{" "}
                          {!item.isBought &&
                            promotions.filter(
                              (p) =>
                                p.itemName.toLowerCase().trim() ===
                                item.name.toLowerCase().trim(),
                            ).length > 0 && (
                              <div className="mt-3 flex flex-col gap-1.5 border-t border-zinc-200 dark:border-zinc-800 pt-2">
                                {" "}
                                {promotions
                                  .filter(
                                    (p) =>
                                      p.itemName.toLowerCase().trim() ===
                                      item.name.toLowerCase().trim(),
                                  )
                                  .sort((a, b) => {
                                    /* Sort by shoppingMarketId first, then by price */ if (
                                      a.marketId === shoppingMarketId &&
                                      b.marketId !== shoppingMarketId
                                    )
                                      return -1;
                                    if (
                                      b.marketId === shoppingMarketId &&
                                      a.marketId !== shoppingMarketId
                                    )
                                      return 1;
                                    return a.price / a.qty - b.price / b.qty;
                                  })
                                  .map((promo, idx) => {
                                    const market = markets.find(
                                      (m) => m.id === promo.marketId,
                                    );
                                    const precoUnitario =
                                      promo.price / promo.qty;
                                    const isCurrentMarket =
                                      promo.marketId === shoppingMarketId;
                                    return (
                                      <div
                                        key={idx}
                                        className={`flex justify-between items-center px-2.5 py-1.5 rounded-lg border ${
                                          isCurrentMarket
                                            ? "bg-green-50 border-green-100"
                                            : "bg-transparent border-zinc-200 dark:border-zinc-800"
                                        }`}
                                      >
                                        {" "}
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                          {" "}
                                          <Store
                                            size={12}
                                            className={`shrink-0 ${isCurrentMarket ? "text-green-700 dark:text-green-500" : "text-zinc-500 dark:text-zinc-400"}`}
                                          />{" "}
                                          <span
                                            className={`text-[11px] font-bold truncate ${isCurrentMarket ? "text-green-700 dark:text-green-500" : "text-zinc-500 dark:text-zinc-400"}`}
                                          >
                                            {" "}
                                            {market?.name || "Mercado"}{" "}
                                          </span>{" "}
                                        </div>{" "}
                                        <div
                                          className={`text-[12px] font-bold shrink-0 ${isCurrentMarket ? "text-green-700 dark:text-green-500" : "text-zinc-500 dark:text-zinc-400"}`}
                                        >
                                          {" "}
                                          <span className="money-value">
                                            {formatMoney(precoUnitario)}
                                          </span>
                                          <span
                                            className={`text-[9px] font-medium ${isCurrentMarket ? "text-green-700 dark:text-green-500" : "text-zinc-500 dark:text-zinc-400"}`}
                                          >
                                            /{item.unit}
                                          </span>{" "}
                                        </div>{" "}
                                      </div>
                                    );
                                  })}{" "}
                              </div>
                            )}{" "}
                        </div>{" "}
                      </div>
                    ))}{" "}
                  </div>{" "}
                </div>
              );
            })}{" "}
        </div>{" "}
        {/* NOT FOUND SECTION */}{" "}
        {items.filter((i) => i.notFound).length > 0 && (
          <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            {" "}
            <h3 className="text-[12px] font-bold text-red-500 mb-3 px-2 flex items-center gap-2">
              {" "}
              <Ban size={14} strokeWidth={3} /> Itens Não Encontrados (
              {items.filter((i) => i.notFound).length}){" "}
            </h3>{" "}
            <div className="flex flex-wrap gap-2">
              {" "}
              {items
                .filter((i) => i.notFound)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      setItems(
                        items.map((i) =>
                          i.id === item.id ? { ...i, notFound: false } : i,
                        ),
                      )
                    }
                    className="text-[13px] font-medium max-w-full bg-red-50 text-red-600 px-3 py-1.5 rounded-xl border border-red-100 flex items-center gap-2 hover:bg-red-100 transition-colors"
                  >
                    {" "}
                    <span className="line-through opacity-70 flex-1 min-w-0 break-words text-left">
                      {item.name}
                    </span>{" "}
                    <Plus size={14} className="shrink-0" />{" "}
                  </button>
                ))}{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* FLOAT BUTTON FINALIZAR COMPRA */}{" "}
      <div className="fixed bottom-20 left-0 w-full flex justify-center z-40 pointer-events-none px-4">
        {" "}
        <button
          onClick={() => setShowFinishConfirm(true)}
          className="pointer-events-auto bg-transparent text-white px-6 py-3.5 rounded-full font-bold text-[15px] shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center gap-2 hover:scale-105 transition-transform"
        >
          {" "}
          <ShoppingBag size={18} /> Finalizar Compra{" "}
        </button>{" "}
      </div>{" "}
      {/* CONFIRM FINISH PURCHASE MODAL */}{" "}
      {showFinishConfirm && (
        <div
          className="fixed inset-0 z-[110] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowFinishConfirm(false)}
        >
          {" "}
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <div className="w-16 h-16 bg-green-50 text-green-700 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              {" "}
              <ShoppingBag size={32} />{" "}
            </div>{" "}
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Finalizar e Salvar?
            </h3>{" "}
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">
              Sua compra será salva no histórico e os itens do carrinho atual
              serão desmarcados.
            </p>{" "}
            <div className="flex gap-3">
              {" "}
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-3 rounded-3xl font-bold text-zinc-500 dark:text-zinc-400 bg-transparent"
              >
                Voltar
              </button>{" "}
              <button
                onClick={finishPurchase}
                className="flex-1 py-3 rounded-3xl font-bold text-white bg-green-700 hover:bg-green-700-hover"
              >
                Sim, Finalizar
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
      <AnimatePresence>
        {" "}
        {purchaseSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-gradient-to-b from-emerald-600 via-emerald-500 to-teal-500 flex flex-col items-center justify-center p-8"
          >
            {" "}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="text-7xl mb-6"
            >
              {" "}
              🎉{" "}
            </motion.div>{" "}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-white text-center mb-1"
            >
              {" "}
              Compra Finalizada!{" "}
            </motion.h1>{" "}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-green-100 font-medium mb-8"
            >
              {" "}
              no {purchaseSummary.marketName}{" "}
            </motion.p>{" "}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              {" "}
              <div className="text-center mb-4">
                {" "}
                <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  {" "}
                  Total da Compra{" "}
                </div>{" "}
                <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {" "}
                  <span className="money-value">
                    {formatMoney(purchaseSummary.total)}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3">
                {" "}
                <div className="flex justify-between text-sm">
                  {" "}
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Itens comprados
                  </span>{" "}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {" "}
                    {purchaseSummary.itemCount}{" "}
                  </span>{" "}
                </div>{" "}
                {purchaseSummary.economy > 0 && (
                  <div className="flex justify-between text-sm">
                    {" "}
                    <span className="text-zinc-500 dark:text-zinc-400">
                      💰 Economia
                    </span>{" "}
                    <span className="font-bold text-violet-600">
                      {" "}
                      <span className="money-value">
                        {formatMoney(purchaseSummary.economy)}
                      </span>{" "}
                    </span>{" "}
                  </div>
                )}{" "}
                {context.settings.budget > 0 &&
                  purchaseSummary.total < context.settings.budget && (
                    <div className="bg-green-50 rounded-2xl p-3 text-center mt-2">
                      {" "}
                      <span className="text-sm font-semibold text-green-700 dark:text-green-500">
                        {" "}
                        🎯 Ficou{" "}
                        <span className="money-value">
                          {formatMoney(
                            context.settings.budget - purchaseSummary.total,
                          )}
                        </span>{" "}
                        abaixo do orçamento!{" "}
                      </span>{" "}
                    </div>
                  )}{" "}
              </div>{" "}
            </motion.div>{" "}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={() => {
                setPurchaseSummary(null);
                setItems(
                  items.map((i: Item) => ({
                    ...i,
                    isBought: false,
                    actualPrice: 0,
                    notFound: false,
                  })),
                );
                setShowFinishConfirm(false);
                context.setActiveTab("lista");
              }}
              className="mt-8 bg-white dark:bg-zinc-900/20 backdrop-blur text-white font-bold py-4 px-12 rounded-full text-lg active:scale-[0.97] transition-transform shadow-lg"
            >
              {" "}
              Voltar para Lista{" "}
            </motion.button>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};

```

### `src/components/Promocoes.tsx`
```tsx
import React, { useState, useMemo, useEffect } from "react";
import { Market, Promotion, Unit, AppContextType } from "../types";
import {
  generateId,
  formatMoney,
  getPricePerBaseUnit,
  convertToBaseUnit,
  formatItemName,
} from "../utils";
import {
  Store,
  Plus,
  Calendar,
  Trash2,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PRODUCT_CATALOG } from "../data/catalog";
const UNITS: Unit[] = ["un", "kg", "g", "L", "ml", "pct"];
export const Promocoes: React.FC<{ context: AppContextType }> = ({
  context,
}) => {
  const { markets, setMarkets, promotions, setPromotions } = context;
  const [selectedMarket, setSelectedMarket] = useState<string>(
    markets[0]?.id || "",
  );
  const [newMarketName, setNewMarketName] = useState("");
  /* States para nova promoção */ const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [qty, setQty] = useState<number | string>(1);
  const [unit, setUnit] = useState<Unit>("un");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  /* States para o modal de catálogo */ const [showCatalog, setShowCatalog] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  /* Filtro */ const [promoFilter, setPromoFilter] = useState<
    "all" | "today" | "tomorrow"
  >("all");
  const flatCatalog = useMemo(() => {
    return PRODUCT_CATALOG.flatMap((cat) =>
      cat.subcategories.flatMap((sub) =>
        sub.items.map((item) => ({
          name: item,
          category: cat.name,
          searchKey: item
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""),
        })),
      ),
    );
  }, []);
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return flatCatalog.filter((i) => i.searchKey.includes(query));
  }, [searchQuery, flatCatalog]);
  const handlePriceInput = (inputValue: string) => {
    const numericStr = inputValue.replace(/\D/g, "");
    if (!numericStr) {
      setPrice(0);
      return;
    }
    const newPrice = parseInt(numericStr, 10) / 100;
    setPrice(newPrice);
  };
  const getPriceDisplayValue = (val: number) => {
    if (!val) return "";
    return val.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  const handleAddFromCatalog = (name: string) => {
    setItemName(name);
    setShowCatalog(false);
    setSearchQuery("");
  };
  const handleAddMarket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarketName.trim()) return;
    const newMarket: Market = { id: generateId(), name: newMarketName.trim() };
    setMarkets([...markets, newMarket]);
    setSelectedMarket(newMarket.id);
    setNewMarketName("");
  };
  const handleAddPromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || price <= 0 || !selectedMarket) return;
    if (editingPromoId) {
      setPromotions(
        promotions.map((p) =>
          p.id === editingPromoId
            ? {
                ...p,
                marketId: selectedMarket,
                itemName: itemName.trim(),
                price,
                qty: Number(qty) || 1,
                unit,
                expiryDate,
                notes: notes.trim(),
              }
            : p,
        ),
      );
      setEditingPromoId(null);
    } else {
      const newPromo: Promotion = {
        id: generateId(),
        marketId: selectedMarket,
        itemName: itemName.trim(),
        price,
        qty: Number(qty) || 1,
        unit,
        expiryDate,
        notes: notes.trim(),
      };
      setPromotions([newPromo, ...promotions]);
    }
    setItemName("");
    setPrice(0);
    setQty(1);
    setNotes("");
    setExpiryDate("");
  };
  const handleEditPromo = (promo: Promotion) => {
    setEditingPromoId(promo.id);
    setSelectedMarket(promo.marketId);
    setItemName(promo.itemName);
    setPrice(promo.price);
    setQty(promo.qty);
    setUnit(promo.unit);
    setExpiryDate(promo.expiryDate || "");
    setNotes(promo.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancelEdit = () => {
    setEditingPromoId(null);
    setItemName("");
    setPrice(0);
    setQty(1);
    setNotes("");
    setExpiryDate("");
  };
  const removeMarket = (id: string) => {
    setMarkets(markets.filter((m) => m.id !== id));
    setPromotions(promotions.filter((p) => p.marketId !== id));
    if (selectedMarket === id) setSelectedMarket("");
  };
  const [animateChart, setAnimateChart] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimateChart(true), 300);
    return () => clearTimeout(t);
  }, []);
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const filteredPromos = useMemo(() => {
    return promotions.filter((p) => {
      if (promoFilter === "today") return p.expiryDate === todayStr;
      if (promoFilter === "tomorrow") return p.expiryDate === tomorrowStr;
      return true;
    });
  }, [promotions, promoFilter, todayStr, tomorrowStr]);
  return (
    <div className="pb-28 bg-transparent min-h-screen">
      {" "}
      {/* HEADER */}{" "}
      <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-b-[40px] overflow-hidden relative pt-[calc(env(safe-area-inset-top)+32px)] pb-20 px-6 text-white shadow-primary z-10 relative">
        {" "}
        <div className="absolute rounded-full border-[12px] border-white/10" style={{ width: 280, height: 280, top: -100, left: -100 }}></div>
        <div className="absolute rounded-full bg-black/10" style={{ width: 140, height: 140, bottom: -20, right: -20 }}></div>
        <div className="absolute inset-0 opacity-100 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("/pattern-dark.svg")', backgroundSize: '100px 100px', backgroundRepeat: 'repeat' }}></div>{" "}
        <div className="flex justify-between items-center relative z-10">
          {" "}
          <h2 className="text-[24px] font-bold tracking-tight flex items-center gap-2">
            {" "}
            Ofertas & Mercados{" "}
          </h2>{" "}
        </div>{" "}
        <p className="text-green-50 mt-2 text-[13px] font-medium relative z-10 pr-10 mb-5">
          {" "}
          Gerencie as ofertas que encontrou e organize por supermercado.{" "}
        </p>{" "}
      </div>{" "}
      <div className="px-4 lg:px-6 -mt-16 relative z-20">
        {" "}
        {/* SELETOR DE MERCADO */}{" "}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] mb-6 shadow-xl">
          {" "}
          <label className="block text-[12px] font-semibold mb-3 text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            {" "}
            <Store size={18} className="text-green-700 dark:text-green-500" /> Selecione o
            Mercado{" "}
          </label>{" "}
          <div className="flex gap-2">
            {" "}
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="flex-1 px-4 py-3.5 bg-transparent border-none rounded-3xl font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-600 shadow-inner appearance-none"
            >
              {" "}
              <option value="" disabled>
                {" "}
                -- Escolha um mercado --{" "}
              </option>{" "}
              {markets.map((m) => (
                <option key={m.id} value={m.id}>
                  {" "}
                  {m.name}{" "}
                </option>
              ))}{" "}
            </select>{" "}
            {selectedMarket && (
              <button
                onClick={() => removeMarket(selectedMarket)}
                className="p-3.5 text-zinc-500 dark:text-zinc-400 bg-transparent border-none hover:text-red-500 hover:bg-red-50 :bg-red-900/30 rounded-3xl transition-colors"
              >
                {" "}
                <Trash2 size={22} />{" "}
              </button>
            )}{" "}
          </div>{" "}
          <form onSubmit={handleAddMarket} className="mt-3 flex gap-2">
            {" "}
            <input
              type="text"
              value={newMarketName}
              onChange={(e) => setNewMarketName(e.target.value)}
              placeholder="Novo mercado (ex: Extra)"
              className="flex-1 min-w-0 px-4 py-3.5 bg-transparent border-none rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-600 placeholder-zinc-400 font-medium"
            />{" "}
            <button
              type="submit"
              className="shrink-0 bg-green-700 hover:bg-emerald-700 transition-colors text-white px-5 py-3.5 rounded-3xl font-semibold active:scale-[0.97] transition-transform duration-150 shadow-sm"
            >
              {" "}
              Criar{" "}
            </button>{" "}
          </form>{" "}
        </div>{" "}
        {/* CADASTRAR/EDITAR PROMOÇÃO */}{" "}
        {selectedMarket ? (
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 mb-6 shadow-sm">
            {" "}
            <h3 className="text-[13px] font-bold text-green-700 dark:text-green-500 mb-4 flex items-center gap-2">
              {" "}
              <Plus size={18} strokeWidth={3} />
              {""}{" "}
              {editingPromoId ? "Editar Oferta" : "Adicionar Nova Oferta"}{" "}
            </h3>{" "}
            <form onSubmit={handleAddPromotion} className="space-y-4">
              {" "}
              <div>
                {" "}
                <label className="block text-[11px] font-semibold mb-1.5 text-zinc-500 dark:text-zinc-400">
                  {" "}
                  Produto{" "}
                </label>{" "}
                <div
                  onClick={() => setShowCatalog(true)}
                  className={`w-full px-4 py-3.5 bg-transparent border-none rounded-3xl cursor-pointer font-semibold ${itemName ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"}`}
                >
                  {" "}
                  {itemName || "Selecionar produto..."}{" "}
                </div>{" "}
              </div>{" "}
              <div className="grid grid-cols-2 gap-3">
                {" "}
                <div>
                  {" "}
                  <label className="block text-[11px] font-semibold mb-1.5 text-zinc-500 dark:text-zinc-400">
                    {" "}
                    Preço (R$){" "}
                  </label>{" "}
                  <div className="relative">
                    {" "}
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-zinc-500 dark:text-zinc-400">
                      {" "}
                      R${" "}
                    </span>{" "}
                    <input
                      type="tel"
                      value={getPriceDisplayValue(price)}
                      onChange={(e) => handlePriceInput(e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-9 pr-4 py-3.5 bg-transparent border-none rounded-3xl font-bold text-[16px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-600"
                      required
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-[11px] font-semibold mb-1.5 text-zinc-500 dark:text-zinc-400">
                    {" "}
                    Por (Qtd / Un){" "}
                  </label>{" "}
                  <div className="flex gap-1.5 bg-transparent rounded-3xl p-1.5 focus-within:ring-2 focus-within:ring-green-600">
                    {" "}
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={qty}
                      onChange={(e) =>
                        setQty(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className="w-1/2 px-2 py-2 bg-transparent border-none focus:outline-none font-semibold text-center text-zinc-900 dark:text-zinc-100"
                      required
                    />{" "}
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as Unit)}
                      className="w-1/2 px-1 py-2 bg-transparent border-none outline-none focus:outline-none font-semibold text-zinc-500 dark:text-zinc-400 appearance-none"
                      style={{
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                      }}
                    >
                      {" "}
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {" "}
                          {u}{" "}
                        </option>
                      ))}{" "}
                    </select>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div className="grid grid-cols-2 gap-3">
                {" "}
                <div>
                  {" "}
                  <label className="block text-[11px] font-semibold mb-1.5 text-zinc-500 dark:text-zinc-400">
                    {" "}
                    Anotação{" "}
                  </label>{" "}
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Marca Ype..."
                    className="w-full px-4 py-3.5 bg-transparent border-none rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-600 font-medium placeholder-zinc-400"
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-[11px] font-semibold mb-1.5 text-zinc-500 dark:text-zinc-400">
                    {" "}
                    Validade{" "}
                  </label>{" "}
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-4 py-3.5 bg-transparent border-none rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-600 font-medium text-zinc-900 dark:text-zinc-100"
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex flex-col sm:flex-row gap-2 mt-2 pt-2">
                {" "}
                <button
                  type="submit"
                  className="flex-1 bg-green-700 hover:bg-emerald-700 text-white p-4 rounded-3xl font-bold text-[15px] transition-transform active:scale-[0.97] transition-transform duration-150 shadow-sm"
                >
                  {" "}
                  {editingPromoId ? "Salvar Alterações" : "Salvar Oferta"}{" "}
                </button>{" "}
                {editingPromoId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="w-full sm:w-auto px-6 py-4 bg-transparent hover:bg-zinc-200 :bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-3xl font-semibold transition-colors active:scale-[0.97] transition-transform duration-150"
                  >
                    {" "}
                    Cancelar{" "}
                  </button>
                )}{" "}
              </div>{" "}
            </form>{" "}
          </div>
        ) : (
          <div className="text-center text-zinc-500 dark:text-zinc-400 pt-10 pb-10 flex flex-col items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm mb-6">
            {" "}
            <Store
              size={48}
              className="text-zinc-200 mb-4"
              strokeWidth={1.5}
            />{" "}
            <p className="font-semibold text-[15px] text-zinc-500 dark:text-zinc-400">
              {" "}
              Selecione ou adicione um mercado.{" "}
            </p>{" "}
          </div>
        )}{" "}
        {/* LISTA DE PROMOÇÕES */}{" "}
        <div className="space-y-4">
          {" "}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {" "}
            <button
              onClick={() => setPromoFilter("all")}
              className={`px-4 py-2 rounded-xl font-bold text-[12px] transition-colors shrink-0 ${promoFilter === "all" ? "bg-green-700 text-white" : "bg-transparent text-zinc-500 dark:text-zinc-400"}`}
            >
              {" "}
              Todas Ofertas{" "}
            </button>{" "}
            <button
              onClick={() => setPromoFilter("today")}
              className={`px-4 py-2 rounded-xl font-bold text-[12px] transition-colors shrink-0 ${promoFilter === "today" ? "bg-red-500 text-white" : "bg-red-50 /10 text-red-500"}`}
            >
              {" "}
              Vence Hoje{" "}
            </button>{" "}
            <button
              onClick={() => setPromoFilter("tomorrow")}
              className={`px-4 py-2 rounded-xl font-bold text-[12px] transition-colors shrink-0 ${promoFilter === "tomorrow" ? "bg-orange-500 text-white" : "bg-orange-50 /10 text-orange-500"}`}
            >
              {" "}
              Vence Amanhã{" "}
            </button>{" "}
          </div>{" "}
          {filteredPromos.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 dark:text-zinc-400 font-medium bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              {" "}
              Não há promoções nesta aba.{" "}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {" "}
              {filteredPromos.map((promo) => {
                const base = convertToBaseUnit(promo.qty, promo.unit);
                const pricePerBase = getPricePerBaseUnit(
                  promo.price,
                  promo.qty,
                  promo.unit,
                );
                const marketName =
                  markets.find((m) => m.id === promo.marketId)?.name ||
                  "Desconhecido";
                const isExpiringToday = promo.expiryDate === todayStr;
                const isExpiringTomorrow = promo.expiryDate === tomorrowStr;
                return (
                  <div
                    key={promo.id}
                    className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex justify-between items-center gap-4 transition-all cursor-pointer active:scale-[0.97] transition-transform duration-150"
                    onClick={() => handleEditPromo(promo)}
                  >
                    {" "}
                    <div className="flex-1 min-w-0 pointer-events-none">
                      {" "}
                      <div className="flex items-center gap-2 mb-1">
                        {" "}
                        <span className="text-[10px] font-bold bg-transparent text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          {" "}
                          <Store size={10} /> {marketName}{" "}
                        </span>{" "}
                      </div>{" "}
                      <h4 className="font-bold text-[16px] text-zinc-900 dark:text-zinc-100 leading-snug break-words">
                        {" "}
                        {formatItemName(promo.itemName)}{" "}
                      </h4>{" "}
                      <div className="flex items-end gap-2 mt-1 mb-2">
                        {" "}
                        <div className="text-green-700 dark:text-green-500 font-bold text-[22px] tracking-tight leading-none">
                          {" "}
                          <span className="money-value">
                            {" "}
                            {formatMoney(promo.price)}{" "}
                          </span>{" "}
                        </div>{" "}
                      </div>{" "}
                      <div className="flex gap-2 text-[10px] font-bold mt-2 flex-wrap">
                        {" "}
                        <span className="bg-transparent text-zinc-500 dark:text-zinc-400 py-1 px-2.5 rounded-full">
                          {" "}
                          Por {promo.qty} {promo.unit}{" "}
                        </span>{" "}
                        {base.qty !== 1 && (
                          <span className="bg-orange-100 /30 text-orange-600 py-1 px-2.5 rounded-full">
                            {" "}
                            Equivale{""}{" "}
                            <span className="money-value">
                              {" "}
                              {formatMoney(pricePerBase)}{" "}
                            </span>
                            {""} / {base.unit}{" "}
                          </span>
                        )}{" "}
                      </div>{" "}
                      {(promo.notes || promo.expiryDate) && (
                        <div className="flex flex-col gap-1 mt-2">
                          {" "}
                          {promo.notes && (
                            <div className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400 mt-1 italic">
                              {" "}
                              {promo.notes}{" "}
                            </div>
                          )}{" "}
                          {promo.expiryDate && (
                            <div
                              className={`text-[11px] font-bold mt-1 flex items-center gap-1.5 px-2 py-1 rounded border inline-flex w-max ${isExpiringToday ? "bg-red-50 border-red-200 text-red-600 /20 /30" : isExpiringTomorrow ? "bg-orange-50 border-orange-200 text-orange-600 /20 /30" : "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 /50"}`}
                            >
                              {" "}
                              <Calendar size={14} />{" "}
                              {isExpiringToday
                                ? "VENCE HOJE"
                                : isExpiringTomorrow
                                  ? "VENCE AMANHÃ"
                                  : `ATÉ ${new Date(promo.expiryDate).toLocaleDateString("pt-BR", { timeZone: "UTC" })}`}{" "}
                            </div>
                          )}{" "}
                        </div>
                      )}{" "}
                    </div>{" "}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPromotions(
                          promotions.filter((p) => p.id !== promo.id),
                        );
                      }}
                      className="text-zinc-500 dark:text-zinc-400 hover:text-red-500 p-3 bg-transparent hover:bg-red-50 flex-shrink-0 rounded-xl transition-colors"
                    >
                      {" "}
                      <Trash2 size={20} />{" "}
                    </button>{" "}
                  </div>
                );
              })}{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
      {/* MODAL BOTTOM SHEET DO CATÁLOGO HIDDEN */}{" "}
      {showCatalog && (
        <div
          className="fixed inset-0 z-[100] flex justify-center items-end bg-black/40 backdrop-blur-[2px] animate-in fade-in"
          onClick={() => setShowCatalog(false)}
        >
          {" "}
          <div
            className="w-full max-w-lg bg-zinc-50 dark:bg-zinc-900 rounded-t-[32px] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-white #1C1C1E] z-10">
              {" "}
              <h2 className="text-[16px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {" "}
                Selecionar Produto{" "}
              </h2>{" "}
              <button
                onClick={() => {
                  setShowCatalog(false);
                  setSearchQuery("");
                }}
                className="p-2 bg-transparent rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100 :text-zinc-200 transition-colors"
              >
                {" "}
                <X size={20} className="w-5 h-5" />{" "}
              </button>{" "}
            </div>{" "}
            <div className="px-4 pt-4 pb-2 bg-zinc-50 dark:bg-zinc-900 sticky top-[73px] z-10">
              {" "}
              <div className="relative">
                {" "}
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
                />{" "}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar itens..."
                  className="w-full pl-10 pr-4 py-3.5 bg-white #1C1C1E] border border-zinc-200 dark:border-zinc-800 rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-600 font-semibold text-[15px] transition-colors shadow-sm placeholder-zinc-400"
                />{" "}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-500 dark:text-zinc-400 :text-zinc-200 bg-transparent rounded-full p-1"
                  >
                    {" "}
                    <X size={14} />{" "}
                  </button>
                )}{" "}
              </div>{" "}
            </div>{" "}
            <div className="overflow-y-auto p-4 space-y-3 bg-transparent">
              {" "}
              {searchQuery ? (
                searchResults.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 dark:text-zinc-400 font-medium">
                    {" "}
                    Nenhum produto encontrado.{" "}
                  </div>
                ) : (
                  <div className="bg-white #1C1C1E] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
                    {" "}
                    <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-4">
                      {" "}
                      Resultados{" "}
                    </h4>{" "}
                    <div className="flex flex-wrap gap-2">
                      {" "}
                      {searchResults.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleAddFromCatalog(item.name)}
                          className="px-4 py-2.5 bg-transparent hover:bg-green-50 :bg-emerald-900/30 text-zinc-900 dark:text-zinc-100 hoverdark:hover:text-green-500 dark:text-green-500 :text-green-500 text-[14px] font-semibold rounded-3xl transition-colors flex items-center gap-1.5 active:scale-[0.97] transition-transform duration-150"
                        >
                          {" "}
                          <Plus size={16} className="opacity-50" />{" "}
                          {item.name}{" "}
                        </button>
                      ))}{" "}
                    </div>{" "}
                  </div>
                )
              ) : (
                PRODUCT_CATALOG.map((cat, i) => {
                  const isExpanded = expandedCategory === cat.name;
                  return (
                    <div
                      key={i}
                      className="bg-white #1C1C1E] rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all shadow-sm"
                    >
                      {" "}
                      <button
                        onClick={() =>
                          setExpandedCategory(isExpanded ? null : cat.name)
                        }
                        className="w-full px-5 py-4.5 flex items-center justify-between text-left focus:outline-none"
                      >
                        {" "}
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-[15px] flex items-center gap-3">
                          {" "}
                          <span className="text-xl">{cat.icon}</span>{" "}
                          {cat.name}{" "}
                        </span>{" "}
                        {isExpanded ? (
                          <ChevronUp
                            size={22}
                            className="text-zinc-500 dark:text-zinc-400"
                          />
                        ) : (
                          <ChevronDown
                            size={22}
                            className="text-zinc-500 dark:text-zinc-400"
                          />
                        )}{" "}
                      </button>{" "}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-1 space-y-4">
                          {" "}
                          {cat.subcategories.map((sub, j) => (
                            <div key={j}>
                              {" "}
                              <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-3">
                                {" "}
                                {sub.name}{" "}
                              </h4>{" "}
                              <div className="flex flex-wrap gap-2">
                                {" "}
                                {sub.items.map((itemName, k) => (
                                  <button
                                    key={k}
                                    onClick={() =>
                                      handleAddFromCatalog(itemName)
                                    }
                                    className="px-4 py-2.5 bg-transparent hover:bg-green-50 :bg-emerald-900/30 text-zinc-900 dark:text-zinc-100 hoverdark:hover:text-green-500 dark:text-green-500 :text-green-500 text-[14px] font-semibold rounded-3xl transition-colors flex items-center gap-1.5 active:scale-[0.97] transition-transform duration-150"
                                  >
                                    {" "}
                                    <Plus size={16} className="opacity-50" />
                                    {""} {itemName}{" "}
                                  </button>
                                ))}{" "}
                              </div>{" "}
                            </div>
                          ))}{" "}
                        </div>
                      )}{" "}
                    </div>
                  );
                })
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* COMPARADOR VISUAL */}{" "}
      {(() => {
        const marketComparison = context.markets
          .map((market) => {
            let total = 0;
            context.items.forEach((item) => {
              const promo = context.promotions.find(
                (p) =>
                  p.marketId === market.id &&
                  p.itemName.toLowerCase() === item.name.toLowerCase(),
              );
              total += promo ? promo.price * item.qty : 15.0 * item.qty;
            });
            return { market, total };
          })
          .sort((a, b) => a.total - b.total);
        const maxTotal = Math.max(...marketComparison.map((m) => m.total));
        return (
          <div className="mt-8 px-5">
            {" "}
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              {" "}
              🏆 Comparativo de Mercados{" "}
            </h3>{" "}
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              {" "}
              Baseado nos itens da sua lista{" "}
            </p>{" "}
            {marketComparison.length < 2 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 text-center border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm">
                {" "}
                Cadastre promoções em pelo menos 2 mercados para comparar.{" "}
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                {" "}
                {marketComparison.map((entry, index) => {
                  const widthPercent =
                    maxTotal > 0 ? (entry.total / maxTotal) * 100 : 0;
                  const isWinner = index === 0;
                  return (
                    <div key={entry.market.id} className="mb-4 last:mb-0">
                      {" "}
                      <div className="flex justify-between items-baseline mb-1.5">
                        {" "}
                        <span
                          className={`text-sm font-semibold ${isWinner ? "text-green-700 dark:text-green-500" : "text-zinc-900 dark:text-zinc-100"}`}
                        >
                          {" "}
                          {isWinner && "👑"} {entry.market.name}{" "}
                        </span>{" "}
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {" "}
                          <span className="money-value">
                            {" "}
                            {formatMoney(entry.total)}{" "}
                          </span>{" "}
                        </span>{" "}
                      </div>{" "}
                      <div className="h-3 rounded-full bg-transparent overflow-hidden">
                        {" "}
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${isWinner ? "bg-gradient-to-r from-green-600 to-green-500" : "bg-zinc-300"}`}
                          style={{
                            width: animateChart ? `${widthPercent}%` : "0%",
                          }}
                        />{" "}
                      </div>{" "}
                      {isWinner && marketComparison.length > 1 && (
                        <div className="text-[11px] font-semibold text-green-700 dark:text-green-500 mt-1.5">
                          {" "}
                          Economia de{""}{" "}
                          <span className="money-value">
                            {" "}
                            {formatMoney(
                              marketComparison[marketComparison.length - 1]
                                .total - entry.total,
                            )}{" "}
                          </span>
                          {""} vs. mais caro{" "}
                        </div>
                      )}{" "}
                    </div>
                  );
                })}{" "}
              </div>
            )}{" "}
          </div>
        );
      })()}{" "}
    </div>
  );
};

```

### `src/components/Roteiro.tsx`
```tsx
/* Este componente foi absorvido pelo Promocoes.tsx */
import React, { useMemo } from "react";
import { AppContextType, Market } from "../types";
import { Store, BadgePercent } from "lucide-react";
import { formatMoney, formatItemName } from "../utils";
export const Roteiro: React.FC<{ context: AppContextType }> = ({ context }) => {
  const { items, markets, promotions } = context;
  const marketRankings = useMemo(() => {
    const listItems = items.filter((i) => !i.isBought);
    if (listItems.length === 0 || markets.length === 0) return null;
    const PRECO_MEDIO_PADRAO_GLOBAL = 12.0;
    const hoje = new Date().toISOString().split("T")[0];
    const ofertasAtivas = promotions.filter(
      (o) => !o.expiryDate || o.expiryDate >= hoje,
    );
    const resultadosPorMercado = markets.map((mercado) => {
      let totalOfertas = 0;
      let itensCobertos = 0;
      let itensDetalhados: any[] = [];
      listItems.forEach((item) => {
        const oferta = ofertasAtivas.find(
          (o) =>
            o.marketId === mercado.id &&
            o.itemName.toLowerCase().trim() === item.name.toLowerCase().trim(),
        );
        if (oferta) {
          const precoUnitario = oferta.price / oferta.qty;
          const subtotalItem = precoUnitario * item.qty;
          totalOfertas += subtotalItem;
          itensCobertos++;
          itensDetalhados.push({
            nome: item.name,
            quantidade: item.qty,
            unidade: item.unit,
            precoUnitario: precoUnitario,
            subtotal: subtotalItem,
            fonte: "oferta",
          });
        }
      });
      return {
        mercadoId: mercado.id,
        mercadoNome: mercado.name,
        totalEstimado: parseFloat(totalOfertas.toFixed(2)),
        itensCobertos: itensCobertos,
        totalItens: listItems.length,
        percentualCobertura: Math.round(
          (itensCobertos / listItems.length) * 100,
        ),
        itensDetalhados: itensDetalhados,
      };
    });
    /* Remove mercados que não têm NENHUMA oferta para a lista atual? Ou deixa no fim? Vamos deixar no fim. */ resultadosPorMercado.sort(
      (a, b) => {
        if (b.itensCobertos !== a.itensCobertos) {
          return (
            b.itensCobertos - a.itensCobertos
          ); /* Mais itens cobertos ganha */
        }
        return (
          a.totalEstimado - b.totalEstimado
        ); /* Menor preço ganha no desempate */
      },
    );
    const vencedor = resultadosPorMercado[0];
    if (!vencedor) return null;
    return {
      destinoVencedor: vencedor.mercadoNome,
      destinoVencedorId: vencedor.mercadoId,
      totalProjetadoVencedor: vencedor.totalEstimado,
      rankingCompleto: resultadosPorMercado,
      vencedor,
    };
  }, [items, markets, promotions]);
  return (
    <div className="pb-28 bg-transparent min-h-screen">
      {" "}
      {/* HEADER */}{" "}
      <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-b-[40px] overflow-hidden relative pt-[calc(env(safe-area-inset-top)+32px)] pb-16 px-6 text-white shadow-primary z-10 relative">
        {" "}
        <div className="absolute rounded-full border-[12px] border-white/10" style={{ width: 280, height: 280, top: -100, left: -100 }}></div>
        <div className="absolute rounded-full bg-black/10" style={{ width: 140, height: 140, bottom: -20, right: -20 }}></div>
        <div className="absolute inset-0 opacity-100 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("/pattern-dark.svg")', backgroundSize: '100px 100px', backgroundRepeat: 'repeat' }}></div>{" "}
        <div className="flex justify-between items-center relative z-10">
          {" "}
          <h2 className="text-[24px] font-bold tracking-tight flex items-center gap-2">
            {" "}
            Inteligência de Mercado{" "}
          </h2>{" "}
        </div>{" "}
      </div>{" "}
      <div className="px-4 lg:px-6 -mt-16 relative z-20">
        {" "}
        {!marketRankings ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-500 dark:text-zinc-400 shadow-sm flex flex-col items-center">
            {" "}
            <Store
              size={48}
              className="opacity-20 mb-4"
              strokeWidth={1.5}
            />{" "}
            <p className="font-semibold text-[15px] max-w-[200px]">
              Cadastre promoções na aba Ofertas para ver o comparativo de
              preços.
            </p>{" "}
          </div>
        ) : (
          <div className="space-y-6">
            {" "}
            {/* BEST OPTION BENTO BOX */}{" "}
            <div className="bg-green-700 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
              {" "}
              <div className="absolute -right-10 -top-10 opacity-20">
                <Store size={150} />
              </div>{" "}
              <h3 className="text-[11px] font-bold text-green-100 mb-1">
                Melhor Opção
              </h3>{" "}
              <div className="text-[32px] font-bold tracking-tight leading-none mb-4 break-words">
                {marketRankings.destinoVencedor}
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <div className="font-semibold text-[16px] bg-white dark:bg-zinc-900/20 p-3 rounded-3xl flex justify-between">
                  {" "}
                  <span>Total Ofertas:</span>{" "}
                  <span>
                    <span className="money-value">
                      {formatMoney(marketRankings.totalProjetadoVencedor)}
                    </span>
                  </span>{" "}
                </div>{" "}
                <div className="text-[12px] font-medium text-green-100 flex items-center gap-2 pt-1 border-t border-white/20 mt-2">
                  {" "}
                  <BadgePercent size={14} /> Cobertura:{" "}
                  {marketRankings.vencedor.itensCobertos} de{" "}
                  {marketRankings.vencedor.totalItens} itens com oferta{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <h3 className="text-[13px] font-bold text-zinc-500 dark:text-zinc-400 ml-2">
              Comparativo Completo
            </h3>{" "}
            {marketRankings.rankingCompleto.map((ranking, index) => {
              /* Calculate percentage for progress bar based on the most expensive one */ const mx =
                marketRankings.rankingCompleto[
                  marketRankings.rankingCompleto.length - 1
                ].totalEstimado;
              const width = mx > 0 ? (ranking.totalEstimado / mx) * 100 : 100;
              return (
                <div
                  key={ranking.mercadoId}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-3xl shadow-sm mb-4"
                >
                  {" "}
                  <div className="flex justify-between items-center mb-2">
                    {" "}
                    <div className="flex items-center gap-3">
                      {" "}
                      <div
                        className={`w-8 h-8 rounded-full flex justify-center items-center font-bold text-[13px] ${index === 0 ? "bg-green-50 text-green-700 dark:text-green-500" : "bg-transparent text-zinc-500 dark:text-zinc-400"}`}
                      >
                        {" "}
                        {index + 1}{" "}
                      </div>{" "}
                      <span className="font-bold text-[16px] text-zinc-900 dark:text-zinc-100">
                        {ranking.mercadoNome}
                      </span>{" "}
                    </div>{" "}
                    <div className="font-bold text-[16px] text-green-700 dark:text-green-500">
                      {" "}
                      <span className="money-value">
                        {formatMoney(ranking.totalEstimado)}
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="flex items-center gap-3">
                    {" "}
                    <div className="flex-1 h-2 bg-transparent rounded-full overflow-hidden">
                      {" "}
                      <div
                        className={`h-full rounded-full ${index === 0 ? "bg-green-700" : "bg-zinc-400"}`}
                        style={{ width: `${width}%` }}
                      />{" "}
                    </div>{" "}
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                      {Math.round(width)}%
                    </span>{" "}
                  </div>{" "}
                  {/* Sublist */}{" "}
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                    {" "}
                    {ranking.itensDetalhados.filter((i) => i.fonte === "oferta")
                      .length > 0 ? (
                      <div className="mb-2">
                        {" "}
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-2">
                          {" "}
                          <BadgePercent size={12} /> Com Oferta{" "}
                        </span>{" "}
                        {ranking.itensDetalhados
                          .filter((i) => i.fonte === "oferta")
                          .map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-start gap-2 text-[13px] py-1"
                            >
                              {" "}
                              <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex-1 min-w-0 break-words">
                                {formatItemName(item.nome)} ({item.quantidade}
                                {item.unidade})
                              </div>{" "}
                              <div className="font-bold text-green-600 shrink-0">
                                <span className="money-value">
                                  {formatMoney(item.subtotal)}
                                </span>
                              </div>{" "}
                            </div>
                          ))}{" "}
                      </div>
                    ) : (
                      <div className="text-[12px] text-zinc-500 dark:text-zinc-400 font-medium italic">
                        {" "}
                        Nenhum item da sua lista em oferta neste mercado.{" "}
                      </div>
                    )}{" "}
                  </div>{" "}
                </div>
              );
            })}{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
};

```

### `src/components/MenuExtra.tsx`
```tsx
import React, { useState } from "react";
import { AppContextType } from "../types";
import { Sun, Moon, Store, Trash2, AlertTriangle } from "lucide-react";
import { formatMoney } from "../utils";
export const MenuExtra: React.FC<{ context: AppContextType }> = ({
  context,
}) => {
  const {
    settings,
    setSettings,
    markets,
    setMarkets,
    promotions,
    setPromotions,
  } = context;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const executeFactoryReset = () => {
    localStorage.clear();
    window.location.reload();
  };
  const totalSpentAllTime = context.history.reduce(
    (acc, h) => acc + h.totalSpent,
    0,
  );
  const totalEconomy = context.history.reduce(
    (acc, h) => acc + h.economyGenerated,
    0,
  );
  const avgPerPurchase =
    context.history.length > 0 ? totalSpentAllTime / context.history.length : 0;
  const badges = [
    {
      emoji: "🛒",
      name: "Primeira Compra",
      unlocked: (context.settings.purchaseCount || 0) >= 1,
    },
    {
      emoji: "🔥",
      name: "7 dias seguidos",
      unlocked: (context.settings.streak || 0) >= 7,
    },
    {
      emoji: "💰",
      name: "Economizou R$100",
      unlocked: (context.settings.totalSaved || 0) >= 100,
    },
    {
      emoji: "🏆",
      name: "Economizou R$500",
      unlocked: (context.settings.totalSaved || 0) >= 500,
    },
    {
      emoji: "⭐",
      name: "10 Compras",
      unlocked: (context.settings.purchaseCount || 0) >= 10,
    },
  ];
  return (
    <div className="pb-28 bg-transparent min-h-screen">
      {" "}
      <div className="bg-green-600 pb-24 pt-[calc(env(safe-area-inset-top)+20px)] px-6 rounded-b-[40px] relative overflow-hidden shrink-0 shadow-lg">
        <div className="absolute rounded-full border-[12px] border-white/10" style={{ width: 280, height: 280, top: -100, left: -100 }}></div>
        <div className="absolute rounded-full bg-black/10" style={{ width: 140, height: 140, bottom: -20, right: -20 }}></div>
        <div className="absolute inset-0 opacity-100 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("/pattern-dark.svg")', backgroundSize: '100px 100px', backgroundRepeat: 'repeat' }}></div>
        <h2 className="text-3xl font-extrabold text-white mb-2 relative z-10">Ajustes & Dados</h2>
        <p className="text-green-50 text-[15px] font-medium max-w-[280px] leading-snug relative z-10">Configure preferências de uso, meta de gastos e gerencie seus dados locais.</p>
      </div>
      <div className="px-4 -mt-16 relative z-20 pb-24 space-y-6">{" "}
        <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-xl mb-6">
          {" "}
          <div className="flex items-center justify-between mb-4">
            {" "}
            <span className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400">
              Orçamento / Meta (R$)
            </span>{" "}
          </div>{" "}
          <input
            type="number"
            step="0.01"
            value={settings.budget || ""}
            onChange={(e) =>
              setSettings({ ...settings, budget: Number(e.target.value) })
            }
            placeholder="Ex: 500.00"
            className="w-full pl-4 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl ring-0 focus:ring-2 focus:ring-green-600 font-bold text-[16px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
          />{" "}
        </div>{" "}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4 relative z-10">
          {" "}
          <span className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400">
            Modo Escuro
          </span>{" "}
          <button
            onClick={() =>
              setSettings({ ...settings, darkMode: !settings.darkMode })
            }
            className={`p-3 rounded-3xl transition-all ${settings.darkMode ? "bg-white dark:bg-zinc-900 text-green-700 dark:text-green-500 border border-zinc-200 dark:border-zinc-800" : "bg-transparent text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"}`}
          >
            {" "}
            {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}{" "}
          </button>{" "}
        </div> <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl space-y-4 shadow-sm">
          {" "}
          <h3 className="text-[11px] font-semibold text-green-700 dark:text-green-500 flex items-center gap-2">
            <Store size={16} /> Meus Mercados
          </h3>{" "}
          {markets.length === 0 && (
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 text-center py-4">
              Nenhum mercado cadastrado.
            </p>
          )}{" "}
          <div className="space-y-2">
            {" "}
            {markets.map((m) => (
              <div
                key={m.id}
                className="flex justify-between items-center p-3 bg-transparent rounded-3xl border border-zinc-200 dark:border-zinc-800"
              >
                {" "}
                <span className="font-bold text-[14px] text-zinc-900 dark:text-zinc-100">
                  {m.name}
                </span>{" "}
                <button
                  onClick={() => {
                    setMarkets(markets.filter((x) => x.id !== m.id));
                    setPromotions(
                      promotions.filter((p) => p.marketId !== m.id),
                    );
                  }}
                  className="text-zinc-500 dark:text-zinc-400 hover:text-red-500 p-2 transition-colors active:scale-[0.97] transition-transform duration-150"
                >
                  <Trash2 size={18} />
                </button>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
        <div className="mb-6">
          {" "}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 mb-6 shadow-sm">
            {" "}
            <h3 className="text-[12px] font-bold text-zinc-500 dark:text-zinc-400 mb-4 flex items-center gap-2">
              🏅 SUAS CONQUISTAS
            </h3>{" "}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {" "}
              {badges.map((badge, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center gap-1.5"
                >
                  {" "}
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${badge.unlocked ? "bg-violet-100 text-violet-600" : "bg-transparent grayscale opacity-40"}`}
                  >
                    {badge.emoji}
                  </div>{" "}
                  <div
                    className={`text-[9px] font-bold leading-tight ${badge.unlocked ? "text-violet-700" : "text-zinc-500 dark:text-zinc-400"}`}
                  >
                    {badge.name}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>{" "}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {" "}
            <div className="bg-green-50 rounded-2xl p-3 text-center shadow-sm">
              {" "}
              <div className="text-xl font-bold text-green-700 dark:text-green-500">
                {context.history.length}
              </div>{" "}
              <div className="text-[10px] font-semibold text-green-700 dark:text-green-500/70 mt-0.5">
                Compras
              </div>{" "}
            </div>{" "}
            <div className="bg-violet-50 rounded-2xl p-3 text-center shadow-sm">
              {" "}
              <div className="text-xl font-bold text-violet-700">
                <span className="money-value">{formatMoney(totalEconomy)}</span>
              </div>{" "}
              <div className="text-[10px] font-semibold text-violet-600/70 mt-0.5">
                Economia
              </div>{" "}
            </div>{" "}
            <div className="bg-blue-50 rounded-2xl p-3 text-center shadow-sm">
              {" "}
              <div className="text-xl font-bold text-blue-700">
                <span className="money-value">
                  {formatMoney(avgPerPurchase)}
                </span>
              </div>{" "}
              <div className="text-[10px] font-semibold text-blue-600/70 mt-0.5">
                Média
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            {" "}
            <h3 className="text-[12px] font-bold text-zinc-500 dark:text-zinc-400 mb-4 flex items-center gap-2">
              📊 HISTÓRICO RECENTE
            </h3>{" "}
            {context.history.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-6">
                Nenhuma compra finalizada ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {" "}
                {context.history.slice(0, 5).map((h) => {
                  const market = context.markets.find(
                    (m) => m.id === h.marketId,
                  );
                  const dateStr = new Date(h.date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  });
                  return (
                    <div
                      key={h.id}
                      className="flex items-center gap-3 p-3 bg-transparent rounded-2xl border border-zinc-200 dark:border-zinc-800"
                    >
                      {" "}
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-700 dark:text-green-500 font-bold text-sm shrink-0">
                        {dateStr.split("")[0]}
                      </div>{" "}
                      <div className="flex-1 min-w-0">
                        {" "}
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {market?.name || "Mercado"}
                        </div>{" "}
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {h.items.length} itens · {dateStr}
                        </div>{" "}
                      </div>{" "}
                      <div className="text-right shrink-0">
                        {" "}
                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          <span className="money-value">
                            {formatMoney(h.totalSpent)}
                          </span>
                        </div>{" "}
                        {h.economyGenerated > 0 && (
                          <div className="text-xs font-semibold text-violet-500">
                            -
                            <span className="money-value">
                              {formatMoney(h.economyGenerated)}
                            </span>
                          </div>
                        )}{" "}
                      </div>{" "}
                    </div>
                  );
                })}{" "}
                <button
                  onClick={() => {
                    if (window.confirm("Apagar todo o histórico?"))
                      context.setHistory([]);
                  }}
                  className="text-sm text-red-400 hover:text-red-500 font-medium mt-4 w-full text-center transition-colors"
                >
                  Limpar Histórico
                </button>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm text-center">
          {" "}
          <h3 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2 justify-center">
            <AlertTriangle size={16} /> Zona de Perigo
          </h3>{" "}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-3xl transition-all active:scale-[0.97] transition-transform duration-150 border border-red-100"
          >
            <Trash2 size={20} /> Factory Reset (Apagar Tudo)
          </button>{" "}
          <p className="text-[10px] mt-3 font-medium text-zinc-500 dark:text-zinc-400">
            Todas as listas, mercados e históricos salvos no dispositivo serão
            perdidos para sempre.
          </p>{" "}
        </div>{" "}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm">
          {" "}
          <button
            onClick={async () => {
              const { supabase } = await import("../lib/supabase");
              await supabase.auth.signOut();
            }}
            className="w-full p-4 bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-semibold rounded-3xl active:scale-[0.97] transition-transform duration-150"
          >
            Sair da Conta (Supabase)
          </button>{" "}
        </div>{" "}
      </div>{" "}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-[110] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowResetConfirm(false)}
        >
          {" "}
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>{" "}
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Atenção!
            </h3>{" "}
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">
              Você perderá TODOS os dados locais (lista, mercados, ofertas,
              histórico). Tem certeza?
            </p>{" "}
            <div className="flex gap-3">
              {" "}
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-3xl font-bold text-zinc-500 dark:text-zinc-400 bg-transparent"
              >
                Cancelar
              </button>{" "}
              <button
                onClick={executeFactoryReset}
                className="flex-1 py-3 rounded-3xl font-bold text-white bg-red-500 hover:bg-red-600"
              >
                Sim, Apagar
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
};

```

### `src/index.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
@import "tailwindcss";

@custom-variant dark (&:is(.dark *), :is(.dark) &);

@theme {
  --font-sans: "Poppins", ui-sans-serif, system-ui, sans-serif;
}

html, body {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  background-color: #F9FAFB;
  background-image: url('/pattern-light.svg');
  background-size: 100px 100px;
  background-repeat: repeat;
  background-attachment: fixed;
  color: #1F2937;
  overscroll-behavior-y: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

html.dark body {
  
  
  background-color: #1C1C1E;
  background-image: url('/pattern-dark.svg');
  background-size: 100px 100px;
  background-repeat: repeat;
  background-attachment: fixed;


  color: #F5F5F5;
}

input, textarea, select {
  -webkit-user-select: auto;
  user-select: auto;
}

@layer utilities {
  .money-value {
    font-family: inherit;
    font-weight: 500;
    letter-spacing: -0.02em;
  }
}

::-webkit-scrollbar:horizontal {
  display: none;
  height: 0;
}

```
