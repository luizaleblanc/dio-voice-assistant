"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutBFF } from "@/app/actions/auth";
import { BrandBlob } from "@/components/BrandBlob";
import { Waveform } from "@/components/Waveform";
import { WaveLines } from "@/components/WaveLines";

export default function Dashboard() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("Toque para começar a falar");
  const router = useRouter();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sessionIdRef = useRef<string>("");

  const handleLogout = async () => {
    await logoutBFF();
    router.push("/login");
  };

  useEffect(() => {
    sessionIdRef.current = Date.now().toString(36) + Math.random().toString(36).substring(2);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudioTransaction(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatus("Ouvindo...");
    } catch (error) {
      console.error("Erro ao acessar microfone:", error);
      setStatus("Erro de permissão do microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus("Processando com IA...");

      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudioTransaction = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "voice-command.webm");
    formData.append("sessionId", sessionIdRef.current);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        setStatus("Sessão expirada. Redirecionando...");
        await handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Lê a resposta em formato binário bruto
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      console.log("Tamanho da resposta (bytes):", bytes.length);
      console.log("Primeiros 16 bytes (hex):", Array.from(bytes.slice(0, 16)).map(b => b.toString(16).padStart(2, "0")).join(" "));

      if (bytes.length === 0) {
        setStatus("Erro: Áudio gerado está vazio.");
        return;
      }

      let audioUrl = "";

      // Analisa os "Magic Bytes" para descobrir o verdadeiro formato do áudio
      if (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
        // Cabeçalho ID3 -> É um MP3
        audioUrl = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
      } else if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] === 0xfb || bytes[1] === 0xf3 || bytes[1] === 0xe3 || bytes[1] === 0xfa || bytes[1] === 0xf2)) {
        // Frame Sync -> É um MP3
        audioUrl = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
      } else if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
        // Cabeçalho WebM
        audioUrl = URL.createObjectURL(new Blob([bytes], { type: "audio/webm" }));
      } else if (bytes.length >= 4 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
        // Cabeçalho RIFF -> É um WAV
        audioUrl = URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
      } else {
        // Fallback: Verifica se o servidor devolveu uma string Base64 em vez de binário
        let isBase64 = true;
        for (let i = 0; i < Math.min(50, bytes.length); i++) {
          const c = bytes[i];
          // Checa se os caracteres estão dentro do padrão aceito do Base64
          if (!(c >= 65 && c <= 90) && !(c >= 97 && c <= 122) && !(c >= 48 && c <= 57) && c !== 43 && c !== 47 && c !== 61) {
            isBase64 = false;
            break;
          }
        }

        if (isBase64) {
          const textString = new TextDecoder().decode(bytes);
          audioUrl = `data:audio/mpeg;base64,${textString}`;
        } else {
          // Último recurso
          audioUrl = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
        }
      }

      const audio = new Audio(audioUrl);
      setStatus("Reproduzindo resposta...");

      audio.load();

      audio.play().catch(e => {
        console.error("Erro ao reproduzir o áudio:", e);
        setStatus("Erro ao tocar a resposta da IA.");
      });

      audio.onended = () => {
        setStatus("Toque para começar a falar");
      };

    } catch (error) {
      console.error("Erro na requisição:", error);
      setStatus("Falha ao comunicar com o servidor.");
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#02040a] px-4 py-8 sm:p-8">
      <div className="pointer-events-none absolute inset-0">
        <BrandBlob className="left-1/2 top-1/3 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2" />
        <BrandBlob className="bottom-[-3rem] left-[-3rem] h-64 w-64" delay="-5s" />
        <BrandBlob className="right-[-2rem] top-16 h-52 w-52" delay="-9s" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #7dd3fc 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-20 flex items-center justify-between gap-2">
        <div aria-hidden className="hidden shrink-0 items-center gap-2 sm:invisible sm:flex">
          <span className="rounded-xl border px-4 py-2 text-sm">Resumo financeiro</span>
          <span className="rounded-xl border px-4 py-2 text-sm">Sair</span>
        </div>

        <h1 className="flex-1 truncate text-center text-sm font-semibold text-zinc-100 sm:text-base">
          Gravar
        </h1>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/dashboard/finance"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-cyan-400/30 hover:bg-white/[0.06] sm:px-4 sm:text-sm"
          >
            Resumo financeiro
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-cyan-400/30 hover:bg-white/[0.06] sm:px-4 sm:text-sm"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center">
        <WaveLines className="absolute inset-x-0 top-1/2 -translate-y-1/2" height={340} />

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`relative z-10 flex h-40 w-40 items-center justify-center rounded-full shadow-2xl transition-all duration-300 sm:h-52 sm:w-52 ${
            isRecording
              ? "bg-gradient-to-br from-rose-500 to-red-600 shadow-red-500/40"
              : "bg-gradient-to-br from-cyan-400 to-blue-600 shadow-blue-500/40 hover:from-cyan-300 hover:to-blue-500"
          }`}
          aria-label={isRecording ? "Parar gravação" : "Iniciar gravação"}
        >
          {isRecording ? (
            <Waveform bars={9} className="h-11" barClassName="bg-black/70" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12 text-black/80">
              <path
                d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
                fill="currentColor"
              />
              <path
                d="M19 11a7 7 0 0 1-14 0M12 18v3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      <div className="relative z-10 mb-6 sm:mb-10">
        <p className="h-6 text-center text-sm text-zinc-400">{status}</p>

        <div className="mx-auto mt-6 max-w-xs text-center text-xs text-zinc-600">
          <p>Toque no botão e diga, por exemplo:</p>
          <p className="mt-1 italic text-zinc-500">
            &quot;Adicione uma despesa de 45 reais em alimentação&quot;
          </p>
        </div>
      </div>
    </main>
  );
}
