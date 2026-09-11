import React, { useState, useEffect, useRef } from 'react';
import { Truck, Navigation, CheckCircle2, Play, ShieldCheck, MapPin, Gauge, Radio } from 'lucide-react';
import { tripService } from './services/api';
import type { ContainerTrip, TripSummary } from './types/trip';

const BR277_SIMULATED_ROUTE = [
  { lat: -25.5050, lng: -48.5120, speed: 38 },
  { lat: -25.5230, lng: -48.5420, speed: 65 },
  { lat: -25.5510, lng: -48.5910, speed: 78 },
  { lat: -25.5680, lng: -48.6530, speed: 82 },
  { lat: -25.5820, lng: -48.7300, speed: 60 },
  { lat: -25.5410, lng: -48.8350, speed: 52 },
  { lat: -25.4850, lng: -49.0200, speed: 75 },
  { lat: -25.4520, lng: -49.1800, speed: 68 },
  { lat: -25.4380, lng: -49.2600, speed: 45 }
];

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('fleetpulse_token'));
  const [activeTrip, setActiveTrip] = useState<ContainerTrip | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<TripSummary | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pingsSent, setPingsSent] = useState(0);
  const simIndexRef = useRef(0);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await tripService.login('admin@fleetpulse.com', 'admin123');
      const receivedToken = data.token || data;
      localStorage.setItem('fleetpulse_token', receivedToken);
      setToken(receivedToken);
      loadDriverTrip();
    } catch (err) {
      alert('Erro ao conectar na API FleetPulse. Certifique-se que o backend esta rodando na porta 8081.');
    } finally {
      setLoading(false);
    }
  };

  const loadDriverTrip = async () => {
    try {
      const trips = await tripService.getActiveTrips(1);
      if (trips && trips.length > 0) {
        setActiveTrip(trips[0]);
      } else {
        setActiveTrip(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      loadDriverTrip();
    }
  }, [token]);

  const handleStartTrip = async () => {
    if (!activeTrip) return;
    try {
      const updated = await tripService.startTrip(activeTrip.id);
      setActiveTrip(updated);
    } catch (err) {
      alert('Falha ao iniciar viagem');
    }
  };

  const handleCompleteTrip = async () => {
    if (!activeTrip) return;
    setIsSimulating(false);
    try {
      const updated = await tripService.completeTrip(activeTrip.id);
      const summaryData = await tripService.getSummary(activeTrip.id);
      setSummary(summaryData);
      setActiveTrip(updated);
    } catch (err) {
      alert('Falha ao finalizar viagem');
    }
  };

  useEffect(() => {
    let timer: any;
    if (isSimulating && activeTrip && activeTrip.tripStatus === 'IN_TRANSIT') {
      timer = setInterval(async () => {
        const point = BR277_SIMULATED_ROUTE[simIndexRef.current % BR277_SIMULATED_ROUTE.length];
        simIndexRef.current += 1;

        try {
          await tripService.sendTelemetry(activeTrip.id, {
            latitude: point.lat,
            longitude: point.lng,
            speedKmH: point.speed
          });

          setCurrentSpeed(point.speed);
          setLastCoords({ lat: point.lat, lng: point.lng });
          setPingsSent(prev => prev + 1);
        } catch (err) {
          console.error('Erro ao enviar telemetria:', err);
        }
      }, 3500);
    }

    return () => clearInterval(timer);
  }, [isSimulating, activeTrip]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4">
      <header className="w-full max-w-md flex items-center justify-between py-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 font-black">
            FP
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">FleetPulse Driver</h1>
            <p className="text-xs text-slate-400 mt-0.5">Terminal Portuario & Rodoviario</p>
          </div>
        </div>

        {token && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
        )}
      </header>

      <main className="w-full max-w-md mt-6 flex-1 flex flex-col space-y-4">
        {!token ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-xl my-auto">
            <div className="w-16 h-16 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-400 mb-4">
              <Truck size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Acesso do Motorista</h2>
            <p className="text-sm text-slate-400 mb-6">Conecte-se para receber ordens de carga e iniciar o rastreamento aduaneiro.</p>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {loading ? 'Conectando a API...' : 'Entrar como Motorista 01'}
            </button>
          </div>
        ) : activeTrip ? (
          <>
            <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-slate-400">VIAGEM #{activeTrip.id}</span>
                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                  activeTrip.tripStatus === 'IN_TRANSIT'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : activeTrip.tripStatus === 'DELIVERED'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {activeTrip.tripStatus === 'IN_TRANSIT' ? 'Em Rota' : activeTrip.tripStatus === 'DELIVERED' ? 'Concluida' : 'Agendada'}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Conteiner ISO 6346</p>
                  <p className="text-lg font-mono font-bold text-white tracking-wider">{activeTrip.containerNumber}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block">Lacre Fiscal</span>
                    <span className="font-mono text-slate-300 font-semibold flex items-center gap-1 mt-0.5">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      {activeTrip.sealNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Peso Bruto</span>
                    <span className="text-slate-300 font-semibold mt-0.5 block">{activeTrip.grossWeightKg.toLocaleString('pt-BR')} kg</span>
                  </div>
                </div>

                <div className="text-xs space-y-2 pt-1">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-500 block">Origem</span>
                      <span className="text-slate-300">{activeTrip.originLocation}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Navigation size={16} className="text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-500 block">Destino</span>
                      <span className="text-slate-300">{activeTrip.destinationLocation}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex gap-2">
                {activeTrip.tripStatus === 'SCHEDULED' && (
                  <button
                    onClick={handleStartTrip}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition font-bold text-slate-950 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <Play size={18} fill="currentColor" />
                    Iniciar Transporte
                  </button>
                )}

                {activeTrip.tripStatus === 'IN_TRANSIT' && (
                  <button
                    onClick={handleCompleteTrip}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] transition font-bold text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    <CheckCircle2 size={18} />
                    Confirmar Entrega
                  </button>
                )}
              </div>
            </div>

            {activeTrip.tripStatus === 'IN_TRANSIT' && (
              <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <Radio size={16} className="text-amber-400 animate-pulse" />
                    Transmissao de Telemetria
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Pings: {pingsSent}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center">
                    <Gauge size={20} className="mx-auto text-amber-400 mb-1" />
                    <span className="text-3xl font-black font-mono text-white">{currentSpeed}</span>
                    <span className="text-xs text-slate-500 block uppercase">km/h</span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-center text-center">
                    <span className="text-xs text-slate-500 block mb-1">Ultimo Fix GPS</span>
                    {lastCoords ? (
                      <span className="text-xs font-mono text-emerald-400 font-semibold">
                        {lastCoords.lat.toFixed(4)}, {lastCoords.lng.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600 font-mono">Aguardando...</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`w-full py-3 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 border ${
                    isSimulating
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Navigation size={16} />
                  {isSimulating ? 'Pausar Simulacao BR-277' : 'Simular Rota BR-277 (Paranagua -> Curitiba)'}
                </button>
              </div>
            )}

            {summary && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 size={20} />
                  <h3 className="font-bold text-sm">Viagem Entregue com Sucesso!</h3>
                </div>
                <p className="text-xs text-slate-400">O cache Redis foi liberado e as metricas finais de Haversine foram auditadas no PostgreSQL:</p>
                
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 block">Distancia</span>
                    <span className="text-base font-bold text-white font-mono">{summary.totalDistanceKm} km</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 block">Vel. Media</span>
                    <span className="text-base font-bold text-white font-mono">{summary.averageSpeedKmH} km/h</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 block">Vel. Max</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">{summary.maxSpeedKmH} km/h</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl my-auto">
            <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-3" />
            <h2 className="text-lg font-bold text-white mb-1">Nenhuma Viagem Pendente</h2>
            <p className="text-xs text-slate-400">Todas as ordens de transporte para o motorista foram concluidas.</p>
          </div>
        )}
      </main>
    </div>
  );
}