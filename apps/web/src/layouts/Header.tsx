import { Link } from 'react-router-dom';
import { CountdownTimer } from '@/features/scraping/components/CountdownTimer';

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center">
          {/* Logo art has a transparent background; brightness-0 + invert
              recolors its navy content to white without touching that
              transparency, so it reads clearly on the dark header. */}
          <img src="/LOGO_RENDER.png" alt="LATAM Job Board" className="h-11 w-auto brightness-0 invert sm:h-12" />
        </Link>

        <div className="flex items-center gap-3">
          <CountdownTimer />
          <Link
            to="/setup"
            className="rounded-lg bg-gradient-to-r from-cta to-accent px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-transform hover:scale-105 hover:brightness-110"
          >
            Reconfigure
          </Link>
        </div>
      </div>
    </header>
  );
}
