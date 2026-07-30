-- COMPRA ESPERTA - SUPABASE SCHEMA V2
-- Estrutura para suportar Controle de Estoque, Marmitas e Projeções

-- Habilitar pgcrypto para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. PROFILES (Extensão do Auth)
-- ==========================================
-- (Assumindo que já existe ou precisará caso não exista)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  budget NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- 2. CATEGORIES & UNITS (Tabelas de Apoio)
-- ==========================================
-- Embora possamos usar Enums, tabelas de domínio dão mais flexibilidade
CREATE TABLE IF NOT EXISTS public.units (
  id TEXT PRIMARY KEY, -- ex: 'kg', 'g', 'un', 'pct', 'L', 'ml'
  description TEXT
);

-- ==========================================
-- 3. INVENTORY (Estoque)
-- ==========================================
-- Substitui a lista simples, mantendo histórico e quantidade atual.
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit_id TEXT REFERENCES public.units(id),
  current_quantity NUMERIC DEFAULT 0,
  min_quantity NUMERIC DEFAULT 0, -- Ponto de ressuprimento
  is_essential BOOLEAN DEFAULT false,
  expiration_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own inventory" ON public.inventory_items FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 4. SHOPPING TRIPS (Histórico de Compras)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.shopping_trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  market_name TEXT,
  trip_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  total_spent NUMERIC DEFAULT 0,
  economy_generated NUMERIC DEFAULT 0,
  notes TEXT
);

ALTER TABLE public.shopping_trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trips" ON public.shopping_trips FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 5. SHOPPING ITEMS (Itens comprados na viagem)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.shopping_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.shopping_trips(id) ON DELETE CASCADE NOT NULL,
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL, -- Caso o item não esteja no estoque
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED,
  is_promo BOOLEAN DEFAULT false
);

ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
-- (RLS herdada pelo trip_id / user_id através de joins, ou política direta se necessário)

-- ==========================================
-- 6. MEAL PLANS (Planejamento de Marmitas)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_meals NUMERIC DEFAULT 0,
  people_count NUMERIC DEFAULT 1,
  estimated_budget NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own meal plans" ON public.meal_plans FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 7. RECIPES / INGREDIENTS (Ficha Técnica)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  yields_meals NUMERIC DEFAULT 1,
  instructions TEXT
);

CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  inventory_item_id UUID REFERENCES public.inventory_items(id) NOT NULL,
  quantity_required NUMERIC NOT NULL,
  unit_id TEXT REFERENCES public.units(id)
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 8. CONSUMPTION LOG (Baixa de Estoque)
-- ==========================================
-- Registra o que foi consumido (seja por marmita ou avulso)
CREATE TABLE IF NOT EXISTS public.consumption_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  inventory_item_id UUID REFERENCES public.inventory_items(id) NOT NULL,
  quantity NUMERIC NOT NULL,
  consumed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  related_meal_plan_id UUID REFERENCES public.meal_plans(id)
);

ALTER TABLE public.consumption_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own consumption" ON public.consumption_logs FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- VIEWS E FUNÇÕES AUXILIARES
-- ==========================================
-- View para Projeção Financeira Mensal
CREATE OR REPLACE VIEW public.monthly_financial_projection AS
SELECT 
    p.id as user_id,
    p.budget as initial_budget,
    COALESCE(SUM(st.total_spent), 0) as total_spent_month,
    p.budget - COALESCE(SUM(st.total_spent), 0) as current_balance
FROM public.profiles p
LEFT JOIN public.shopping_trips st 
  ON p.id = st.user_id 
  AND date_trunc('month', st.trip_date) = date_trunc('month', CURRENT_DATE)
GROUP BY p.id, p.budget;

