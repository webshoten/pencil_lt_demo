export type PriceType = "sale" | "rent";
export type FilterType = "all" | "sale" | "rent";

export interface Property {
  id: string;
  title: string;
  price: number;
  priceType: PriceType;
  area: number;
  age: number;
  walkMinutes: number;
  station: string;
  layout: string;
  buildingType: string;
  thumbnailUrl: string;
  lat: number;
  lng: number;
}
