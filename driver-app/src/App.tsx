import React, { useState, useEffect, useRef } from 'react';
import { Truck, Navigation, CheckCircle2, Play, ShieldCheck, MapPin, Gauge, Radio, Coffee, AlertTriangle, Upload, FileCheck, LayoutDashboard, Smartphone } from 'lucide-react';
import { tripService } from './services/api';
import { RouteMap } from './components/RouteMap';
import { ControlTower } from './components/ControlTower';
import type { ContainerTrip, TripSummary } from './types/trip';

const BR277_REFINED_ROUTE = [
  { lat: -25.5050, lng: -48.5120, speed: 35 },
  { lat: -25.5180, lng: -48.5350, speed: 55 },
  { lat: -25.5340, lng: -48.5680, speed: 68 },
  { lat: -25.5490, lng: -48.6120, speed: 72 },
  { lat: -25.5680, lng: -48.6650, speed: 65 },
  { lat: -25.5780, lng: -48.7180, speed: 58 },
  { lat: -25.5890, lng: -48.7850, speed: 50 },
  { lat: -25.5620, lng: -48.8410, speed: 52 },
  { lat: -25.5280, lng: -48.9100, speed: 64 },
  { lat: -25.4950, lng: -49.0150, speed: 78 },
  { lat: -25.4710, lng: -49.1200, speed: 82 },
  { lat: -25.4510, lng: -49.2150, speed: 70 },
  { lat: -25.4380, lng: -49.2700, speed: 45 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'driver' | 'tower'>('driver');
  const [token, setToken] = useState<string | null>(localStorage.getItem('fleetpulse_token'));
  const [activeTrip, setActiveTrip] = useState<ContainerTrip | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<TripSummary | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({ lat: -25.5050, lng: -48.5120 });
  const [trail, setTrail] = useState<[number, number][]>([[-25.5050, -48.5120]]);
  const [pingsSent, setPingsSent] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [proofUploaded, setProofUploaded] = useState(false);

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
      alert('Erro ao conectar na API FleetPulse (8081).');
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
    if (token) loadDriverTrip();
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
    if (isSimulating && activeTrip && activeTrip.tripStatus === 'IN_TRANSIT' && !isResting) {
      timer = setInterval(async () => {
        const point = BR277_REFINED_ROUTE[simIndexRef.current % BR277_REFINED_ROUTE.length];
        simIndexRef.current += 1;

        try {
          await tripService.sendTelemetry(activeTrip.id, {
            latitude: point.lat,
            longitude: point.lng,
            speedKmH: point.speed
          });

          setCurrentSpeed(point.speed);
          setCurrentCoords({ lat: point.lat, lng: point.lng });
          setTrail(prev => [...prev, [point.lat, point.lng]]);
          setPingsSent(prev => prev + 1);
        } catch (err) {
          console.error('Erro na transmissão:', err);
        }
      }, 3000);
    }

    return () => clearInterval(timer);
  }, [isSimulating, activeTrip, isResting]);

  const handleToggleRest = () => {
    setIsResting(!isResting);
    if (!isResting) {
      setCurrentSpeed(0);
      setStatusMessage('Pausa de descanso registrada (Lei 13.103)');
    } else {
      setStatusMessage('Retomando condução');
    }
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSOSAlert = () => {
    alert('ALERTA SOS DISPARADO: Posição de emergência transmitida à central aduaneira.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-3 sm:p-4">
      {/* Barra de Navegação Superior */}
      <header className="w-full max-w-6xl flex items-center justify-between py-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 font-black">
            FP
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none">FleetPulse</h1>
            <p className="text-xs text-slate-400 mt-0.5">Terminal Portuário & Rodoviário</p>
          </div>
        </div>

        {/* Seletor de Perfil */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('driver')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'driver' ? 'bg-emerald-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone size={14} />
            Motorista
          </button>
          <button
            onClick={() => setActiveTab('tower')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'tower' ? 'bg-blue-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard size={14} />
            Torre de Controle
          </button>
        </div>
      </header>

      {/* Conteúdo Renderizado por Perfil */}
      <main className="w-full max-w-6xl mt-6 flex-1 flex flex-col items-center">
        {activeTab === 'tower' ? (
          <ControlTower />
        ) : (
          <div className="w-full max-w-md flex flex-col space-y-4">
            {!token ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-xl my-auto">
                <div className="w-16 h-16 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-400 mb-4">
                  <Truck size={32} />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Acesso do Motorista</h2>
                <p className="text-sm text-slate-400 mb-6">Entre para visualizar a ordem de transporte e navegar em tempo real.</p>
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {loading ? 'Conectando...' : 'Acessar Terminal de Bordo'}
                </button>
              </div>
            ) : activeTrip ? (
              <>
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-slate-400">ORDEM #{activeTrip.id}</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                      activeTrip.tripStatus === 'IN_TRANSIT'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : activeTrip.tripStatus === 'DELIVERED'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {activeTrip.tripStatus === 'IN_TRANSIT' ? 'Em Viagem' : activeTrip.tripStatus === 'DELIVERED' ? 'Entregue' : 'Agendada'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[11px] text-slate-500 uppercase font-semibold">Contêiner ISO</span>
                        <p className="text-base font-mono font-bold text-white">{activeTrip.containerNumber}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 uppercase font-semibold">Lacre Aduaneiro</span>
                        <p className="text-xs font-mono text-emerald-400 flex items-center gap-1 justify-end font-semibold">
                          <ShieldCheck size={14} />
                          {activeTrip.sealNumber}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs space-y-1 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin size={14} className="text-emerald-400 shrink-0" />
                        <span className="truncate">{activeTrip.originLocation}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Navigation size={14} className="text-blue-400 shrink-0" />
                        <span className="truncate">{activeTrip.destinationLocation}</span>
                      </div>
                    </div>
                  </div>

                  {activeTrip.tripStatus === 'SCHEDULED' && (
                    <button
                      onClick={handleStartTrip}
                      className="w-full mt-4 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition font-bold text-slate-950 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <Play size={18} fill="currentColor" />
                      Iniciar Transporte
                    </button>
                  )}
                </div>

                {activeTrip.tripStatus === 'IN_TRANSIT' && (
                  <div className="space-y-3">
                    <RouteMap currentPos={currentCoords} trail={trail} />

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                          <Radio size={14} className="animate-pulse" />
                          GPS Transmitindo
                        </span>
                        <span className="font-mono text-slate-400">Pings: {pingsSent}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
                          <Gauge size={18} className="mx-auto text-amber-400 mb-0.5" />
                          <span className="text-2xl font-black font-mono text-white">{currentSpeed}</span>
                          <span className="text-[10px] text-slate-500 uppercase block">km/h</span>
                        </div>

                        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-col justify-center text-center">
                          <span className="text-[11px] text-slate-500 block mb-0.5">Posição Atual</span>
                          <span className="text-xs font-mono text-emerald-400 font-semibold truncate">
                            {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
                          </span>
                        </div>
                      </div>

                      {statusMessage && (
                        <div className="text-xs text-amber-400 text-center py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                          {statusMessage}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={handleToggleRest}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                            isResting ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          <Coffee size={14} />
                          {isResting ? 'Retomar Rota' : 'Pausa Descanso'}
                        </button>

                        <button
                          onClick={handleSOSAlert}
                          className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center gap-1.5 transition"
                        >
                          <AlertTriangle size={14} />
                          Alerta SOS
                        </button>
                      </div>

                      <button
                        onClick={() => setIsSimulating(!isSimulating)}
                        className={`w-full py-2.5 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 border ${
                          isSimulating ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        }`}
                      >
                        <Navigation size={14} />
                        {isSimulating ? 'Pausar Simulação de Rodovia' : 'Ativar Condução Automática (BR-277)'}
                      </button>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300">Finalização de Entrega</h4>

                      <label className="border-2 border-dashed border-slate-800 hover:border-slate-700 p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200 transition">
                        <input type="file" accept="image/*" className="hidden" onChange={() => setProofUploaded(true)} />
                        {proofUploaded ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                            <FileCheck size={16} /> Comprovante/Canhoto Anexado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Upload size={16} /> Anexar Canhoto de Entrega (Foto)
                          </span>
                        )}
                      </label>

                      <button
                        onClick={handleCompleteTrip}
                        className="w-full py-3 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] transition font-bold text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 text-sm"
                      >
                        <CheckCircle2 size={18} />
                        Confirmar Entrega no Destino
                      </button>
                    </div>
                  </div>
                )}

                {summary && (
                  <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 size={20} />
                      <h3 className="font-bold text-sm">Viagem Entregue e Auditada!</h3>
                    </div>
                    <p className="text-xs text-slate-400">Métricas consolidadas via Haversine no PostgreSQL:</p>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase">Distância</span>
                        <span className="text-base font-bold text-white font-mono">{summary.totalDistanceKm} km</span>
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase">Vel. Média</span>
                        <span className="text-base font-bold text-white font-mono">{summary.averageSpeedKmH} km/h</span>
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase">Vel. Máx</span>
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
                <p className="text-xs text-slate-400">Todas as ordens de transporte atribuídas foram concluídas.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}