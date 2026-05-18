# Arquitetura do Aplicativo de Compras (Supabase + React Native)

Abaixo estão os entregáveis solicitados para a arquitetura do aplicativo mobile com Supabase e React Native. Como nosso ambiente atual foca em aplicações web com React (PWA), preparei este documento com toda a base de código solicitada para que você possa utilizar no seu projeto mobile nativo.

## Etapa 1: Arquitetura do Banco de Dados (Supabase SQL)

Este script cria as tabelas necessárias e configura o Row Level Security (RLS) para garantir que os dados sejam acessados de forma segura, inclusive permitindo listas compartilhadas.

```sql
-- Ativar extensão uuid-ossp se não estiver ativa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela: users (Estende os usuários nativos do Supabase Auth)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela: supermarkets
CREATE TABLE public.supermarkets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela: products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  barcode TEXT UNIQUE, -- Preparação para OCR/Scanner
  base_unit TEXT NOT NULL CHECK (base_unit IN ('kg', 'g', 'L', 'ml', 'un', 'pct')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela: shopping_lists
CREATE TABLE public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  budget DECIMAL(10,2),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela: list_shares (Para o Módulo de Listas Compartilhadas)
CREATE TABLE public.list_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'editor' CHECK (role IN ('viewer', 'editor')),
  UNIQUE(list_id, user_id)
);

-- 6. Tabela: list_items
CREATE TABLE public.list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  custom_name TEXT, -- Caso o item não esteja nos produtos mapeados
  quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL,
  is_purchased BOOLEAN DEFAULT FALSE,
  actual_price DECIMAL(10,2), -- Preço registrado na gôndola (In-Store Mode)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela: promotions (Módulo de Promoções)
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supermarket_id UUID REFERENCES public.supermarkets(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  quantity_for_price DECIMAL(10,3) NOT NULL, -- Ex: Preço X por Y quantidade
  unit TEXT NOT NULL,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================================
-- ROW LEVEL SECURITY (RLS)
-- =================================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supermarkets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Users: podem ver seu próprio perfil.
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Shopping Lists: o dono ou quem tiver compartilhamento pode acessar
CREATE POLICY "User can view lists they own or are shared with" ON public.shopping_lists FOR SELECT
USING (owner_id = auth.uid() OR id IN (SELECT list_id FROM list_shares WHERE user_id = auth.uid()));

CREATE POLICY "User can insert own lists" ON public.shopping_lists FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "User can update lists they own or edit" ON public.shopping_lists FOR UPDATE
USING (owner_id = auth.uid() OR id IN (SELECT list_id FROM list_shares WHERE user_id = auth.uid() AND role = 'editor'));

-- List Items: Seguem a visibilidade da lista
CREATE POLICY "User can view items of accessible lists" ON public.list_items FOR SELECT
USING (list_id IN (SELECT id FROM shopping_lists)); -- Depende da policy de shopping_lists

CREATE POLICY "User can insert/update items in writable lists" ON public.list_items FOR ALL
USING (list_id IN (
  SELECT id FROM shopping_lists WHERE owner_id = auth.uid()
  UNION
  SELECT list_id FROM list_shares WHERE user_id = auth.uid() AND role = 'editor'
));

-- Dados Públicos Restritos (Promoções, Produtos, Supermercados)
-- Todos usuários autenticados podem ver, mas só admins (ou regras específicas) podem editar (simplificado para leitura pública para usuários no app).
CREATE POLICY "Anyone authenticated can view supermarkets" ON public.supermarkets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone authenticated can view products" ON public.products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone authenticated can view promotions" ON public.promotions FOR SELECT USING (auth.role() = 'authenticated');

-- Activating realtime for specific tables
alter publication supabase_realtime add table list_items;
alter publication supabase_realtime add table shopping_lists;
```

---

## Etapa 2: Configuração de Autenticação e Real-time (React Native)

Instale as dependências:
`npm install @supabase/supabase-js @react-native-async-storage/async-storage @react-native-google-signin/google-signin`

### 1. Inicializando o Cliente Supabase (`supabase.ts`)

```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 2. Autenticação (Login)

```typescript
import { supabase } from './supabase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Setup inicial do Google Sign in
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_FROM_GOOGLE_CLOUD',
});

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    if (userInfo.idToken) {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.idToken,
      });
      if (error) throw error;
      return data;
    } else {
      throw new Error('Sem ID token no login social.');
    }
  } catch (error) {
    console.error(error);
  }
};
```

### 3. Inscrição Real-time em uma Lista (`useRealtimeList.ts`)

Conforme solicitado, se o Usuário A modificar a lista (inserir/riscar item no carrinho), o B recebe instantaneamente.

```typescript
import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function useRealtimeList(listId: string) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    // Busca inicial
    const fetchItems = async () => {
      const { data } = await supabase.from('list_items').select('*').eq('list_id', listId);
      if (data) setItems(data);
    };
    fetchItems();

    // Sincronização Realtime (WebSockets)
    const channel = supabase
      .channel(`list_updates_${listId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'list_items', filter: `list_id=eq.${listId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setItems((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setItems((prev) => prev.map((item) => item.id === payload.new.id ? payload.new : item));
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listId]);

  return { items };
}
```

---

## Etapa 3: Lógica de Comparação de Preços Otimizada (TypeScript)

Esta lógica pode rodar no frontend ou via Supabase Edge Function (Deno).

```typescript
interface ListItem {
  id: string;
  product_id: string;
  quantity: number;
  unit: string; // 'kg', 'g', 'un', etc.
}

interface Promotion {
  product_id: string;
  supermarket_id: string;
  price: number;
  quantity_for_price: number;
  unit: string;
}

// Utilitário para conversão em unidade base genérica para a comparação (ex: g para kg)
function getBaseMultiplier(unit: string): number {
  if (['g', 'ml'].includes(unit)) return 0.001;
  return 1; // kg, L, un, pct
}

/**
 * Cruza a lista de necessidades com as promoções vigentes e retorna a rota ótima
 */
export function analyzeBestRoute(shoppingList: ListItem[], activePromos: Promotion[]) {
  const optimalCart: Record<string, any[]> = {}; // Agrupado por supermercado
  let totalOptimizedCost = 0;
  
  shoppingList.forEach(item => {
    // 1. Encontrar promoções para o produto específico
    const productPromos = activePromos.filter(p => p.product_id === item.product_id);
    
    if (productPromos.length === 0) {
      // Produto não possui promoção cadastrada
      if (!optimalCart['NO_PROMO']) optimalCart['NO_PROMO'] = [];
      optimalCart['NO_PROMO'].push({ item, reason: 'Nenhuma oferta encontrada' });
      return;
    }

    // 2. Normalizar e calcular o custo de cada oferta baseada na quantidade que o usuário quer comprar
    const options = productPromos.map(promo => {
      // Normaliza para a mesma grandeza (evita comparar Kg com Gramas diretamente sem converter)
      const itemBaseQty = item.quantity * getBaseMultiplier(item.unit);
      const promoBaseQty = promo.quantity_for_price * getBaseMultiplier(promo.unit);
      
      // Preço padronizado por unidade base 
      const pricePerBaseUnit = promo.price / promoBaseQty;
      
      // Quanto custa para levar a quantidade que o usuário quer
      const estimatedCost = pricePerBaseUnit * itemBaseQty;
      
      return {
        supermarket_id: promo.supermarket_id,
        pricePerBaseUnit,
        estimatedCost,
        promoDetails: promo
      };
    });

    // 3. Ordenar as opções pelo menor custo
    options.sort((a, b) => a.estimatedCost - b.estimatedCost);
    const bestOption = options[0];

    // 4. Atribuir ao resumo de compras (Carrinho ótimo)
    if (!optimalCart[bestOption.supermarket_id]) {
      optimalCart[bestOption.supermarket_id] = [];
    }
    
    optimalCart[bestOption.supermarket_id].push({
      item_id: item.id,
      product_id: item.product_id,
      cost: bestOption.estimatedCost
    });
    
    totalOptimizedCost += bestOption.estimatedCost;
  });

  return {
    strategy: optimalCart,
    totalOptimizedCost,
  };
}
```

### Como utilizar a função acima?

Se as suas listas possuírem muitos itens (centenas de promos por varredura), o ideal é que esse `analyzeBestRoute` seja hospedado em uma **Supabase Edge Function** que rode direto próximo ao banco PostgreSQL. O mobile simplesmente envia via POST `{"list_id": "123"}` e recebe a resposta agrupada (evitando trafegar todo o DB de promoções para o app local do usuário em rede 3g de mercado).
