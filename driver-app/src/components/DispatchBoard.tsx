import React, { useState } from 'react';
import { Truck, User, Plus, CheckCircle, Clock } from 'lucide-react';
import { tripService } from '../services/api';

interface DispatchProps {
  onTripCreated: () => void;
  activeTrip: any;
}

export const DispatchBoard: React.FC<DispatchProps> = ({ onTripCreated, activeTrip }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [driverName, setDriverName] = useState('Carlos Eduardo');
  const [truckPlate, setTruckPlate] = useState('ABC-1D23');
  const [containerNumber, setContainerNumber] = useState('CSQU3054383');
  const [sealNumber, setSealNumber] = useState('BR-PR-882200');
  const [origin, setOrigin] = useState('Porto de Paranagua (TCP)');
  const [destination, setDestination] = useState('Porto Seco de Curitiba');

  // O motorista só está "Em Viagem" se a carga estiver ativa e não concluída
  const isDriverBusy = activeTrip && activeTrip.tripStatus !== 'DELIVERED';

  const drivers = [
    { id: 1, name: 'Carlos Eduardo', truck: 'Scania R450 (ABC-1D23)', status: isDriverBusy ? 'Em Viagem' : 'Livre no Pátio' },
    { id: 2, name: 'Marcos Silveira', truck: 'Volvo FH 540 (BRA-2E19)', status: 'Livre no Pátio' },
    { id: 3, name: 'Roberto Santana', truck: 'Actros 2651 (PR-8840)', status: 'Livre no Pátio' },
  ];

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let token = localStorage.getItem('fleetpulse_token');
      if (!token) {
        const authData = await tripService.login('admin@fleetpulse.com', 'admin123');
        token = authData.token || authData;
        localStorage.setItem('fleetpulse_token', token as string);
      }

      await tripService.createTrip({
        containerNumber: containerNumber.trim(),
        sealNumber: sealNumber.trim(),
        containerType: 'DRY_40',
        grossWeightKg: 27500,
        originLocation: origin,
        destinationLocation: destination,
        truckId: 1,
        driverId: 1,
      });

      setShowModal(false);
      onTripCreated();
    } catch (err: any) {
      try {
        const authData = await tripService.login('admin@fleetpulse.com', 'admin123');
        const newToken = authData.token || authData;
        localStorage.setItem('fleetpulse_token', newToken as string);

        await tripService.createTrip({
          containerNumber: containerNumber.trim(),
          sealNumber: sealNumber.trim(),
          containerType: 'DRY_40',
          grossWeightKg: 27500,
          originLocation: origin,
          destinationLocation: destination,
          truckId: 1,
          driverId: 1,
        });

        setShowModal(false);
        onTripCreated();
      } catch (retryErr) {
        alert('Falha ao despachar ordem. Verifique se o backend na porta 8081 está rodando.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Truck className="text-emerald-400" size={24} />
            Mesa de Despacho & Operações
          </h2>
          <p className="text-xs text-slate-400 mt-1">Escalação rápida de motoristas, veículos e contêineres.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition font-bold text-slate-950 text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <Plus size={16} />
          Nova Ordem de Transporte
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock size={14} className="text-amber-400" />
            Ordens de Carga em Andamento
          </h3>

          {activeTrip ? (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">ORDEM #{activeTrip.id}</span>
                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                  activeTrip.tripStatus === 'IN_TRANSIT'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : activeTrip.tripStatus === 'DELIVERED'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {activeTrip.tripStatus === 'IN_TRANSIT' ? 'Na Estrada' : activeTrip.tripStatus === 'DELIVERED' ? 'Entregue' : 'Aguardando Início'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Motorista & Cavalo</span>
                  <p className="text-sm font-bold text-white">Carlos Eduardo</p>
                  <span className="text-xs text-slate-400">ABC-1D23 (Scania)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Contêiner</span>
                  <p className="text-sm font-mono font-bold text-emerald-400">{activeTrip.containerNumber}</p>
                  <span className="text-xs text-slate-400">Lacre: {activeTrip.sealNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Corredor</span>
                  <p className="text-xs font-medium text-slate-300 truncate">{activeTrip.originLocation}</p>
                  <span className="text-[11px] text-blue-400 truncate block">&rarr; {activeTrip.destinationLocation}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <CheckCircle size={36} className="mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">Nenhuma viagem em trânsito no momento</p>
              <p className="text-xs text-slate-500 mt-1">Clique em "Nova Ordem de Transporte" para despachar um frete.</p>
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <User size={14} className="text-emerald-400" />
            Motoristas da Empresa
          </h3>

          <div className="space-y-2.5">
            {drivers.map((d) => (
              <div key={d.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{d.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    d.status === 'Em Viagem'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {d.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{d.truck}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Despachar Ordem de Frete</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-sm">Fechar</button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Motorista</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Caminhão / Placa</label>
                <input
                  type="text"
                  value={truckPlate}
                  onChange={(e) => setTruckPlate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Contêiner ISO</label>
                  <input
                    type="text"
                    value={containerNumber}
                    onChange={(e) => setContainerNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-emerald-400 focus:border-emerald-500 outline-none uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Lacre Fiscal</label>
                  <input
                    type="text"
                    value={sealNumber}
                    onChange={(e) => setSealNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Ponto de Origem</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Ponto de Destino</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 text-xs rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  {loading ? 'Salvando...' : 'Confirmar Despacho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};