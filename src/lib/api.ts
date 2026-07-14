export interface User { id: string; email: string; }

export async function apiRegister(email: string, password: string): Promise<User> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao criar conta');
  return data.user;
}

export async function apiLogin(email: string, password: string): Promise<User> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao fazer login');
  return data.user;
}

export async function apiLogout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}

export async function apiGetMe(): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch { return null; }
}

export async function apiGetSettings(): Promise<{ budget: number; dark_mode: boolean } | null> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function apiSaveSettings(budget: number, darkMode: boolean): Promise<void> {
  await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ budget, dark_mode: darkMode }),
  });
}

export async function apiGetItems(): Promise<any[]> {
  try {
    const res = await fetch('/api/items');
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function apiSyncItems(items: any[]): Promise<void> {
  await fetch('/api/items/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
}

export async function apiGetMarkets(): Promise<any[]> {
  try {
    const res = await fetch('/api/markets');
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function apiSyncMarkets(markets: any[]): Promise<void> {
  await fetch('/api/markets/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ markets }),
  });
}

export async function apiGetPromotions(): Promise<any[]> {
  try {
    const res = await fetch('/api/promotions');
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function apiSyncPromotions(promotions: any[]): Promise<void> {
  await fetch('/api/promotions/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ promotions }),
  });
}
