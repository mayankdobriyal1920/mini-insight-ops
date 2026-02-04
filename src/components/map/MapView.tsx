'use client';

import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { InsightEvent } from '@/types/insight';
import { SeverityBadge } from '../ui/severity-badge';

type Props = {
  events: InsightEvent[];
  loading: boolean;
  selectedId: string | null | undefined;
  onSelect: (event: InsightEvent) => void;
  filtersKey: string;
};

L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString(),
});

export default function MapView({ events, loading, selectedId, onSelect, filtersKey }: Props) {
  const bounds = useMemo(() => {
    if (!events.length) return null;
    const latLngs = events.map((e) => [e.location.lat, e.location.lng]) as [number, number][];
    return L.latLngBounds(latLngs);
  }, [events]);

  return (
    <div className="relative flex-1">
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        center={[20.5937, 78.9629]}
        zoom={4}
        scrollWheelZoom
        className="bg-surface"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds bounds={bounds} filtersKey={filtersKey} />
        {events.map((event) => (
          <Marker
            key={event.id}
            position={[event.location.lat, event.location.lng]}
            icon={makeIcon(event.severity, event.id === selectedId)}
            eventHandlers={{
              click: () => onSelect(event),
            }}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <div className="font-semibold text-foreground">{event.title}</div>
                <SeverityBadge severity={event.severity} />
                <div className="text-xs text-muted">Score {event.metrics.score}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/30 text-sm text-muted">
          Loading events…
        </div>
      )}
      {!loading && events.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
          No events match these filters.
        </div>
      )}
    </div>
  );
}

function FitBounds({ bounds, filtersKey }: { bounds: L.LatLngBounds | null; filtersKey: string }) {
  const map = useMap();
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    if (!bounds) return;
    if (lastKey.current === filtersKey) return;
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    lastKey.current = filtersKey;
  }, [bounds, filtersKey, map]);

  return null;
}

function makeIcon(severity: InsightEvent['severity'], active: boolean) {
  const colors: Record<InsightEvent['severity'], string> = {
    High: '#f97316',
    Medium: '#facc15',
    Low: '#22c55e',
  };

  return L.divIcon({
    html: `<div style="
      width:${active ? 18 : 14}px;
      height:${active ? 18 : 14}px;
      border-radius:50%;
      border:2px solid ${active ? '#22d3ee' : '#0f172a'};
      background:${colors[severity]};
      box-shadow:0 0 8px rgba(0,0,0,0.35);
    "></div>`,
    className: '',
  });
}
