import { FilterType } from "@/lib/types";

const tabs: { label: string; value: FilterType }[] = [
  { label: "すべて", value: "all" },
  { label: "売買", value: "sale" },
  { label: "賃貸", value: "rent" },
];

interface FilterTabsProps {
  current: FilterType;
  onChange: (filter: FilterType) => void;
}

export default function FilterTabs({ current, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            current === tab.value
              ? "bg-[#0D6E6E] text-white"
              : "bg-[#F5F5F5] text-[#666666] hover:bg-gray-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
