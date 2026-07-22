"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function Home() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("Aguardando interação");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const sessionIdRef = useRef<string>("");

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
      setStatus("Gravando comando de voz...");
    } catch (error) {
      console.error("Erro ao acessar microfone:", error);
      setStatus("Erro de permissão do microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus("Processando áudio com a Inteligência Artificial...");
      
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudioTransaction = async (audioBlob: Blob) => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    const formData = new FormData();
    formData.append("file", audioBlob, "voice-command.webm");
    formData.append("sessionId", sessionIdRef.current); // Usa o valor guardado na referência

    try {
      const response = await fetch("http://localhost:8080/transactions/ai", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blobResponse = await response.blob();
      const audioUrl = URL.createObjectURL(blobResponse);
      const audio = new Audio(audioUrl);
      
      setStatus("Reproduzindo resposta...");
      audio.play();
      
      audio.onended = () => {
        setStatus("Transação finalizada.");
      };

    } catch (error) {
      console.error("Erro na requisição:", error);
      setStatus("Falha ao comunicar com o servidor backend.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-8">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center shadow-2xl relative">
        
        <div className="absolute top-6 right-6">
          <Link 
            href="/dashboard" 
            className="text-xs bg-zinc-800 hover:bg-indigo-600 px-3 py-2 rounded-lg transition-colors shadow-sm font-medium"
          >
            Dashboard
          </Link>
        </div>

        <h1 className="text-2xl font-semibold mb-2 tracking-tight mt-4">QUAK Voice</h1>
        <p className="text-zinc-400 text-sm mb-12 text-center h-6">{status}</p>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            isRecording 
              ? "bg-red-500 hover:bg-red-600 animate-pulse" 
              : "bg-indigo-600 hover:bg-indigo-500"
          }`}
          aria-label={isRecording ? "Parar gravação" : "Iniciar gravação"}
        >
          <div className={`rounded-full bg-white transition-all duration-300 ${isRecording ? "w-8 h-8 rounded-sm" : "w-12 h-12"}`} />
        </button>

        <div className="mt-12 text-xs text-zinc-600 text-center">
          <p>Clique no botão e diga, por exemplo:</p>
          <p className="italic mt-1">{'"Adicione uma despesa de 45 reais em alimentação"'}</p>
        </div>
      </div>
    </main>
  );
}