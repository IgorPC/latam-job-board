import { generateBooleanLinks } from '../utils/boolean-search';

interface BooleanSearchLinksProps {
  primaryStack: string[];
  secondaryStack: string[];
}

export function BooleanSearchLinks({ primaryStack, secondaryStack }: BooleanSearchLinksProps) {
  const links = generateBooleanLinks(primaryStack, secondaryStack);

  if (links.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-surface/40 p-6">
      <h2 className="font-display text-lg font-semibold text-slate-100">Manual search, tuned to your stack</h2>
      <p className="mt-1 text-sm text-slate-400">
        These open pre-filled Google searches over ATS platforms and job boards our scraper doesn't cover directly.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.hint}
            className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-slate-300 transition-colors hover:border-cta/50 hover:text-cta-light"
          >
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}
