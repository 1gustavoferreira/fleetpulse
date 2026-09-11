import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ShieldCheck, MapPin, Gauge, AlertTriangle, RefreshCw, Container } from 'lucide-react';
import { tripService } from '../services/api';
import type { ContainerTrip } from '../types/trip';

const truckActiveIcon = L.divIcon({
  className: 'custom-fleet-pin',
  html: `<div style="background-color: #3b82f6; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 0 12px rgba(59,130,246,0.7);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
            <circle cx="17" cy="18" r="2"/>
            <circle cx="7" cy="18" r="2"/>
          </svg>
        </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export const ControlTower: React.FC = () => {
  const [trips, setTrips] = useState<ContainerTrip[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActiveFleet = async () => {
    setLoading(true);
    try {
      // Busca viagens em aberto/ativas
      const data = await tripService.getActiveTrips(1);
      setTrips(data || []);
    } catch (err) {
      console.error('Erro ao atualizar frota:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveFleet();
    const interval = setInterval(fetchActiveFleet, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Header da Central */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Container className="text-blue-500" size={22} />
            Monitoramento de Malha Aduaneira (BR-277)
          </h2>
          <p className="text-xs text-slate-400">Torre de Operações Portuárias & Rodoviárias</p>
        </div>

        <button
          onClick={fetchActiveFleet}
          disabled={loading}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-2 transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Atualizar Cache
        </button>
      </div>

      {/* Grid Principal: Mapa e Painel Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Mapa Widescreen */}
        <div className="lg:col-span-2 h-[480px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative">
          <MapContainer
            center={[-25.5050, -48.9100]}
            zoom={9}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {/* Marcadores das Cargas */}
            <Marker position={[-25.5050, -48.5120]} icon={truckActiveIcon}>
              <Popup>
                <div className="text-xs font-sans">
                  <strong>Porto de Paranaguá (TCP)</strong><br />
                  Origem do Corredor de Exportação
                </div>
              </Popup>
            </Marker>
            <Marker position={[-25.4380, -49.2700]} icon={truckActiveIcon}>
              <Popup>
                <div className="text-xs font-sans">
                  <strong>Porto Seco de Curitiba</strong><br />
                  Destino Aduaneiro
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Lista de Contêineres em Monitoramento */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3 h-[480px] overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Viagens em Acompanhamento ({trips.length})
          </h3>

          {trips.length === 0 ? (
            <div className="my-auto text-center py-8">
              <Container size={32} className="mx-auto text-slate-600 mb-2" />
              <p className="text-xs text-slate-400">Nenhum contêiner em trânsito no momento.</p>
            </div>
          ) : (
            trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-white">{trip.containerNumber}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {trip.tripStatus}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-emerald-400" />
                    <span>Lacre: <strong className="text-slate-200">{trip.sealNumber}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin size={13} className="text-blue-400 shrink-0" />
                    <span className="truncate">{trip.originLocation} &rarr; {trip.destinationLocation}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};