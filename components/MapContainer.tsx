"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Property, FilterType } from "@/lib/types";
import { mockProperties } from "@/lib/mockData";
import PropertyPanel from "./PropertyPanel";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function MapContainer() {
  const [selectedArea, setSelectedArea] = useState<[number, number][] | null>(
    null
  );
  const [filter, setFilter] = useState<FilterType>("all");
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const searchProperties = useCallback(
    async (area: [number, number][] | null, currentFilter: FilterType) => {
      if (!area) {
        setFilteredProperties([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch("/api/properties/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ area, filter: currentFilter }),
        });
        const data = await res.json();
        setFilteredProperties(data.properties);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    searchProperties(selectedArea, filter);
  }, [selectedArea, filter, searchProperties]);

  const handleAreaCreated = useCallback((latlngs: [number, number][]) => {
    setSelectedArea(latlngs);
  }, []);

  const handleMarkerClick = useCallback((id: string) => {
    setSelectedId(id);
    const el = document.getElementById(`property-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const filteredIds = new Set(filteredProperties.map((p) => p.id));

  return (
    <div className="flex flex-1 overflow-hidden">
      <MapView
        properties={mockProperties}
        filteredIds={filteredIds}
        selectedId={selectedId}
        onAreaCreated={handleAreaCreated}
        onMarkerClick={handleMarkerClick}
      />
      <PropertyPanel
        properties={filteredProperties}
        count={filteredProperties.length}
        filter={filter}
        onFilterChange={setFilter}
        selectedId={selectedId}
        onSelectProperty={handleMarkerClick}
        hasArea={selectedArea !== null}
        isLoading={isLoading}
      />
    </div>
  );
}
