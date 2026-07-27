"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { logoutBFF } from "@/app/actions/auth";
import { BrandBlob } from "@/components/BrandBlob";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ConfirmModal } from "@/components/ConfirmModal";
import { getCategoryColor, getCategoryLabel } from "@/lib/categories";

interface CategorySummary {
  category: string;
  total: number;
  currency: string;
  count: number;
  percentage: number;
}

interface TransactionOutput {
  id: string;
  description: string;
  category: string;
  value: number;
  currency: string;
}

interface DashboardData {
  totalSpent: number;
  currency: string;
  categories: CategorySummary[];
  transactions: TransactionOutput[];
}

function capitalize(text: string) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function FinanceDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logoutBFF();
    router.push("/login");
  };

  const handleClearTransactions = async () => {
    setClearing(true);
    try {
      const res = await fetch("/api/transactions", { method: "DELETE" });

      if (res.status === 401 || res.status === 403) {
        await handleLogout();
        return;
      }

      if (!res.ok) throw new Error("Falha ao limpar transações");

      setData((prev) => ({
        totalSpent: 0,
        currency: prev?.currency || "BRL",
        categories: [],
        transactions: [],
      }));
      setShowClearModal(false);
    } catch {
      setError("Não foi possível limpar as transações.");
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    fetch("/api/dashboard")
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          await handleLogout();
          return null;
        }
        if (!res.ok) throw new Error("Falha ao carregar dados");
        return res.json();
      })
      .then((json: DashboardData | null) => {
        if (json) setData(json);
      })
      .catch(() => setError("Não foi possível carregar o dashboard."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02040a] px-4 py-6 text-zinc-100 sm:p-6">
      <div className="pointer-events-none absolute inset-0">
        <BrandBlob className="-top-24 right-0 h-96 w-96" delay="-8s" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #7dd3fc 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl">
        <div className="relative mb-6 flex items-center justify-between gap-3 sm:mb-8">
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-cyan-400/30 hover:bg-white/[0.06] sm:px-4 sm:text-sm"
          >
            Voltar
          </Link>

          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <h1 className="text-base font-semibold text-zinc-100 sm:text-lg">Resumo financeiro</h1>
            <p className="text-xs text-zinc-500 sm:text-sm">Seus gastos por categoria</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              aria-label="Limpar todas as transações"
              title="Limpar todas as transações"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 transition-colors hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-.8 12a2 2 0 0 1-2 1.8H8.8a2 2 0 0 1-2-1.8L6 7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-cyan-400/30 hover:bg-white/[0.06] sm:px-4 sm:text-sm"
            >
              Sair
            </button>
          </div>
        </div>

        {loading && <p className="text-center text-sm text-zinc-500">Carregando...</p>}
        {error && <p className="text-center text-sm text-red-300">{error}</p>}

        {data && !loading && (
          <>
            <div className="mb-6 rounded-3xl border border-blue-500/15 bg-black/40 p-5 text-center backdrop-blur-xl sm:mb-8 sm:p-6">
              <p className="text-sm text-zinc-500">Total gasto</p>
              <p className="mt-1 bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                {data.totalSpent.toLocaleString("pt-BR", { style: "currency", currency: data.currency || "BRL" })}
              </p>
            </div>

            {data.categories.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-zinc-500">
                Nenhuma transação registrada ainda. Grave um comando de voz para começar.
              </div>
            ) : (
              <>
                <div className="mb-6 rounded-3xl border border-blue-500/15 bg-black/40 p-4 backdrop-blur-xl sm:mb-8 sm:p-6">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={data.categories}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                      >
                        {data.categories.map((entry) => (
                          <Cell key={entry.category} fill={getCategoryColor(entry.category)} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(
                          value: unknown,
                          _name: unknown,
                          item: { payload?: CategorySummary }
                        ) => {
                          const numericValue = typeof value === "number" ? value : 0;
                          const payload = item?.payload;
                          const currency = payload?.currency ?? "BRL";
                          const categoryKey = payload?.category ?? "";

                          return [
                            numericValue.toLocaleString("pt-BR", { style: "currency", currency }),
                            getCategoryLabel(categoryKey),
                          ];
                        }}
                        contentStyle={{ background: "#0a0f1a", border: "1px solid rgba(125,211,252,0.15)", borderRadius: 8 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mb-6 space-y-2.5 sm:mb-8 sm:space-y-3">
                  {data.categories.map((cat) => (
                    <div
                      key={cat.category}
                      className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 sm:p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                          style={{ backgroundColor: getCategoryColor(cat.category) }}
                        >
                          <CategoryIcon category={cat.category} className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-200">
                            {getCategoryLabel(cat.category)}
                          </p>
                          <p className="text-xs text-zinc-500">{cat.count} transação(ões)</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-zinc-100">
                          {cat.total.toLocaleString("pt-BR", { style: "currency", currency: cat.currency || "BRL" })}
                        </p>
                        <p className="text-xs text-zinc-500">{cat.percentage.toFixed(0)}%</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h2 className="mb-3 text-sm font-medium text-zinc-400">Transações</h2>
                  <div className="space-y-2">
                    {data.transactions.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-3 sm:px-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                            style={{ backgroundColor: getCategoryColor(t.category) }}
                          >
                            <CategoryIcon category={t.category} className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm text-zinc-200">{capitalize(t.description)}</p>
                            <p className="text-xs text-zinc-500">{getCategoryLabel(t.category)}</p>
                          </div>
                        </div>
                        <p className="shrink-0 text-sm font-medium text-zinc-300">
                          {t.value.toLocaleString("pt-BR", { style: "currency", currency: t.currency || "BRL" })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        open={showClearModal}
        title="Limpar todas as transações?"
        description="Essa ação é irreversível: todas as suas transações registradas serão apagadas permanentemente."
        confirmLabel="Limpar tudo"
        loading={clearing}
        onConfirm={handleClearTransactions}
        onCancel={() => setShowClearModal(false)}
      />
    </main>
  );
}