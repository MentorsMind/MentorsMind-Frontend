import Select from '../forms/Select';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface Filters {
  skill: string;
  minRating: string;
  maxPrice: string;
  asset: string;
}

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
}

const SKILLS = [
  { value: '', label: 'All Skills' },
  { value: 'React', label: 'React' },
  { value: 'TypeScript', label: 'TypeScript' },
  { value: 'Python', label: 'Python' },
  { value: 'Rust', label: 'Rust' },
  { value: 'Soroban', label: 'Soroban' },
];

const ASSETS = [
  { value: '', label: 'Any Currency' },
  { value: 'XLM', label: 'XLM' },
  { value: 'USDC', label: 'USDC' },
  { value: 'PYUSD', label: 'PYUSD' },
];

export default function FilterPanel({ filters, onChange, onReset }: FilterPanelProps) {
  const set = (key: keyof Filters) => (value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onReset}>Reset</Button>
      </div>
      <Select label="Skill" options={SKILLS} value={filters.skill} onChange={set('skill')} />
      <Input label="Min Rating" type="number" value={filters.minRating} onChange={e => set('minRating')(e.target.value)} placeholder="4.0" />
      <Input label="Max Price ($/hr)" type="number" value={filters.maxPrice} onChange={e => set('maxPrice')(e.target.value)} placeholder="200" />
      <Select label="Currency" options={ASSETS} value={filters.asset} onChange={set('asset')} />
    </div>
  );
}
