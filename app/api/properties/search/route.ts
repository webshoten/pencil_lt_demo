import { NextRequest, NextResponse } from "next/server";
import { mockProperties } from "@/lib/mockData";
import { isPointInArea } from "@/lib/geo";
import { FilterType } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { area, filter }: { area: [number, number][]; filter: FilterType } =
    body;

  let properties = mockProperties;

  if (area && area.length > 2) {
    properties = properties.filter((p) =>
      isPointInArea([p.lat, p.lng], area)
    );
  }

  if (filter && filter !== "all") {
    properties = properties.filter((p) => p.priceType === filter);
  }

  return NextResponse.json({
    properties,
    count: properties.length,
  });
}
