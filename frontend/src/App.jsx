import React, { useEffect, useState } from 'react';
import api from './api';
import Login from './Login';
import Internos from './Internos';
import Hacienda from './Hacienda';
import Usuarios from './Usuarios'; // Componente de usuarios

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lineas, setLineas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtenemos el rol guardado en el login
  const rol = localStorage.getItem('rol'); // Ej: "Administrador", "Presidente", "Secretario de Hacienda"

  // Pestaña inicial por defecto según el rol estricto
  const [activeTab, setActiveTab] = useState(() => {
    if (rol === 'Administrador') return 'usuarios';
    if (rol === 'Presidente') return 'lineas';
    if (rol === 'Secretario de Hacienda') return 'hacienda';
    return 'lineas';
  });

  // Estados para el formulario de Líneas
  const [numeroLinea, setNumeroLinea] = useState('');
  const [estado, setEstado] = useState('Disponible');
  const [formError, setFormError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchLineas();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchLineas = () => {
    setLoading(true);
    api.get('/api/v1/lineas')
      .then((response) => {
        setLineas(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al conectar:', err);
        setLoading(false);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    setIsAuthenticated(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!numeroLinea) {
      setFormError('El número de línea es obligatorio.');
      return;
    }

    const payload = {
      numero_linea: parseInt(numeroLinea),
      estado: estado
    };

    if (editingId) {
      api.put(`/lineas/${editingId}`, payload)
        .then(() => {
          resetForm();
          fetchLineas();
        })
        .catch(() => setFormError('Error al actualizar la línea.'));
    } else {
      api.post('/api/v1/lineas', payload)
        .then(() => {
          resetForm();
          fetchLineas();
        })
        .catch(() => setFormError('Error al registrar la línea.'));
    }
  };

  const handleEditClick = (linea) => {
    setEditingId(linea.id_linea);
    setNumeroLinea(linea.numero_linea);
    setEstado(linea.estado);
  };

  const handleDelete = (id_linea) => {
    if (window.confirm('¿Estás seguro de eliminar esta línea?')) {
      api.delete(`/lineas/${id_linea}`)
        .then(() => fetchLineas())
        .catch(() => alert('No se pudo eliminar la línea.'));
    }
  };

  const resetForm = () => {
    setNumeroLinea('');
    setEstado('Disponible');
    setEditingId(null);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => { setIsAuthenticated(true); fetchLineas(); window.location.reload(); }} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Cabecera */}
        <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              Asociación de Transporte "20 de Diciembre"
            </h1>
            <p className="text-gray-600 text-sm">
              Conectado como: <span className="font-semibold text-blue-600 uppercase">{rol}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded-lg border border-red-200 transition-colors text-sm cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Barra de Pestañas Filtrada por Roles */}
        <div className="flex gap-2 border-b border-gray-300 pb-2 flex-wrap">
          
          {/* PRESIDENTE: Gestiona líneas, internos y motorizados */}
          {(rol === 'Presidente' || rol === 'Administrador') && (
            <>
              <button
                onClick={() => setActiveTab('lineas')}
                className={`px-4 py-2 font-semibold rounded-lg text-sm transition-colors cursor-pointer ${activeTab === 'lineas' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
              >
                Gestión de Líneas
              </button>
              <button
                onClick={() => setActiveTab('internos')}
                className={`px-4 py-2 font-semibold rounded-lg text-sm transition-colors cursor-pointer ${activeTab === 'internos' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
              >
                Gestión de Internos y Motorizados
              </button>
            </>
          )}

          {/* SECRETARIO DE HACIENDA: Registra pagos y movimientos de caja */}
          {(rol === 'Secretario de Hacienda' || rol === 'Administrador') && (
            <button
              onClick={() => setActiveTab('hacienda')}
              className={`px-4 py-2 font-semibold rounded-lg text-sm transition-colors cursor-pointer ${activeTab === 'hacienda' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            >
              Secretaría de Hacienda
            </button>
          )}

          {/* ADMINISTRADOR: Gestiona usuarios y asigna roles */}
          {rol === 'Administrador' && (
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`px-4 py-2 font-semibold rounded-lg text-sm transition-colors cursor-pointer ${activeTab === 'usuarios' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            >
              Gestión de Usuarios
            </button>
          )}
        </div>

        {/* Contenido dinámico según pestaña activa */}
        {activeTab === 'lineas' && (rol === 'Presidente' || rol === 'Administrador') && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  {editingId ? `Editando Línea N° ${numeroLinea}` : 'Registrar Nueva Línea'}
                </h2>
                {editingId && (
                  <button onClick={resetForm} className="text-sm text-gray-500 underline">Cancelar</button>
                )}
              </div>

              {formError && <p className="text-red-500 mb-3 text-sm">{formError}</p>}
              
              <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de Línea</label>
                  <input
                    type="number"
                    value={numeroLinea}
                    onChange={(e) => setNumeroLinea(e.target.value)}
                    placeholder="Ej. 20"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="En Ruta">En Ruta</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className={`${editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium px-5 py-2 rounded-lg transition-colors cursor-pointer`}
                >
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Líneas Registradas:</h2>
              {loading && <p className="text-blue-500">Cargando...</p>}
              {error && <p className="text-red-500">{error}</p>}
              
              {!loading && !error && lineas.map((linea) => (
                <div key={linea.id_linea} className="py-3 flex justify-between items-center border-b border-gray-100 last:border-none">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-800 text-lg">Línea N° {linea.numero_linea}</span>
                    <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">{linea.estado}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditClick(linea)} className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer">Editar</button>
                    <button onClick={() => handleDelete(linea.id_linea)} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'internos' && (rol === 'Presidente' || rol === 'Administrador') && <Internos />}
        {activeTab === 'hacienda' && (rol === 'Secretario de Hacienda' || rol === 'Administrador') && <Hacienda />}
        {activeTab === 'usuarios' && rol === 'Administrador' && <Usuarios />}

      </div>
    </div>
  );
}

export default App;