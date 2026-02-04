'use client';

import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const defaultPosition: [number, number] = [37.779, -122.419];

L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString(),
});

export function MapPanel() {
  return (
    <div className="h-[380px] overflow-hidden rounded-lg border border-border">
      <MapContainer
        center={defaultPosition}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        className="bg-surface"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={defaultPosition}>
          <Popup>Primary site · San Francisco</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
