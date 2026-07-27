"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { logoutBFF } from "@/app/actions/auth";

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

const CATEGORY_LABELS: Record<string, string> = {
  GROCERIES: "Mercado",
  PHARMA: "Farmácia",
  AUTO: "Automóvel",
};

const COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];

export default function FinanceDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogout = async () => {
    await logoutBFF();
    router.push("/login");
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
    <main className="relative min-h-screen overflow-hidden bg-[#03060a] p-6 text-zinc-100">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-zinc-300">Dashboard Financeiro</h1>
            <p className="text-sm text-zinc-500">Seus gastos por categoria</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/[0.06]"
            >
              Voltar
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/[0.06]"
            >
              Sair
            </button>
          </div>
        </div>

        {loading && <p className="text-center text-sm text-zinc-500">Carregando...</p>}
        {error && <p className="text-center text-sm text-red-300">{error}</p>}

        {data && !loading && (
          <>
            <div className="mb-8 rounded-3xl border border-emerald-500/10 bg-black/40 p-6 text-center backdrop-blur-xl">
              <p className="text-sm text-zinc-500">Total gasto</p>
              <p className="mt-1 text-4xl font-bold text-emerald-400">
                {data.totalSpent.toLocaleString("pt-BR", { style: "currency", currency: data.currency || "BRL" })}
              </p>
            </div>

            {data.categories.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-zinc-500">
                Nenhuma transação registrada ainda. Grave um comando de voz para começar.
              </div>
            ) : (
              <>
                <div className="mb-8 rounded-3xl border border-emerald-500/10 bg-black/40 p-6 backdrop-blur-xl">
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
                        {data.categories.map((entry, index) => (
                          <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
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
                            CATEGORY_LABELS[categoryKey] || categoryKey,
                          ];
                        }}
                        contentStyle={{ background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mb-8 space-y-3">
                  {data.categories.map((cat, index) => (
                    <div
                      key={cat.category}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="text-sm font-medium text-zinc-200">
                            {CATEGORY_LABELS[cat.category] || cat.category}
                          </p>
                          <p className="text-xs text-zinc-500">{cat.count} transação(ões)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-400">
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
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                      >
                        <div>
                          <p className="text-sm text-zinc-200">{t.description}</p>
                          <p className="text-xs text-zinc-500">{CATEGORY_LABELS[t.category] || t.category}</p>
                        </div>
                        <p className="text-sm font-medium text-zinc-300">
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
    </main>
  );
}