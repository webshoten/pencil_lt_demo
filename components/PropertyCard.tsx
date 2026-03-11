import { Property } from "@/lib/types";

function formatPrice(price: number, priceType: string): string {
  if (priceType === "rent") {
    return `¥${price.toLocaleString()}/月`;
  }
  return `¥${price.toLocaleString()}`;
}

interface PropertyCardProps {
  property: Property;
  isSelected: boolean;
  onClick: () => void;
}

export default function PropertyCard({
  property,
  isSelected,
  onClick,
}: PropertyCardProps) {
  return (
    <div
      id={`property-${property.id}`}
      onClick={onClick}
      className={`flex h-[120px] cursor-pointer overflow-hidden rounded-[10px] border transition-colors ${
        isSelected
          ? "border-[#0D6E6E]"
          : "border-[#E5E5E5] hover:border-[#0D6E6E]"
      } bg-white`}
    >
      <div className="h-full w-[120px] flex-shrink-0">
        <img
          src={property.thumbnailUrl}
          alt={property.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1.5 p-3">
        <span className="font-mono text-base font-bold text-[#0D6E6E]">
          {formatPrice(property.price, property.priceType)}
        </span>
        <span className="text-[13px] font-semibold text-[#1A1A1A]">
          {property.title}
        </span>
        <div className="flex gap-3 text-[11px] text-[#888888]">
          <span className="font-mono">{property.area}㎡</span>
          <span>築{property.age}年</span>
          <span>駅徒歩{property.walkMinutes}分</span>
        </div>
        <span
          className={`w-fit rounded px-2 py-0.5 text-[10px] font-semibold ${
            property.priceType === "sale"
              ? "bg-[#E07B5420] text-[#E07B54]"
              : "bg-[#0D6E6E15] text-[#0D6E6E]"
          }`}
        >
          {property.priceType === "sale" ? "売買" : "賃貸"}
        </span>
      </div>
    </div>
  );
}
