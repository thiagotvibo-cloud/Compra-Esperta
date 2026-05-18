-- 1. Cria a tabela de configurações
CREATE TABLE IF NOT EXISTS public.settings (
  user_id UUID PRIMARY KEY,
  budget NUMERIC DEFAULT 0,
  dark_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Cria a tabela de itens (Lista de Compras)
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  qty NUMERIC DEFAULT 1,
  unit TEXT DEFAULT 'un',
  category TEXT DEFAULT 'Outros',
  is_essential BOOLEAN DEFAULT false,
  only_promo BOOLEAN DEFAULT false,
  is_bought BOOLEAN DEFAULT false,
  notes TEXT,
  actual_price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Cria a tabela de mercados
CREATE TABLE IF NOT EXISTS public.markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Cria a tabela de promoções
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  market_id UUID REFERENCES public.markets(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  price NUMERIC DEFAULT 0,
  qty NUMERIC DEFAULT 1,
  unit TEXT DEFAULT 'un',
  expiry_date TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Habilitar RLS (Row Level Security) nas tabelas
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- 6. Habilitar o SUPABASE REALTIME em todas as tabelas (Importante para sincronizar 2 celulares instantaneamente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE settings;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE items;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'markets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE markets;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'promotions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE promotions;
  END IF;
END $$;

-- 7. Limpar políticas antigas se existirem para evitar o erro "policy already exists"
DROP POLICY IF EXISTS "Users can manage their own markets" ON public.markets;
DROP POLICY IF EXISTS "Users can manage their own items" ON public.items;
DROP POLICY IF EXISTS "Users can manage their own promotions" ON public.promotions;
DROP POLICY IF EXISTS "Users can manage their own settings" ON public.settings;
DROP POLICY IF EXISTS "Acesso Settings" ON public.settings;
DROP POLICY IF EXISTS "Acesso Items" ON public.items;
DROP POLICY IF EXISTS "Acesso Markets" ON public.markets;
DROP POLICY IF EXISTS "Acesso Promotions" ON public.promotions;

-- 8. Recriar Políticas de Segurança (O usuário só vê e edita os próprios dados)
CREATE POLICY "Acesso Settings" ON public.settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Acesso Items" ON public.items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Acesso Markets" ON public.markets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Acesso Promotions" ON public.promotions FOR ALL USING (auth.uid() = user_id);

