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
    <div className="panel space-y-6">
      <h2 className="text-2xl font-bold text-white">Secretaría de Hacienda - Control de Caja</h2>

      {/* Tarjetas de Resumen Financiero Calculadas en Vivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl">
          <p className="text-sm font-medium text-ink/60">Total Ingresos</p>
          <p className="text-2xl font-bold text-ink">${totalIngresos.toFixed(2)}</p>
        </div>
        <div className="bg-brand p-4 rounded-xl">
          <p className="text-sm font-medium text-white/80">Total Egresos</p>
          <p className="text-2xl font-bold text-white">${totalEgresos.toFixed(2)}</p>
        </div>
        <div className="bg-ink-soft border border-white/10 p-4 rounded-xl">
          <p className="text-sm font-medium text-white/70">Saldo Actual en Caja</p>
          <p className="text-2xl font-bold text-white">${saldoActual.toFixed(2)}</p>
        </div>
      </div>

      {/* Formulario de Registro */}
      <form onSubmit={handleSubmit} className="subpanel space-y-4">
        <h3 className="text-lg font-semibold text-white">Registrar Transacción</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Tipo de Movimiento</label>
            <select value={tipoMovimiento} onChange={(e) => setTipoMovimiento(e.target.value)} className="form-input">
              <option value="Ingreso">Ingreso</option>
              <option value="Egreso">Egreso</option>
            </select>
          </div>
          <div>
            <label className="form-label">Concepto</label>
            <select value={concepto} onChange={(e) => setConcepto(e.target.value)} className="form-input">
              <option value="Mensualidad">Mensualidad</option>
              <option value="Multa">Multa</option>
              <option value="Cuota">Cuota</option>
              <option value="Egreso General">Egreso General</option>
            </select>
          </div>
          <div>
            <label className="form-label">Monto ($)</label>
            <input type="number" step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} required className="form-input" placeholder="0.00" />
          </div>
          <div>
            <label className="form-label">Asociado (Opcional)</label>
            <select value={idInterno} onChange={(e) => setIdInterno(e.target.value)} className="form-input">
              <option value="">Ninguno / General</option>
              {internos.map(i => (
                <option key={i.id_interno} value={i.id_interno}>{i.nombre} {i.apellido}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Registrar Transacción
        </button>
      </form>

      {/* Historial de Movimientos */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-3">Historial de Caja</h3>
        <div className="space-y-2">
          {pagos.map((p) => (
            <div key={p.id_pago} className="row-card p-3 flex justify-between items-center">
              <div>
                <span className={`badge mr-2 ${p.tipo_movimiento === 'Ingreso' ? 'badge-light' : 'badge-brand'}`}>
                  {p.tipo_movimiento}
                </span>
                <span className="font-semibold text-white">{p.concepto}</span>
              </div>
              <span className={`font-bold text-lg ${p.tipo_movimiento === 'Ingreso' ? 'text-white' : 'text-brand-light'}`}>
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