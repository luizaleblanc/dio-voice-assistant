"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginBFF, registerBFF } from "@/app/actions/auth";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const resetFeedback = () => {
    setError("");
    setSuccess("");
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    resetFeedback();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await loginBFF(formData);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "E-mail ou senha incorretos.");
    }

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await registerBFF(formData);

    if (result.success) {
      setSuccess("Cadastro realizado! Você já pode entrar.");
      switchMode("login");
    } else {
      setError(result.error || "Não foi possível cadastrar.");
    }

    setIsLoading(false);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#03060a] p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
      </div>

      <div className="relative w-full max-w-md rounded-3xl border border-emerald-500/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 shadow-[0_0_40px_-5px_rgba(16,185,129,0.5)]">
            <span className="text-2xl">🎙️</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            QUAK <span className="text-emerald-400">Voice</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            {mode === "login" ? "Entre para continuar" : "Crie sua conta gratuita"}
          </p>
        </div>

        <div className="mb-6 flex rounded-xl border border-white/5 bg-white/[0.03] p-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              mode === "login"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              mode === "register"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-emerald-400/50 focus:bg-white/[0.06]"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-emerald-400/50 focus:bg-white/[0.06]"
          />

          {mode === "register" && (
            <input
              type="password"
              placeholder="Confirmar senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-emerald-400/50 focus:bg-white/[0.06]"
            />
          )}

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-sm text-red-300">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-center text-sm text-emerald-300">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 disabled:opacity-50"
          >
            {isLoading
              ? mode === "login" ? "Entrando..." : "Cadastrando..."
              : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>
      </div>
    </main>
  );
}