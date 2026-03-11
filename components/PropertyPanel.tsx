import { Property, FilterType } from "@/lib/types";
import PropertyCard from "./PropertyCard";
import FilterTabs from "./FilterTabs";

interface PropertyPanelProps {
  properties: Property[];
  count: number;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  selectedId: string | null;
  onSelectProperty: (id: string) => void;
  hasArea: boolean;
  isLoading: boolean;
}

export default function PropertyPanel({
  properties,
  count,
  filter,
  onFilterChange,
  selectedId,
  onSelectProperty,
  hasArea,
  isLoading,
}: PropertyPanelProps) {
  return (
    <div className="flex h-full w-[420px] flex-shrink-0 flex-col border-l border-[#E5E5E5] bg-white">
      <div className="flex flex-col gap-2 border-b border-[#E5E5E5] px-6 pb-4 pt-5">
        <h2 className="text-base font-bold text-[#1A1A1A]">
          物件一覧
        </h2>
        <p className="font-mono text-[11px] font-semibold tracking-widest text-[#888888]">
          {hasArea ? `選択エリア内: ${count}件` : "地図上でエリアを囲んでください"}
        </p>
        <FilterTabs current={filter} onChange={onFilterChange} />
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[#888888]">
            検索中...
          </div>
        ) : properties.length === 0 && hasArea ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[#888888]">
            該当する物件がありません
          </div>
        ) : (
          properties.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              isSelected={selectedId === p.id}
              onClick={() => onSelectProperty(p.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
