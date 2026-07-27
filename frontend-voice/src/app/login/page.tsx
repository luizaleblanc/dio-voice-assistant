"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginBFF, registerBFF } from "@/app/actions/auth";
import { BrandBlob } from "@/components/BrandBlob";
import { PasswordInput } from "@/components/PasswordInput";

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#02040a] px-4 py-10 sm:p-6">
      <div className="pointer-events-none absolute inset-0">
        <BrandBlob className="left-1/2 top-1/4 h-[28rem] w-[28rem] -translate-x-1/2" />
        <BrandBlob className="bottom-0 right-0 h-72 w-72" delay="-6s" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #7dd3fc 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="absolute left-1/2 top-0 h-px w-full max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
      </div>

      <Link
        href="/"
        aria-label="Voltar para a tela inicial"
        className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-300 transition-colors hover:border-cyan-400/30 hover:bg-white/[0.06] sm:left-6 sm:top-6"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      <div className="relative w-full max-w-sm">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <h1 className="text-center text-lg font-semibold text-zinc-100">
            {mode === "login" ? "Entrar na conta" : "Criar conta"}
          </h1>
          <p className="mt-1 text-center text-sm text-zinc-500">
            {mode === "login" ? "Acesse seu assistente financeiro" : "Comece a organizar seus gastos"}
          </p>

          <div className="mt-6 flex rounded-xl border border-white/10 bg-black/30 p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow shadow-blue-500/30"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === "register"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow shadow-blue-500/30"
                  : "text-zinc-500 hover:text-zinc-300"
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
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition-colors focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>

            <PasswordInput
              label="Senha"
              value={password}
              onChange={setPassword}
              required
              hint={mode === "register" ? "A senha deve ter no mínimo 8 caracteres." : undefined}
            />

            {mode === "register" && (
              <PasswordInput
                label="Confirmar senha"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
              />
            )}

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-300">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-opacity hover:opacity-90 disabled:opacity-50"
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
