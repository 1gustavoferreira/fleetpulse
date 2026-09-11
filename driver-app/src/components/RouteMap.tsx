import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix padrão para os ícones padrão do Leaflet no bundler Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Ícone customizado de caminhão para o mapa
const truckIcon = L.divIcon({
  className: 'custom-truck-pin',
  html: `<div style="background-color: #22c55e; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 0 15px rgba(34,197,94,0.6);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#020617" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
            <circle cx="17" cy="18" r="2"/>
            <circle cx="7" cy="18" r="2"/>
          </svg>
        </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

interface RouteMapProps {
  currentPos: { lat: number; lng: number };
  trail: [number, number][];
}

function RecenterMap({ pos }: { pos: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([pos.lat, pos.lng], map.getZoom(), { animate: true });
  }, [pos, map]);
  return null;
}

export const RouteMap: React.FC<RouteMapProps> = ({ currentPos, trail }) => {
  return (
    <div className="w-full h-56 rounded-2xl overflow-hidden border border-slate-800 relative z-0 shadow-inner">
      <MapContainer
        center={[currentPos.lat, currentPos.lng]}
        zoom={11}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <RecenterMap pos={currentPos} />
        <Marker position={[currentPos.lat, currentPos.lng]} icon={truckIcon} />
        {trail.length > 1 && (
          <Polyline positions={trail} color="#2563eb" weight={5} opacity={0.8} />
        )}
      </MapContainer>
    </div>
  );
};