import React, { Suspense, lazy, useEffect, useState } from 'react';
import api from './api';

const Visor3D = lazy(() => import('./Visor3D'));

function Internos() {
  const [internos, setInternos] = useState([]);
  const [lineas, setLineas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el formulario de Interno
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [ci, setCi] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoInterno, setTipoInterno] = useState('Socio');
  const [idLinea, setIdLinea] = useState('');

  // Estado para controlar qué interno está agregando un motorizado en ese momento
  const [selectedInternoId, setSelectedInternoId] = useState(null);
  const [tipoMotorizado, setTipoMotorizado] = useState('Motocicleta');
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [color, setColor] = useState('');
  const [modelo, setModelo] = useState('');

  // Motorizado que se está inspeccionando en el visor 3D
  const [motorizadoEnVisor, setMotorizadoEnVisor] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resInternos, resLineas] = await Promise.all([
        api.get('/api/v1/internos'), // <-- Agregado /api/v1/
        api.get('/api/v1/lineas')    // <-- Agregado /api/v1/
      ]);
      setInternos(resInternos.data);
      setLineas(resLineas.data);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('No se pudieron cargar los datos del servidor.');
      setLoading(false);
    }
  };

  const handleCrearInterno = (e) => {
    e.preventDefault();
    const payload = {
      nombre,
      apellido,
      ci,
      telefono,
      tipo_interno: tipoInterno,
      id_linea: idLinea ? parseInt(idLinea) : null
    };

    api.post('/internos', payload)
      .then(() => {
        setNombre('');
        setApellido('');
        setCi('');
        setTelefono('');
        setTipoInterno('Socio');
        setIdLinea('');
        fetchData();
      })
      .catch((err) => {
        console.error('Error al registrar interno:', err);
        alert(err.response?.data?.detail || 'Error al registrar el interno.');
      });
  };

  const handleEliminarInterno = (id) => {
    if (window.confirm('¿Deseas eliminar este interno y sus vehículos asociados?')) {
      api.delete(`/internos/${id}`)
        .then(() => fetchData())
        .catch((err) => alert('No se pudo eliminar el interno.'));
    }
  };

  const handleCrearMotorizado = (e, id_interno) => {
    e.preventDefault();
    const payload = {
      tipo_motorizado: tipoMotorizado,
      placa,
      marca,
      color,
      modelo
    };

    // ✅ Corregido con el prefijo /api/v1/
api.post(`/api/v1/motorizados?id_interno=${id_interno}`, payload)
      .then(() => {
        setPlaca('');
        setMarca('');
        setColor('');
        setModelo('');
        setSelectedInternoId(null);
        fetchData();
      })
      .catch((err) => {
        console.error('Error al registrar motorizado:', err);
        alert(err.response?.data?.detail || 'Error al registrar el motorizado.');
      });
  };

  const handleEliminarMotorizado = (id_motorizado) => {
    if (window.confirm('¿Deseas dar de baja este motorizado?')) {
      api.delete(`/motorizados/${id_motorizado}`)
        .then(() => fetchData())
        .catch((err) => alert('No se pudo eliminar el motorizado.'));
    }
  };

  return (
    <div className="panel space-y-6">
      <h2 className="text-2xl font-bold text-white">Gestión de Socios e Inquilinos (Internos)</h2>

      {/* Formulario Registro de Interno */}
      <form onSubmit={handleCrearInterno} className="subpanel space-y-4">
        <h3 className="text-lg font-semibold text-white">Registrar Nuevo Interno</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Nombre</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="form-input" />
          </div>
          <div>
            <label className="form-label">Apellido</label>
            <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} required className="form-input" />
          </div>
          <div>
            <label className="form-label">Cédula de Identidad (CI)</label>
            <input type="text" value={ci} onChange={(e) => setCi(e.target.value)} required className="form-input" />
          </div>
          <div>
            <label className="form-label">Teléfono</label>
            <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="form-input" />
          </div>
          <div>
            <label className="form-label">Tipo de Interno</label>
            <select value={tipoInterno} onChange={(e) => setTipoInterno(e.target.value)} className="form-input">
              <option value="Socio">Socio</option>
              <option value="Inquilino">Inquilino</option>
            </select>
          </div>
          <div>
            <label className="form-label">Línea Asignada</label>
            <select value={idLinea} onChange={(e) => setIdLinea(e.target.value)} className="form-input">
              <option value="">Seleccione una línea</option>
              {lineas.map((l) => (
                <option key={l.id_linea} value={l.id_linea}>Línea N° {l.numero_linea}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Guardar Interno
        </button>
      </form>

      {/* Listado de Internos */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Lista de Internos Registrados</h3>
        {loading && <p className="text-white/70">Cargando internos...</p>}
        {error && <p className="alert-error">{error}</p>}
        
        {!loading && internos.length === 0 && (
          <p className="text-white/60">No hay internos registrados todavía.</p>
        )}

        <div className="space-y-4">
          {internos.map((interno) => {
            const lineaAsignada = lineas.find(l => l.id_linea === interno.id_linea);
            return (
              <div key={interno.id_interno} className="row-card rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-white">
                      {interno.nombre} {interno.apellido} 
                      <span className="badge badge-brand ml-2">
                        {interno.tipo_interno}
                      </span>
                    </h4>
                    <p className="text-sm text-white/70">CI: {interno.ci} | Teléfono: {interno.telefono || 'N/D'}</p>
                    <p className="text-sm font-medium text-white/80 mt-1">
                      Línea: {lineaAsignada ? `N° ${lineaAsignada.numero_linea}` : 'Sin línea asignada'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEliminarInterno(interno.id_interno)}
                    className="btn btn-sm btn-danger"
                  >
                    Eliminar
                  </button>
                </div>

                {/* Sección de Vehículos / Motorizados */}
                <div className="border-t border-white/10 pt-3 mt-3">
                  <h5 className="text-sm font-semibold text-white/80 mb-2">Vehículo / Motorizado Asignado:</h5>
                  {interno.motorizados && interno.motorizados.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {interno.motorizados.map((m) => (
                        <div key={m.id_motorizado} className="bg-ink-muted p-3 rounded-lg border border-white/10 flex justify-between items-center text-sm">
                          <div>
                            <span className="font-bold text-white">{m.tipo_motorizado}</span> - Placa: <span className="font-semibold text-brand-light">{m.placa}</span>
                            <p className="text-xs text-white/60">{m.marca} {m.modelo} ({m.color})</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setMotorizadoEnVisor(m)}
                              className="btn btn-xs btn-light"
                            >
                              Ver 3D
                            </button>
                            <button
                              onClick={() => handleEliminarMotorizado(m.id_motorizado)}
                              className="text-brand-light hover:text-white text-xs font-medium px-2 py-1 cursor-pointer"
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/60 mb-3">No tiene un motorizado registrado aún.</p>
                  )}

                  {/* Formulario rápido para agregar motorizado a este interno */}
                  {selectedInternoId === interno.id_interno ? (
                    <form onSubmit={(e) => handleCrearMotorizado(e, interno.id_interno)} className="bg-ink-muted p-3 rounded-lg border border-brand space-y-3 mt-2">
                      <h6 className="text-sm font-semibold text-white">Registrar Motorizado</h6>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <select value={tipoMotorizado} onChange={(e) => setTipoMotorizado(e.target.value)} className="form-input form-input-sm">
                          <option value="Motocicleta">Motocicleta</option>
                          <option value="Torito">Torito</option>
                          <option value="Motocar">Motocar</option>
                        </select>
                        <input type="text" placeholder="Placa (ej. 4501-XYZ)" value={placa} onChange={(e) => setPlaca(e.target.value)} required className="form-input form-input-sm" />
                        <input type="text" placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} required className="form-input form-input-sm" />
                        <input type="text" placeholder="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} required className="form-input form-input-sm" />
                        <input type="text" placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} required className="form-input form-input-sm" />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="btn btn-xs btn-primary">Guardar Vehículo</button>
                        <button type="button" onClick={() => setSelectedInternoId(null)} className="btn btn-xs btn-outline">Cancelar</button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setSelectedInternoId(interno.id_interno)}
                      className="btn btn-xs btn-light"
                    >
                      + Añadir Motorizado
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {motorizadoEnVisor && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Visor 3D del motorizado"
          onClick={(e) => e.target === e.currentTarget && setMotorizadoEnVisor(null)}
        >
          <div className="w-full max-w-3xl max-h-full overflow-y-auto">
            <Suspense fallback={<div className="panel text-white/70">Cargando visor 3D...</div>}>
              <Visor3D
                tipo={motorizadoEnVisor.tipo_motorizado}
                color={motorizadoEnVisor.color}
                titulo={`${motorizadoEnVisor.tipo_motorizado} - Placa ${motorizadoEnVisor.placa}`}
                onClose={() => setMotorizadoEnVisor(null)}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}

export default Internos;