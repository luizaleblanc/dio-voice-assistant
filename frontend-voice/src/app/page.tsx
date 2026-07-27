import { BrandBlob } from "@/components/BrandBlob";
import { BrandKnot } from "@/components/BrandKnot";
import { SlideButton } from "@/components/SlideButton";
import { logoutBFF } from "@/app/actions/auth";

export default function Splash() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-[#02040a] px-6 py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0">
        <BrandBlob className="left-1/2 top-1/4 h-[26rem] w-[26rem] -translate-x-1/2" />
        <BrandBlob className="bottom-0 right-[-4rem] h-72 w-72" delay="-6s" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #7dd3fc 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
      </div>

      <div />

      <div className="relative z-10 flex flex-col items-center">
        <BrandKnot size={240} className="sm:hidden" />
        <BrandKnot size={280} className="hidden sm:block" />

        <h1 className="relative z-10 mt-6 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Organiza IA
        </h1>
        <p className="relative z-10 mt-3 max-w-xs text-center text-sm text-zinc-400 sm:text-base">
          Fale com o assistente e organize seus gastos automaticamente, em segundos.
        </p>
      </div>

      <SlideButton
        label="Deslize para começar"
        href="/login"
        onBeforeNavigate={logoutBFF}
        className="relative z-10 w-full max-w-sm shadow-lg shadow-blue-500/20"
      />
    </main>
  );
}
