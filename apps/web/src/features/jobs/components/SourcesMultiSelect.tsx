import type { Selection } from 'react-aria-components';
import { MultiSelect } from '@/components/base/select/multi-select';
import { useSourceCounts } from '../hooks/useSourceCounts';

interface SourcesMultiSelectProps {
  selected: string[];
  onChange: (sources: string[]) => void;
}

export function SourcesMultiSelect({ selected, onChange }: SourcesMultiSelectProps) {
  const { data: counts = [] } = useSourceCounts();

  const items = counts.map((c) => ({
    id: c.source,
    label: c.source,
    supportingText: `${c.count}`,
  }));

  const selectedKeys: Selection = new Set(selected);

  const handleSelectionChange = (keys: Selection) => {
    onChange(keys === 'all' ? items.map((i) => String(i.id)) : [...keys].map(String));
  };

  return (
    <MultiSelect
      aria-label="Sources"
      items={items}
      selectedKeys={selectedKeys}
      onSelectionChange={handleSelectionChange}
      onReset={() => onChange([])}
      onSelectAll={() => onChange(items.map((i) => String(i.id)))}
      placeholder="All sources"
      selectedCountFormatter={(count) => `${count} source${count === 1 ? '' : 's'}`}
      size="sm"
      className="w-48"
    >
      {(item) => (
        <MultiSelect.Item id={item.id} label={item.label} supportingText={item.supportingText} selectionIndicator="checkbox" selectionIndicatorAlign="left" />
      )}
    </MultiSelect>
  );
}
