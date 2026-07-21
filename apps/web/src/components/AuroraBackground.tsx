export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/4 top-[-10%] h-[420px] w-[420px] animate-glow rounded-full bg-cta/20 blur-[120px]" />
      <div className="absolute right-[-5%] top-[20%] h-[380px] w-[380px] animate-glow rounded-full bg-accent/20 blur-[120px] [animation-delay:1.5s]" />
      <div className="absolute bottom-[-15%] left-[10%] h-[360px] w-[360px] animate-glow rounded-full bg-latam-yes/10 blur-[130px] [animation-delay:3s]" />
    </div>
  );
}
