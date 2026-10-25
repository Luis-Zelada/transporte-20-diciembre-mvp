import React, { useEffect, useState } from 'react';
import api from './api';

function Hacienda() {
  const [pagos, setPagos] = useState([]);
  const [internos, setInternos] = useState([]);
  
  // Estados del formulario
  const [concepto, setConcepto] = useState('Mensualidad');
  const [monto, setMonto] = useState('');
  const [tipoMovimiento, setTipoMovimiento] = useState('Ingreso');
  const [idInterno, setIdInterno] = useState('');

  useEffect(() => {
    fetchHaciendaData();
  }, []);

  const fetchHaciendaData = async () => {
    try {
      const [resPagos, resInternos] = await Promise.all([
        api.get('/api/v1/pagos'),
        api.get('/api/v1/internos')
      ]);
      setPagos(resPagos.data);
      setInternos(resInternos.data);
    } catch (err) {
      console.error('Error al cargar datos de hacienda:', err);
    }
  };

  // Cálculo automático del resumen financiero basado en los pagos registrados
  const totalIngresos = pagos
    .filter(p => p.tipo_movimiento === 'Ingreso')
    .reduce((acc, curr) => acc + parseFloat(curr.monto || 0), 0);

  const totalEgresos = pagos
    .filter(p => p.tipo_movimiento === 'Egreso')
    .reduce((acc, curr) => acc + parseFloat(curr.monto || 0), 0);

  const saldoActual = totalIngresos - totalEgresos;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      id_interno: idInterno ? parseInt(idInterno) : null,
      id_usuario: 1, 
      concepto,
      monto: parseFloat(monto),
      tipo_movimiento: tipoMovimiento
    };

    api.post('/api/v1/pagos', payload)
      .then(() => {
        setMonto('');
        setIdInterno('');
        fetchHaciendaData();
      })
      .catch((err) => {
        console.error('Error al registrar:', err);
        alert('Error al registrar la transacción.');
      });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Secretaría de Hacienda - Control de Caja</h2>

      {/* Tarjetas de Resumen Financiero Calculadas en Vivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
          <p className="text-sm font-medium text-green-600">Total Ingresos</p>
          <p className="text-2xl font-bold text-green-800">${totalIngresos.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
          <p className="text-sm font-medium text-red-600">Total Egresos</p>
          <p className="text-2xl font-bold text-red-800">${totalEgresos.toFixed(2)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
          <p className="text-sm font-medium text-blue-600">Saldo Actual en Caja</p>
          <p className="text-2xl font-bold text-blue-800">${saldoActual.toFixed(2)}</p>
        </div>
      </div>

      {/* Formulario de Registro */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Registrar Transacción</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimiento</label>
            <select value={tipoMovimiento} onChange={(e) => setTipoMovimiento(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-white">
              <option value="Ingreso">Ingreso</option>
              <option value="Egreso">Egreso</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
            <select value={concepto} onChange={(e) => setConcepto(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-white">
              <option value="Mensualidad">Mensualidad</option>
              <option value="Multa">Multa</option>
              <option value="Cuota">Cuota</option>
              <option value="Egreso General">Egreso General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
            <input type="number" step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} required className="w-full border rounded-lg px-3 py-2 bg-white" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asociado (Opcional)</label>
            <select value={idInterno} onChange={(e) => setIdInterno(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-white">
              <option value="">Ninguno / General</option>
              {internos.map(i => (
                <option key={i.id_interno} value={i.id_interno}>{i.nombre} {i.apellido}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-colors cursor-pointer">
          Registrar Transacción
        </button>
      </form>

      {/* Historial de Movimientos */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Historial de Caja</h3>
        <div className="space-y-2">
          {pagos.map((p) => (
            <div key={p.id_pago} className="p-3 border rounded-lg flex justify-between items-center bg-white">
              <div>
                <span className={`font-bold px-2 py-1 rounded text-xs mr-2 ${p.tipo_movimiento === 'Ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {p.tipo_movimiento}
                </span>
                <span className="font-semibold text-gray-800">{p.concepto}</span>
              </div>
              <span className={`font-bold text-lg ${p.tipo_movimiento === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                {p.tipo_movimiento === 'Ingreso' ? '+' : '-'}${p.monto}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Hacienda;