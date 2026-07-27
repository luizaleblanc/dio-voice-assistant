type WaveformProps = {
  bars?: number;
  className?: string;
  barClassName?: string;
};

export function Waveform({ bars = 9, className = "", barClassName = "bg-black/70" }: WaveformProps) {
  return (
    <div aria-hidden className={`flex items-end gap-[3px] ${className}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={`wave-bar w-[3px] rounded-full ${barClassName}`}
          style={{ height: "100%", animationDelay: `${i * 0.09}s`, animationDuration: `${0.7 + (i % 3) * 0.15}s` }}
        />
      ))}
    </div>
  );
}
