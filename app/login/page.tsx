"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Credenciais inválidas. Verifique o email e senha.");
        setLoading(false);
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("Ocorreu um erro ao realizar login.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#141414] flex items-center justify-center p-4 relative">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-radial from-red-950/20 via-[#141414] to-[#141414] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#161616] border border-white/10 p-8 sm:p-10 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <span className="font-black text-2xl tracking-wider text-[#e50914] uppercase">
              CANDY MACHINE
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white">Painel Administrativo</h1>
          <p className="text-sm text-[#808080]">
            Digite suas credenciais para gerenciar o portfólio.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-950/40 border border-[#e50914]/50 text-red-200 p-3.5 rounded-md text-sm">
            <ShieldAlert size={18} className="shrink-0 text-[#e50914]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-3.5 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@candymachine.com"
                className="w-full bg-[#222222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-md py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-gray-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Senha
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3.5 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#222222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-md py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-gray-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e50914] hover:bg-[#f6121d] text-white font-bold py-3 px-4 rounded-md transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? (
              <span>Entrando...</span>
            ) : (
              <>
                <span>Acessar Painel</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-xs text-[#808080] hover:text-white transition-colors"
          >
            ← Voltar para a Landing Page pública
          </Link>
        </div>
      </div>
    </main>
  );
}
