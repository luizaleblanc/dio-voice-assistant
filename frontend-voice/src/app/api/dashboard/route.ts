import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("organiza_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/transactions/dashboard`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Erro ao buscar dados" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("[BFF] Falha ao buscar dashboard:", error);
    return NextResponse.json({ error: "Falha ao conectar com o servidor" }, { status: 500 });
  }
}