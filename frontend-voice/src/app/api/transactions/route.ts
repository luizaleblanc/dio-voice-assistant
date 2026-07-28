import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get("organiza_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Erro ao limpar transações" }, { status: response.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BFF] Falha ao limpar transações:", error);
    return NextResponse.json({ error: "Falha ao conectar com o servidor" }, { status: 500 });
  }
}
