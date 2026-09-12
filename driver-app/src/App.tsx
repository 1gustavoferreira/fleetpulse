import React, { useState, useEffect } from 'react';
import { Truck, ShieldCheck, RefreshCw, LayoutDashboard, LogIn, LogOut, User, Navigation, ArrowRight, CheckCircle2, Play, AlertCircle, MapPin, Box } from 'lucide-react';
import { tripService } from './services/api';
import { DispatchBoard } from './components/DispatchBoard';

export function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState<{ id: number; name: string; email: string; role: string } | null>(() => {
    const saved = localStorage.getItem('fleetpulse_driver_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'driver' | 'dispatch'>('driver');
  const [email, setEmail] = useState('carlos@fleetpulse.com');
  const [password, setPassword] = useState('123456');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [driverTrips, setDriverTrips] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [loadingTrip, setLoadingTrip] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = authenticatedUser?.role === 'ROLE_ADMIN';

  const fetchDriverTrips = async (driverId: number) => {
    setLoadingTrip(true);
    try {
      const trips = await tripService.getActiveTrips(driverId);
      const activeList = (trips || []).filter((t: any) => t.tripStatus !== 'DELIVERED');
      setDriverTrips(activeList);
      if (activeList.length > 0) {
        setSelectedTripId(prev => (activeList.some((t: any) => t.id === prev) ? prev : activeList[0].id));
      } else {
        setSelectedTripId(null);
      }
    } catch (err) {
      console.error(err);
      setDriverTrips([]);
      setSelectedTripId(null);
    } finally {
      setLoadingTrip(false);
    }
  };

  useEffect(() => {
    if (authenticatedUser) {
      if (authenticatedUser.role === 'ROLE_ADMIN') {
        setActiveTab('dispatch');
      } else {
        setActiveTab('driver');
        fetchDriverTrips(authenticatedUser.id);
      }
    }
  }, [authenticatedUser]);

  const handleLogin = async (loginEmail?: string, loginPass?: string) => {
    const targetEmail = (loginEmail || email).trim().toLowerCase();
    const targetPass = (loginPass || password).trim();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await tripService.login(targetEmail, targetPass);
      const token = res.token || res;
      localStorage.setItem('fleetpulse_token', token);

      let driverId = 1;
      let driverName = res.name || 'Carlos Eduardo Silva';
      let userRole = res.role || 'ROLE_DRIVER';

      if (targetEmail.includes('admin')) {
        driverId = 0;
        userRole = 'ROLE_ADMIN';
      } else if (targetEmail.includes('marcos')) {
        driverId = 2;
        driverName = 'Marcos Silveira';
      } else if (targetEmail.includes('roberto')) {
        driverId = 3;
        driverName = 'Roberto Santana';
      }

      const userData = { id: driverId, name: driverName, email: targetEmail, role: userRole };
      localStorage.setItem('fleetpulse_driver_user', JSON.stringify(userData));
      setAuthenticatedUser(userData);
    } catch (err: any) {
      setLoginError('Credenciais inválidas. Verifique os dados informados.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fleetpulse_driver_user');
    setAuthenticatedUser(null);
    setDriverTrips([]);
    setSelectedTripId(null);
  };

  const handleStartTrip = async (tripId: number) => {
    setActionLoading(true);
    try {
      await tripService.startTrip(tripId);
      if (authenticatedUser) fetchDriverTrips(authenticatedUser.id);
    } catch (err: any) {
      alert('Erro ao iniciar viagem: ' + (err?.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTrip = async (tripId: number) => {
    setActionLoading(true);
    try {
      await tripService.completeTrip(tripId);
      if (authenticatedUser) fetchDriverTrips(authenticatedUser.id);
    } catch (err: any) {
      alert('Erro ao finalizar entrega: ' + (err?.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const currentTrip = driverTrips.find(t => t.id === selectedTripId) || driverTrips[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-3 sm:p-6 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="w-full max-w-4xl flex items-center justify-between py-3 px-4 mb-6 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
            <Truck size={20} />
          </div>
          <div>
            <span className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
              FleetPulse
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                DRIVE
              </span>
            </span>
          </div>
        </div>

        {authenticatedUser && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-200">{authenticatedUser.name.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="text-slate-500 hover:text-rose-400 pl-1.5 ml-1.5 border-l border-slate-800 transition"
                title="Sair"
              >
                <LogOut size={13} />
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('dispatch')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-1.5"
              >
                <LayoutDashboard size={14} />
                Despacho
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl flex flex-col items-center">
        {!authenticatedUser ? (
          /* Login Card */
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto mb-3">
                <LogIn size={22} />
              </div>
              <h2 className="text-lg font-bold text-white">Terminal do Motorista</h2>
              <p className="text-xs text-slate-400">Identifique-se para acessar suas ordens</p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center">
                {loginError}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-3">
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                required
              />
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition font-bold text-slate-950 text-xs rounded-xl shadow-lg shadow-emerald-500/20"
              >
                {loginLoading ? 'Conectando...' : 'Acessar Terminal'}
              </button>
            </form>

            <div className="border-t border-slate-800/80 pt-4 space-y-2">
              <button
                onClick={() => { setEmail('admin@fleetpulse.com'); setPassword('admin123'); handleLogin('admin@fleetpulse.com', 'admin123'); }}
                className="w-full p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <LayoutDashboard size={14} />
                Central de Despacho (Admin)
              </button>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => { setEmail('carlos@fleetpulse.com'); setPassword('123456'); handleLogin('carlos@fleetpulse.com', '123456'); }}
                  className="py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition"
                >
                  Carlos
                </button>
                <button
                  onClick={() => { setEmail('marcos@fleetpulse.com'); setPassword('123456'); handleLogin('marcos@fleetpulse.com', '123456'); }}
                  className="py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition"
                >
                  Marcos
                </button>
                <button
                  onClick={() => { setEmail('roberto@fleetpulse.com'); setPassword('123456'); handleLogin('roberto@fleetpulse.com', '123456'); }}
                  className="py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition"
                >
                  Roberto
                </button>
              </div>
            </div>
          </div>
        ) : isAdmin ? (
          <DispatchBoard onTripCreated={() => {}} activeTrip={null} />
        ) : (
          /* Driver Dashboard */
          <div className="w-full max-w-xl space-y-5">
            {loadingTrip ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-2">
                <RefreshCw size={24} className="animate-spin text-emerald-400" />
                <span className="text-xs">Sincronizando com a central...</span>
              </div>
            ) : driverTrips.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
                <ShieldCheck size={44} className="mx-auto text-emerald-400/80" />
                <h3 className="text-base font-bold text-white">Sem Cargas Pendentes</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Você concluiu todos os transportes atribuídos. Permaneça em prontidão no pátio aguardando novo despacho.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Carrossel de Cargas Atribuídas */}
                {driverTrips.length > 1 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Fila de Transporte ({driverTrips.length})
                      </span>
                    </div>
                    <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                      {driverTrips.map((t) => {
                        const isSelected = t.id === currentTrip.id;
                        const inTransit = t.tripStatus === 'IN_TRANSIT';
                        return (
                          <button
                            key={t.id}
                            onClick={() => setSelectedTripId(t.id)}
                            className={`flex flex-col text-left p-3 rounded-2xl border transition shrink-0 w-44 ${
                              isSelected
                                ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                                : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="text-[10px] font-mono text-slate-400">#{t.id}</span>
                              <span className={`w-2 h-2 rounded-full ${inTransit ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
                            </div>
                            <span className="text-xs font-mono font-bold text-white truncate">{t.containerNumber}</span>
                            <span className="text-[10px] text-slate-400 truncate mt-0.5">{t.destinationLocation}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Card Detalhado da Carga Ativa */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider block">Manifesto de Transporte</span>
                      <h2 className="text-xl font-bold text-white font-mono">Ordem #{currentTrip.id}</h2>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      currentTrip.tripStatus === 'IN_TRANSIT'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {currentTrip.tripStatus === 'IN_TRANSIT' ? 'Na Estrada' : 'Liberado para Partida'}
                    </span>
                  </div>

                  {/* Informações da Carga */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                      <span className="text-[10px] uppercase text-slate-500 font-semibold block">Contêiner ISO</span>
                      <span className="text-sm font-mono font-bold text-emerald-400 block truncate">{currentTrip.containerNumber}</span>
                      <span className="text-[11px] text-slate-400 font-mono">Lacre: {currentTrip.sealNumber}</span>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                      <span className="text-[10px] uppercase text-slate-500 font-semibold block">Especificação</span>
                      <span className="text-sm font-bold text-white block">40ft HC Standard</span>
                      <span className="text-[11px] text-slate-400 font-mono">{currentTrip.grossWeightKg || 27500} kg PBT</span>
                    </div>
                  </div>

                  {/* Rota */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0"></div>
                      <div className="overflow-hidden">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Origem</span>
                        <p className="text-xs text-slate-200 truncate">{currentTrip.originLocation}</p>
                      </div>
                    </div>

                    <div className="border-l-2 border-dashed border-slate-800 ml-1 h-3"></div>

                    <div className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-400 mt-1 shrink-0"></div>
                      <div className="overflow-hidden">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Destino</span>
                        <p className="text-xs text-slate-200 truncate">{currentTrip.destinationLocation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Ação */}
                  <div className="pt-2">
                    {currentTrip.tripStatus === 'SCHEDULED' ? (
                      <button
                        onClick={() => handleStartTrip(currentTrip.id)}
                        disabled={actionLoading}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition font-black text-slate-950 text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"
                      >
                        <Play size={18} fill="currentColor" />
                        {actionLoading ? 'Gravando Início...' : 'Iniciar Viagem'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCompleteTrip(currentTrip.id)}
                        disabled={actionLoading}
                        className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] transition font-black text-white text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20"
                      >
                        <CheckCircle2 size={18} />
                        {actionLoading ? 'Finalizando...' : 'Confirmar Entrega & Baixar'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;