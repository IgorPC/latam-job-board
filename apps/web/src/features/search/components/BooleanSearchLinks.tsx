import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { MultiSelect } from '@/components/base/select/multi-select';
import { generateBooleanLinks } from '../utils/boolean-search';

interface BooleanSearchLinksProps {
  primaryStack: string[];
  secondaryStack: string[];
}

function LinkPills({ links }: { links: ReturnType<typeof generateBooleanLinks> }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
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
  );
}

function StackLinkGroup({ tech, tier }: { tech: string; tier: 'Primary' | 'Secondary' }) {
  const links = generateBooleanLinks([tech]);
  if (links.length === 0) return null;

  const tierClass = tier === 'Primary' ? 'bg-cta/15 text-cta-light' : 'bg-accent/15 text-accent';

  return (
    <div className="mt-5 first:mt-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-100">{tech}</span>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${tierClass}`}>{tier}</span>
      </div>
      <LinkPills links={links} />
    </div>
  );
}

function CustomStackGroup({ allStack }: { allStack: string[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const links = generateBooleanLinks(selected);
  const items = allStack.map((tech) => ({ id: tech, label: tech }));
  const selectedKeys: Selection = new Set(selected);

  const handleSelectionChange = (keys: Selection) => {
    setSelected(keys === 'all' ? allStack : [...keys].map(String));
  };

  return (
    <div className="mt-6 border-t border-border pt-5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-100">Custom</span>
        <span className="inline-flex items-center rounded-full bg-slate-500/15 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
          Your pick
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-400">Combine any technologies from your stack into a single search.</p>

      <div className="mt-3">
        <MultiSelect
          aria-label="Custom stack selection"
          items={items}
          selectedKeys={selectedKeys}
          onSelectionChange={handleSelectionChange}
          onReset={() => setSelected([])}
          onSelectAll={() => setSelected(allStack)}
          placeholder="Select technologies"
          selectedCountFormatter={(count) => `${count} tech${count === 1 ? '' : 's'} selected`}
          size="sm"
          className="w-64"
        >
          {(item) => <MultiSelect.Item id={item.id} label={item.label} selectionIndicator="checkbox" selectionIndicatorAlign="left" />}
        </MultiSelect>
      </div>

      {links.length > 0 && <LinkPills links={links} />}
    </div>
  );
}

export function BooleanSearchLinks({ primaryStack, secondaryStack }: BooleanSearchLinksProps) {
  if (primaryStack.length === 0 && secondaryStack.length === 0) return null;

  const allStack = [...new Set([...primaryStack, ...secondaryStack])];

  return (
    <section className="rounded-2xl border border-border bg-surface/40 p-6">
      <h2 className="font-display text-lg font-semibold text-slate-100">Manual search, tuned to your stack</h2>
      <p className="mt-1 text-sm text-slate-400">
        These open pre-filled Google searches over ATS platforms and job boards our scraper doesn't cover directly.
      </p>

      {primaryStack.map((tech) => (
        <StackLinkGroup key={`primary-${tech}`} tech={tech} tier="Primary" />
      ))}
      {secondaryStack.map((tech) => (
        <StackLinkGroup key={`secondary-${tech}`} tech={tech} tier="Secondary" />
      ))}

      <CustomStackGroup allStack={allStack} />
    </section>
  );
}
