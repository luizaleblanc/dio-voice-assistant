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
      setSuccess("Cadastro realizado. Você já pode entrar.");
      switchMode("login");
    } else {
      setError(result.error || "Não foi possível cadastrar.");
    }

    setIsLoading(false);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#050708] p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-px w-full max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-10 flex items-center justify-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500">
            <span className="text-sm font-bold text-black">O</span>
          </div>
          <span className="text-sm font-medium tracking-wide text-zinc-300">ORGANIZA AI</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
          <h1 className="text-lg font-semibold text-zinc-100">
            {mode === "login" ? "Entrar na conta" : "Criar conta"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {mode === "login" ? "Acesse seu assistente financeiro" : "Comece a organizar seus gastos"}
          </p>

          <div className="mt-6 flex border-b border-zinc-800">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 border-b-2 pb-2.5 text-sm font-medium transition-colors ${
                mode === "login"
                  ? "border-emerald-500 text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 border-b-2 pb-2.5 text-sm font-medium transition-colors ${
                mode === "register"
                  ? "border-emerald-500 text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors focus:border-emerald-500/50"
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-500">Confirmar senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors focus:border-emerald-500/50"
                />
              </div>
            )}

            {error && (
              <p className="rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-lg border border-emerald-900/40 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-400">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 rounded-lg bg-emerald-500 py-2.5 text-sm font-medium text-black transition-colors hover:bg-emerald-400 disabled:opacity-50"
            >
              {isLoading
                ? mode === "login" ? "Entrando..." : "Cadastrando..."
                : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}