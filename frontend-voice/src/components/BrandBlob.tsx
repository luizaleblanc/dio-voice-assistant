type BrandBlobProps = {
  className?: string;
  delay?: string;
};

export function BrandBlob({ className = "", delay }: BrandBlobProps) {
  return (
    <div
      aria-hidden
      className={`brand-blob pointer-events-none absolute bg-gradient-to-br from-cyan-400/30 to-blue-700/30 blur-[90px] ${className}`}
      style={delay ? { animationDelay: `${delay}, ${delay}` } : undefined}
    />
  );
}
