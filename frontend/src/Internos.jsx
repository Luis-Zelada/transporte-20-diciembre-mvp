import React, { useEffect, useState } from 'react';
import api from './api';

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
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Gestión de Socios e Inquilinos (Internos)</h2>

      {/* Formulario Registro de Interno */}
      <form onSubmit={handleCrearInterno} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Registrar Nuevo Interno</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula de Identidad (CI)</label>
            <input type="text" value={ci} onChange={(e) => setCi(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Interno</label>
            <select value={tipoInterno} onChange={(e) => setTipoInterno(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <option value="Socio">Socio</option>
              <option value="Inquilino">Inquilino</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Línea Asignada</label>
            <select value={idLinea} onChange={(e) => setIdLinea(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <option value="">Seleccione una línea</option>
              {lineas.map((l) => (
                <option key={l.id_linea} value={l.id_linea}>Línea N° {l.numero_linea}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-colors">
          Guardar Interno
        </button>
      </form>

      {/* Listado de Internos */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Lista de Internos Registrados</h3>
        {loading && <p className="text-blue-500">Cargando internos...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {!loading && internos.length === 0 && (
          <p className="text-gray-500">No hay internos registrados todavía.</p>
        )}

        <div className="space-y-4">
          {internos.map((interno) => {
            const lineaAsignada = lineas.find(l => l.id_linea === interno.id_linea);
            return (
              <div key={interno.id_interno} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">
                      {interno.nombre} {interno.apellido} 
                      <span className="text-xs font-medium bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full ml-2">
                        {interno.tipo_interno}
                      </span>
                    </h4>
                    <p className="text-sm text-gray-600">CI: {interno.ci} | Teléfono: {interno.telefono || 'N/D'}</p>
                    <p className="text-sm font-medium text-gray-700 mt-1">
                      Línea: {lineaAsignada ? `N° ${lineaAsignada.numero_linea}` : 'Sin línea asignada'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEliminarInterno(interno.id_interno)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    Eliminar
                  </button>
                </div>

                {/* Sección de Vehículos / Motorizados */}
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Vehículo / Motorizado Asignado:</h5>
                  {interno.motorizados && interno.motorizados.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {interno.motorizados.map((m) => (
                        <div key={m.id_motorizado} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center text-sm">
                          <div>
                            <span className="font-bold text-gray-800">{m.tipo_motorizado}</span> - Placa: <span className="font-semibold text-blue-600">{m.placa}</span>
                            <p className="text-xs text-gray-500">{m.marca} {m.modelo} ({m.color})</p>
                          </div>
                          <button
                            onClick={() => handleEliminarMotorizado(m.id_motorizado)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1"
                          >
                            Quitar
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mb-3">No tiene un motorizado registrado aún.</p>
                  )}

                  {/* Formulario rápido para agregar motorizado a este interno */}
                  {selectedInternoId === interno.id_interno ? (
                    <form onSubmit={(e) => handleCrearMotorizado(e, interno.id_interno)} className="bg-blue-50/50 p-3 rounded-lg border border-blue-200 space-y-3 mt-2">
                      <h6 className="text-sm font-semibold text-blue-800">Registrar Motorizado</h6>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <select value={tipoMotorizado} onChange={(e) => setTipoMotorizado(e.target.value)} className="border rounded px-2 py-1 text-sm bg-white">
                          <option value="Motocicleta">Motocicleta</option>
                          <option value="Torito">Torito</option>
                          <option value="Motocar">Motocar</option>
                        </select>
                        <input type="text" placeholder="Placa (ej. 4501-XYZ)" value={placa} onChange={(e) => setPlaca(e.target.value)} required className="border rounded px-2 py-1 text-sm bg-white" />
                        <input type="text" placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} required className="border rounded px-2 py-1 text-sm bg-white" />
                        <input type="text" placeholder="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} required className="border rounded px-2 py-1 text-sm bg-white" />
                        <input type="text" placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} required className="border rounded px-2 py-1 text-sm bg-white" />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded font-medium">Guardar Vehículo</button>
                        <button type="button" onClick={() => setSelectedInternoId(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-700 text-xs px-3 py-1.5 rounded font-medium">Cancelar</button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setSelectedInternoId(interno.id_interno)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
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
    </div>
  );
}

export default Internos;