"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Property } from "@/lib/types";

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const AREA_STYLE: L.PathOptions = {
  color: "#0D6E6E",
  weight: 2.5,
  fillColor: "#0D6E6E",
  fillOpacity: 0.1,
  lineJoin: "round",
  lineCap: "round",
};

const DRAW_LINE_STYLE: L.PolylineOptions = {
  color: "#0D6E6E",
  weight: 2.5,
  dashArray: "5, 5",
};

type ToolType = "lasso" | "hand" | "zoom";

interface MapViewProps {
  properties: Property[];
  filteredIds: Set<string>;
  selectedId: string | null;
  onAreaCreated: (latlngs: [number, number][]) => void;
  onMarkerClick: (id: string) => void;
}

function createMarkerIcon(active: boolean): L.DivIcon {
  const color = active ? "#0D6E6E" : "#AAAAAA";
  return L.divIcon({
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);opacity:${active ? 1 : 0.4}"></div>`,
  });
}

export default function MapView({
  properties,
  filteredIds,
  selectedId,
  onAreaCreated,
  onMarkerClick,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const drawingRef = useRef(false);
  const pointsRef = useRef<L.LatLng[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>("lasso");

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [35.6812, 139.7671],
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle tool changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (activeTool === "lasso") {
      map.dragging.disable();
    } else {
      map.dragging.enable();
    }
  }, [activeTool]);

  // Drawing handlers
  const handleMouseDown = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (activeTool !== "lasso") return;
      const map = mapRef.current;
      if (!map) return;

      drawingRef.current = true;
      pointsRef.current = [e.latlng];

      // Remove previous area
      if (polygonRef.current) {
        map.removeLayer(polygonRef.current);
        polygonRef.current = null;
      }

      // Start drawing line
      polylineRef.current = L.polyline([e.latlng], DRAW_LINE_STYLE).addTo(map);
    },
    [activeTool]
  );

  const handleMouseMove = useCallback((e: L.LeafletMouseEvent) => {
    if (!drawingRef.current || !polylineRef.current) return;

    const lastPoint = pointsRef.current[pointsRef.current.length - 1];
    const dist = e.latlng.distanceTo(lastPoint);
    if (dist < 30) return; // Throttle: skip if less than 30m apart

    pointsRef.current.push(e.latlng);
    polylineRef.current.addLatLng(e.latlng);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!drawingRef.current) return;
    const map = mapRef.current;
    if (!map) return;

    drawingRef.current = false;

    // Remove drawing line
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const points = pointsRef.current;
    if (points.length < 3) return;

    // Create polygon
    polygonRef.current = L.polygon(points, AREA_STYLE).addTo(map);

    // Notify parent
    const latlngs: [number, number][] = points.map((p) => [p.lat, p.lng]);
    onAreaCreated(latlngs);
  }, [onAreaCreated]);

  // Attach map events
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.on("mousedown", handleMouseDown);
    map.on("mousemove", handleMouseMove);
    map.on("mouseup", handleMouseUp);

    return () => {
      map.off("mousedown", handleMouseDown);
      map.off("mousemove", handleMouseMove);
      map.off("mouseup", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    properties.forEach((p) => {
      const active = filteredIds.has(p.id);
      const marker = L.marker([p.lat, p.lng], {
        icon: createMarkerIcon(active),
        zIndexOffset: active ? 1000 : 0,
      })
        .addTo(map)
        .on("click", () => onMarkerClick(p.id));

      markersRef.current.push(marker);
    });
  }, [properties, filteredIds, selectedId, onMarkerClick]);

  const tools: { type: ToolType; icon: string; label: string }[] = [
    { type: "lasso", icon: "M15 2c-1.35 0-2.7.53-3.72 1.57L4.01 10.84c-1.35 1.35-1.82 3.32-1.24 5.14l.71 2.17c.31.93 1.06 1.63 2 1.87l2.17.57c1.82.48 3.72-.05 4.99-1.32l7.27-7.27c2.04-2.04 2.04-5.4 0-7.44A5.23 5.23 0 0 0 15 2Z", label: "投げ縄" },
    { type: "hand", icon: "M18 11V6.83a3 3 0 0 0-.68-.56L12 2 6.68 6.27A3 3 0 0 0 6 6.83V11M6 11v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7M6 11h12", label: "移動" },
    { type: "zoom", icon: "M21 21l-4.3-4.3M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM11 8v6M8 11h6", label: "ズーム" },
  ];

  return (
    <div className="relative flex-1">
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Custom toolbar */}
      <div className="absolute left-5 top-5 z-[1000] flex flex-col overflow-hidden rounded-lg bg-white shadow-md">
        {tools.map((tool) => (
          <button
            key={tool.type}
            onClick={() => setActiveTool(tool.type)}
            title={tool.label}
            className={`flex h-10 w-10 items-center justify-center transition-colors ${
              activeTool === tool.type
                ? "bg-[#0D6E6E15]"
                : "hover:bg-gray-100"
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={
                activeTool === tool.type ? "#0D6E6E" : "#666666"
              }
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={tool.icon} />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
