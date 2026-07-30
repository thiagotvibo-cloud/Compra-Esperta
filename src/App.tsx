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
import { Dashboard } from "./components/Dashboard";
import { AgenteIA } from "./components/AgenteIA";
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
  LayoutDashboard,
  CheckSquare,
} from "lucide-react";
import { ModoMarmiteiro } from "./components/ModoMarmiteiro";

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
  const [activeTab, setActiveTab] = useState<"lista" | "roteiro" | "promocoes" | "compras" | "config" | "dashboard">("lista");
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
  const handleError = (context: string, error: unknown) => {
    /* Ignore auth/JWT/Refresh token errors quietly instead of alerting the user, and sign out automatically. */
    const err = error as { message?: string, code?: string, details?: string };
    const msg =
      typeof error === "string"
        ? error
        : err?.message || JSON.stringify(error) || "";
    if (
      msg.includes("JWT") ||
      msg.includes("Refresh Token") ||
      msg.includes("token") ||
      err?.code === "401" ||
      err?.code === "403"
    ) {
      supabase.auth.signOut().catch(console.error);
      return;
    }
    /* Ignore missing table errors silently */ 
    if (
      err?.code === "42P01" ||
      err?.code === "PGRST205" ||
      msg.includes("schema cache")
    ) {
      return;
    }
    console.error(
      `❌ Erro Supabase (${context}):`,
      err?.message,
      err?.details,
      error,
    );
    showToast(`Erro: ${context}. ${err?.message || ""}`);
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
          .subscribe((status, err: unknown) => {
            console.log(`🔌 Supabase Realtime Status: ${status}`);
            if (status === "SUBSCRIBED") {
              console.log("✅ Conexão Realtime estabelecida com sucesso!");
            } else if (status === "CLOSED") {
              console.warn("⚠️ Conexão Realtime foi fechada.");
            } else if (status === "CHANNEL_ERROR") {
              const errMsg = (err as Error)?.message || err;
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
  const updateSetting = async (key: string, value: string | number | boolean) => {
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
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => void; userChoice: Promise<{ outcome: string }> } | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as Event & { prompt: () => void; userChoice: Promise<{ outcome: string }> });
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
            <NavButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} icon={<LayoutDashboard size={28} />} label="Painel" />
            <NavButton active={activeTab === "lista"} onClick={() => setActiveTab("lista")} icon={<ShoppingCart size={28} />} label="Lista" />
            <NavButton active={activeTab === "compras"} onClick={() => setActiveTab("compras")} icon={<CheckSquare size={28} />} label="Comprar" />
            <NavButton active={activeTab === "promocoes"} onClick={() => setActiveTab("promocoes")} icon={<Tags size={28} />} label="Ofertas" />
            <NavButton active={activeTab === "roteiro"} onClick={() => setActiveTab("roteiro")} icon={<Map size={28} />} label="Roteiro" />
          </div>
          <div className="mt-auto w-full px-2">
             <NavButton active={activeTab === "config"} onClick={() => setActiveTab("config")} icon={<SettingsIcon size={28} />} label="Ajustes" />
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
              {activeTab === "dashboard" && <Dashboard context={context} />}
              {activeTab === "lista" && <ListaCompras context={context} />}{" "}
              {activeTab === "roteiro" && <Roteiro context={context} />}{" "}
              {activeTab === "promocoes" && <Promocoes context={context} />}{" "}
              {activeTab === "compras" && <ModoCompra context={context} />}{" "}
              {activeTab === "config" && <MenuExtra context={context} />}{" "}
            </motion.div>{" "}
          </AnimatePresence>{" "}
        </main>
        <ModoMarmiteiro context={context} />
        <AgenteIA context={context} />{" "}
        {/* BOTTOM NAVIGATION */}{" "}
        <nav className="md:hidden fixed bottom-0 w-full max-w-md bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-2 py-2 z-50 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          {" "}
          <div className="flex justify-between w-full items-center px-1 overflow-x-auto gap-2 scrollbar-hide">
            {" "}
            <NavButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} icon={<LayoutDashboard size={24} />} label="Painel" />
            <NavButton
              active={activeTab === "lista"}
              onClick={() => setActiveTab("lista")}
              icon={<ShoppingCart size={24} />}
              label="Lista"
            />{" "}
            <NavButton
              active={activeTab === "compras"}
              onClick={() => setActiveTab("compras")}
              icon={<CheckSquare size={24} />}
              label="Comprar"
            />{" "}
            <NavButton
              active={activeTab === "promocoes"}
              onClick={() => setActiveTab("promocoes")}
              icon={<Tags size={24} />}
              label="Ofertas"
            />{" "}
            <NavButton
              active={activeTab === "roteiro"}
              onClick={() => setActiveTab("roteiro")}
              icon={<Map size={24} />}
              label="Roteiro"
            />{" "}
            <NavButton
              active={activeTab === "config"}
              onClick={() => setActiveTab("config")}
              icon={<SettingsIcon size={24} />}
              label="Ajustes"
            />{" "}
          </div>{" "}
        </nav>{" "}
      </div>{" "}
    </div>
  );
}
function NavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full min-w-[4.5rem] shrink-0 gap-1 pt-1.5 pb-1 transition-colors relative ${
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
