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
