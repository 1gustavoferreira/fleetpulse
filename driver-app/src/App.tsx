import React, { useState, useEffect } from 'react';
import { Truck, Navigation, CheckCircle2, Play, ShieldCheck, MapPin, Coffee, Upload, FileCheck, LayoutDashboard, Smartphone, ExternalLink } from 'lucide-react';
import { tripService } from './services/api';
import { DispatchBoard } from './components/DispatchBoard';
import type { ContainerTrip, TripSummary } from './types/trip';

export default function App() {
  const [activeTab, setActiveTab] = useState<'driver' | 'dispatch'>('driver');
  const [token, setToken] = useState<string | null>(localStorage.getItem('fleetpulse_token'));
  const [activeTrip, setActiveTrip] = useState<ContainerTrip | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<TripSummary | null>(null);
  const [isResting, setIsResting] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);

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
    try {
      const updated = await tripService.completeTrip(activeTrip.id);
      const summaryData = await tripService.getSummary(activeTrip.id);
      setSummary(summaryData);
      setActiveTrip(updated);
    } catch (err) {
      alert('Falha ao finalizar viagem');
    }
  };

  const openNavigation = () => {
    if (!activeTrip) return;
    const destEncoded = encodeURIComponent(activeTrip.destinationLocation);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destEncoded}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-3 sm:p-5">
      {/* Barra de Navegação Corporativa */}
      <header className="w-full max-w-5xl flex items-center justify-between py-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 font-black">
            FP
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none">FleetPulse</h1>
            <p className="text-xs text-slate-400 mt-0.5">Gestão de Fretes e Motoristas</p>
          </div>
        </div>

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
            onClick={() => setActiveTab('dispatch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'dispatch' ? 'bg-blue-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard size={14} />
            Mesa de Despacho
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="w-full max-w-5xl mt-6 flex-1 flex flex-col items-center">
        {activeTab === 'dispatch' ? (
          <DispatchBoard onTripCreated={loadDriverTrip} activeTrip={activeTrip} />
        ) : (
          <div className="w-full max-w-md flex flex-col space-y-4">
            {!token ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-xl my-auto">
                <div className="w-14 h-14 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-400 mb-4">
                  <Truck size={28} />
                </div>
                <h2 className="text-lg font-bold text-white mb-1">Acesso do Motorista</h2>
                <p className="text-xs text-slate-400 mb-5">Conecte-se para visualizar a ordem de carregamento atribuída.</p>
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20"
                >
                  {loading ? 'Conectando...' : 'Entrar no Terminal'}
                </button>
              </div>
            ) : activeTrip ? (
              <div className="space-y-4">
                {/* Identificação do Motorista & Cavalo */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 uppercase font-semibold block">Motorista Escalado</span>
                    <p className="text-sm font-bold text-white">Carlos Eduardo</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold block">Caminhão</span>
                    <p className="text-sm font-mono font-bold text-emerald-400">ABC-1D23</p>
                  </div>
                </div>

                {/* Card da Carga / Ordem */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">ORDEM #{activeTrip.id}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                      activeTrip.tripStatus === 'IN_TRANSIT'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : activeTrip.tripStatus === 'DELIVERED'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {activeTrip.tripStatus === 'IN_TRANSIT' ? 'Em Viagem' : activeTrip.tripStatus === 'DELIVERED' ? 'Entregue' : 'Aguardando Início'}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Contêiner</span>
                        <p className="text-base font-mono font-bold text-white">{activeTrip.containerNumber}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Lacre Fiscal</span>
                        <p className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 justify-end">
                          <ShieldCheck size={14} />
                          {activeTrip.sealNumber}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-xs space-y-1.5">
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

                  {/* Ações da Ordem */}
                  {activeTrip.tripStatus === 'SCHEDULED' && (
                    <button
                      onClick={handleStartTrip}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition font-bold text-slate-950 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm"
                    >
                      <Play size={16} fill="currentColor" />
                      Iniciar Viagem
                    </button>
                  )}

                  {activeTrip.tripStatus === 'IN_TRANSIT' && (
                    <div className="space-y-3 pt-1">
                      {/* Abrir Rota Real */}
                      <button
                        onClick={openNavigation}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 transition font-bold text-white rounded-xl flex items-center justify-center gap-2 text-xs"
                      >
                        <ExternalLink size={15} />
                        Traçar Rota no Google Maps / GPS
                      </button>

                      <button
                        onClick={() => setIsResting(!isResting)}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                          isResting ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <Coffee size={14} />
                        {isResting ? 'Retomar Condução' : 'Registrar Pausa de Descanso (Posto)'}
                      </button>

                      {/* Finalização com Anexo */}
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <label className="border border-dashed border-slate-700 hover:border-slate-600 p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs text-slate-400 transition">
                          <input type="file" accept="image/*" className="hidden" onChange={() => setProofUploaded(true)} />
                          {proofUploaded ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                              <FileCheck size={16} /> Canhoto Anexado com Sucesso
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Upload size={16} /> Foto do Canhoto Assinado
                            </span>
                          )}
                        </label>

                        <button
                          onClick={handleCompleteTrip}
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition font-bold text-slate-950 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-xs"
                        >
                          <CheckCircle2 size={16} />
                          Confirmar Entrega no Destino
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resumo Auditado da Entrega */}
                {summary && (
                  <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 shadow-xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 size={18} />
                      <h3 className="font-bold text-xs">Viagem Finalizada e Registrada!</h3>
                    </div>
                    <p className="text-[11px] text-slate-400">Canhoto arquivado e frete liberado para faturamento.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl my-auto">
                <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-2" />
                <h2 className="text-base font-bold text-white mb-1">Sem Frete no Momento</h2>
                <p className="text-xs text-slate-400">Aguardando nova ordem de carga da central de despacho.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}