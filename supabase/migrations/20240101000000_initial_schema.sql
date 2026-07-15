-- Create Markets Table
CREATE TABLE public.markets (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL references auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Items Table
CREATE TABLE public.items (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL references auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  qty NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL,
  category TEXT NOT NULL,
  is_essential BOOLEAN NOT NULL DEFAULT FALSE,
  only_promo BOOLEAN NOT NULL DEFAULT FALSE,
  is_bought BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  actual_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Promotions Table
CREATE TABLE public.promotions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL references auth.users(id) ON DELETE CASCADE,
  market_id TEXT NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  qty NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL,
  expiry_date TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Settings Table (Singleton pattern per user)
CREATE TABLE public.settings (
  user_id UUID PRIMARY KEY references auth.users(id) ON DELETE CASCADE,
  budget NUMERIC NOT NULL DEFAULT 0,
  dark_mode BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own markets" ON public.markets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own items" ON public.items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own promotions" ON public.promotions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own settings" ON public.settings FOR ALL USING (auth.uid() = user_id);

