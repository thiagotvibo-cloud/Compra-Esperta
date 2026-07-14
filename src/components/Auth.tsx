import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { apiLogin, apiRegister, User } from '../lib/api';

interface Props { onAuth: (user: User) => void; }

export const AuthUI: React.FC<Props> = ({ onAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      const user = isLogin ? await apiLogin(email, password) : await apiRegister(email, password);
      onAuth(user);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-soft-bg dark:bg-zinc-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-[24px] p-8 shadow-soft">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-soft-primary rounded-[20px] flex items-center justify-center text-white mx-auto mb-4 shadow-primary">
            <ShoppingCart size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-soft-text-main">Compra Esperta</h1>
          <p className="text-soft-text-muted text-sm mt-2">Entre para sincronizar suas listas</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium">{error}</div>}
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-soft-text-main mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-soft-card dark:bg-zinc-700/50 rounded-[20px] px-4 py-3 focus:outline-none dark:text-zinc-100 placeholder-soft-text-muted"
              placeholder="Seu email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-soft-text-main mb-1">Senha</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-soft-card dark:bg-zinc-700/50 rounded-[20px] px-4 py-3 focus:outline-none dark:text-zinc-100 placeholder-soft-text-muted"
              placeholder="Mínimo 6 caracteres" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-soft-primary hover:bg-soft-primary-hover text-white font-semibold rounded-full py-4 mt-4 disabled:opacity-50 transition-colors shadow-primary">
            {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button type="button" onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-sm font-medium text-soft-primary hover:text-soft-primary-hover transition-colors">
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
          </button>
        </div>
      </div>
    </div>
  );
};
