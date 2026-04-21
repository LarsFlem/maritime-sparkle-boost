import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapTurbine {
  id: string;
  name: string;
  status: "operational" | "warning" | "offline";
  energyOutput: number;
  // geo position
  lat: number;
  lng: number;
}

interface OceanMapProps {
  turbines: MapTurbine[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  getStatusColor: (status: MapTurbine["status"]) => string;
}

// North Sea sector — fictional Sector 7G near Norway
const CENTER: [number, number] = [58.7, 2.3];

const FlyToSelected = ({ turbine }: { turbine: MapTurbine | undefined }) => {
  const map = useMap();
  useEffect(() => {
    if (turbine) map.flyTo([turbine.lat, turbine.lng], 7, { duration: 1.2 });
  }, [turbine, map]);
  return null;
};

const OceanMap = ({ turbines, selectedId, onSelect, getStatusColor }: OceanMapProps) => {
  const selected = useMemo(
    () => turbines.find((t) => t.id === selectedId),
    [turbines, selectedId]
  );

  return (
    <div className="relative w-full h-72 rounded-md overflow-hidden border border-border/40 hmi-map">
      <MapContainer
        center={CENTER}
        zoom={6}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        style={{ width: "100%", height: "100%", background: "hsl(var(--background))" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {turbines.map((t) => {
          const color = getStatusColor(t.status);
          const isSelected = t.id === selectedId;
          const radius = isSelected ? 11 : 8;
          return (
            <CircleMarker
              key={t.id}
              center={[t.lat, t.lng]}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: isSelected ? 0.85 : 0.55,
                weight: isSelected ? 2.5 : 1.5,
              }}
              eventHandlers={{ click: () => onSelect(t.id) }}
            >
              <LeafletTooltip
                direction="top"
                offset={[0, -8]}
                opacity={1}
                className="hmi-leaflet-tooltip"
              >
                <span className="font-mono text-[10px] uppercase tracking-wider">
                  {t.id} · {t.name}
                  <br />
                  {t.energyOutput.toFixed(1)} MW
                </span>
              </LeafletTooltip>
            </CircleMarker>
          );
        })}
        <FlyToSelected turbine={selected} />
      </MapContainer>
      {/* Coordinate overlay */}
      <div className="pointer-events-none absolute bottom-2 left-2 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground bg-background/60 px-2 py-1 rounded border border-border/40">
        N {CENTER[0].toFixed(2)}° · E {CENTER[1].toFixed(2)}° · Sector 7G
      </div>
    </div>
  );
};

export default OceanMap;
