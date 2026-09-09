import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { Truck, Navigation, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import type { ContainerTrip, TelemetryData } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('@fleetpulse:token'));
  const [email, setEmail] = useState('admin@fleetpulse.com');
  const [password, setPassword] = useState('Admin@123456');
  const [trips, setTrips] = useState<ContainerTrip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<ContainerTrip | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [containerNumber, setContainerNumber] = useState('');
  const [sealNumber, setSealNumber] = useState('');
  const [containerType, setContainerType] = useState('DRY_40');
  const [grossWeightKg, setGrossWeightKg] = useState(24000);
  const [origin, setOrigin] = useState('Porto de Paranaguá - Pátio B');
  const [destination, setDestination] = useState('CD Logístico Curitiba');

  useEffect(() => {
    if (token) {
      loadTrips();
    }
  }, [token]);

  useEffect(() => {
    if (selectedTrip && selectedTrip.tripStatus === 'IN_TRANSIT') {
      loadTelemetry(selectedTrip.id);
      const interval = setInterval(() => loadTelemetry(selectedTrip.id), 5000);
      return () => clearInterval(interval);
    } else {
      setTelemetry(null);
    }
  }, [selectedTrip]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await api.post('/auth/login', { email, password });
      const jwt = res.data.token;
      localStorage.setItem('@fleetpulse:token', jwt);
      setToken(jwt);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Falha na autenticação.');
    }
  };

  const loadTrips = async () => {
    try {
      const res = await api.get<ContainerTrip[]>('/trips');
      setTrips(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTelemetry = async (tripId: number) => {
    try {
      const res = await api.get<TelemetryData>(`/trips/${tripId}/telemetry/latest`);
      setTelemetry(res.data);
    } catch {
      setTelemetry(null);
    }
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await api.post('/trips', {
        containerNumber,
        sealNumber,
        containerType,
        grossWeightKg,
        originLocation: origin,
        destinationLocation: destination,
        truckId: 1,
        driverId: 1,
      });
      setContainerNumber('');
      setSealNumber('');
      loadTrips();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Erro ao criar ordem de transporte.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrip = async (id: number) => {
    try {
      await api.patch(`/trips/${id}/start`);
      loadTrips();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao iniciar viagem.');
    }
  };

  const handleCompleteTrip = async (id: number) => {
    try {
      await api.patch(`/trips/${id}/complete`);
      loadTrips();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao finalizar viagem.');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="w-8 h-8 text-sky-400" />
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">FleetPulse Ops</h1>
          </div>
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-800 rounded text-red-300 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {errorMsg}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">E-mail Corporativo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Senha de Acesso</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-sky-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" /> Entrar no Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Truck className="w-7 h-7 text-sky-400" />
          <span className="text-xl font-bold tracking-tight">FleetPulse Logistics</span>
          <span className="text-xs bg-sky-950 border border-sky-800 text-sky-400 px-2 py-0.5 rounded-full">API Conectada</span>
        </div>
        <button
          onClick={() => { localStorage.removeItem('@fleetpulse:token'); setToken(null); }}
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          Encerrar Sessão
        </button>
      </header>

      <main className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" /> Nova Ordem de Transporte Portuário
            </h2>
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-800 rounded text-red-300 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {errorMsg}
              </div>
            )}
            <form onSubmit={handleCreateTrip} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nº Contêiner (ISO 6346)</label>
                <input
                  type="text"
                  placeholder="Ex: CSQU3054383"
                  value={containerNumber}
                  onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:border-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Lacre Alfandegário</label>
                <input
                  type="text"
                  placeholder="Ex: SEAL-BR-12345"
                  value={sealNumber}
                  onChange={(e) => setSealNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Tipo de Contêiner</label>
                <select
                  value={containerType}
                  onChange={(e) => setContainerType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sky-500"
                >
                  <option value="DRY_20">DRY 20'</option>
                  <option value="DRY_40">DRY 40'</option>
                  <option value="REEFER_40">REEFER 40'</option>
                  <option value="OPEN_TOP_40">OPEN TOP 40'</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Peso Bruto (Kg)</label>
                <input
                  type="number"
                  value={grossWeightKg}
                  onChange={(e) => setGrossWeightKg(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Origem</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Destino</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sky-500"
                  required
                />
              </div>
              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
                >
                  {loading ? 'Validando e Despachando...' : 'Cadastrar Viagem'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-slate-200">Monitoramento da Frota</h2>
              <button onClick={loadTrips} className="p-1.5 text-slate-400 hover:text-slate-200">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">ID / Contêiner</th>
                    <th className="pb-3">Rota</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {trips.map((trip) => (
                    <tr
                      key={trip.id}
                      onClick={() => setSelectedTrip(trip)}
                      className={`cursor-pointer transition-colors ${
                        selectedTrip?.id === trip.id ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 font-mono">
                        <span className="text-sky-400 font-bold">#{trip.id}</span> {trip.containerNumber}
                        <div className="text-[11px] text-slate-400 font-sans">{trip.sealNumber}</div>
                      </td>
                      <td className="py-3">
                        <div>{trip.originLocation}</div>
                        <div className="text-slate-400 text-[11px]">→ {trip.destinationLocation}</div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            trip.tripStatus === 'SCHEDULED'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : trip.tripStatus === 'IN_TRANSIT'
                              ? 'bg-sky-950 text-sky-300 border border-sky-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {trip.tripStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        {trip.tripStatus === 'SCHEDULED' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStartTrip(trip.id); }}
                            className="bg-sky-600 hover:bg-sky-500 text-white px-2.5 py-1 rounded text-xs"
                          >
                            Iniciar
                          </button>
                        )}
                        {trip.tripStatus === 'IN_TRANSIT' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCompleteTrip(trip.id); }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-xs"
                          >
                            Concluir
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {trips.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-500">
                        Nenhuma viagem cadastrada no cluster.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-sky-400" /> Telemetria em Cache (Redis)
            </h2>
            {selectedTrip ? (
              <div className="space-y-4">
                <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/40">
                  <div className="text-xs text-slate-400">Contêiner Selecionado</div>
                  <div className="text-lg font-mono font-bold text-sky-400">{selectedTrip.containerNumber}</div>
                  <div className="text-xs text-slate-400 mt-1">Status: <span className="text-slate-200 font-medium">{selectedTrip.tripStatus}</span></div>
                </div>

                {telemetry ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                        <div className="text-[11px] text-slate-400 uppercase">Velocidade</div>
                        <div className="text-xl font-bold text-emerald-400 font-mono">{telemetry.speedKmH} <span className="text-xs">km/h</span></div>
                      </div>
                      <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                        <div className="text-[11px] text-slate-400 uppercase">Cache TTL</div>
                        <div className="text-xl font-bold text-sky-400 font-mono">{telemetry.ttlSeconds}s</div>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg text-xs space-y-1 font-mono">
                      <div><span className="text-slate-400">Lat:</span> {telemetry.latitude}</div>
                      <div><span className="text-slate-400">Long:</span> {telemetry.longitude}</div>
                      <div className="text-[10px] text-slate-500 font-sans pt-1">Última transmissão: {new Date(telemetry.recordedAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950/30 border border-slate-800 border-dashed rounded-lg text-center text-xs text-slate-500">
                    Nenhum sinal de GPS recente no cache para esta viagem.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 border border-slate-800 border-dashed rounded-lg">
                Selecione uma viagem na tabela para visualizar as coordenadas de satélite em cache.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}