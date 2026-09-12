import React, { useState } from 'react';
import { Truck, MapPin, CheckCircle2, Play, Upload, ShieldCheck, AlertCircle } from 'lucide-react';
import { tripService } from '../services/api';

interface TripLifecycleProps {
  trip: any;
  onStatusUpdated: () => void;
}

export const TripLifecycle: React.FC<TripLifecycleProps> = ({ trip, onStatusUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartTrip = async () => {
    setLoading(true);
    setError(null);
    try {
      await tripService.startTrip(trip.id);
      onStatusUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Falha ao iniciar viagem');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTrip = async () => {
    setLoading(true);
    setError(null);
    try {
      await tripService.completeTrip(trip.id);
      onStatusUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Falha ao concluir entrega');
    } finally {
      setLoading(false);
    }
  };

  const isScheduled = trip.tripStatus === 'SCHEDULED';
  const isInTransit = trip.tripStatus === 'IN_TRANSIT';

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-slate-500 block">Identificador do Frete</span>
          <h2 className="text-lg font-bold text-white">Ordem de Carga #{trip.id}</h2>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
          isInTransit
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            : isScheduled
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
        }`}>
          {isInTransit ? 'Na Estrada' : isScheduled ? 'Pronto para Partida' : 'Entregue'}
        </span>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Detalhes da Carga */}
      <div className="space-y-3">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Contêiner ISO:</span>
            <span className="text-sm font-mono font-bold text-emerald-400">{trip.containerNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Lacre Fiscal:</span>
            <span className="text-xs font-mono text-slate-200">{trip.sealNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Peso Bruto:</span>
            <span className="text-xs text-slate-200">{trip.grossWeightKg || 27500} kg</span>
          </div>
        </div>

        {/* Rota */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin size={16} className="text-emerald-400 mt-0.5" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Origem</span>
              <p className="text-xs text-slate-200">{trip.originLocation}</p>
            </div>
          </div>
          <div className="border-l-2 border-slate-800 ml-2 h-4"></div>
          <div className="flex items-start gap-3">
            <MapPin size={16} className="text-blue-400 mt-0.5" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Destino Final</span>
              <p className="text-xs text-slate-200">{trip.destinationLocation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação do Ciclo de Vida */}
      <div className="pt-2">
        {isScheduled && (
          <button
            onClick={handleStartTrip}
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition font-bold text-slate-950 text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Play size={16} />
            {loading ? 'Iniciando...' : 'Iniciar Viagem Rodoviária'}
          </button>
        )}

        {isInTransit && (
          <button
            onClick={handleCompleteTrip}
            disabled={loading}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 active:scale-95 transition font-bold text-white text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <CheckCircle2 size={16} />
            {loading ? 'Finalizando...' : 'Confirmar Entrega & Baixar Frete'}
          </button>
        )}
      </div>
    </div>
  );
};