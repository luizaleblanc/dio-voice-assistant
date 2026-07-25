import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("organiza_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get("file") as Blob;
    const sessionId = formData.get("sessionId") as string;

    if (!audioFile) {
        return NextResponse.json({ error: "Áudio não encontrado" }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    console.log("[BFF] Enviando áudio como Base64 (JSON)...");

    const response = await fetch("http://localhost:8080/transactions/ai-base64", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
          audioBase64: base64Audio,
          sessionId: sessionId
      }),
    });

    if (!response.ok) {
      console.error(`[BFF] Erro no Java: ${response.status}`);
      return NextResponse.json({ error: "Erro interno" }, { status: response.status });
    }

    const data = await response.json();
    const responseAudioBase64 = data.audioBase64;

    if (!responseAudioBase64) {
      console.error("[BFF] Resposta do Java não contém audioBase64");
      return NextResponse.json({ error: "Resposta inválida do servidor" }, { status: 502 });
    }

    const audioBuffer = Buffer.from(responseAudioBase64, "base64");

    return new NextResponse(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" }
    });

  } catch (error) {
    console.error("[BFF] Falha de rede:", error);
    return NextResponse.json({ error: "Falha ao conectar com o Java" }, { status: 500 });
  }
}