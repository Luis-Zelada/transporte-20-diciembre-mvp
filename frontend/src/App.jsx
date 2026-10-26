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
    <div className="min-h-screen bg-brand p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Cabecera */}
        <div className="bg-ink rounded-xl shadow-xl shadow-black/30 border-b-4 border-white p-6 flex justify-between items-center gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Asociación de Transporte "20 de Diciembre"
            </h1>
            <p className="text-white/70 text-sm">
              Conectado como: <span className="font-semibold text-brand-light uppercase">{rol}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-light"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Barra de Pestañas Filtrada por Roles */}
        <div className="flex gap-2 flex-wrap bg-ink rounded-xl p-2 shadow-xl shadow-black/30">
          
          {/* PRESIDENTE: Gestiona líneas, internos y motorizados */}
          {(rol === 'Presidente' || rol === 'Administrador') && (
            <>
              <button
                onClick={() => setActiveTab('lineas')}
                className={`tab ${activeTab === 'lineas' ? 'tab-active' : ''}`}
              >
                Gestión de Líneas
              </button>
              <button
                onClick={() => setActiveTab('internos')}
                className={`tab ${activeTab === 'internos' ? 'tab-active' : ''}`}
              >
                Gestión de Internos y Motorizados
              </button>
            </>
          )}

          {/* SECRETARIO DE HACIENDA: Registra pagos y movimientos de caja */}
          {(rol === 'Secretario de Hacienda' || rol === 'Administrador') && (
            <button
              onClick={() => setActiveTab('hacienda')}
              className={`tab ${activeTab === 'hacienda' ? 'tab-active' : ''}`}
            >
              Secretaría de Hacienda
            </button>
          )}

          {/* ADMINISTRADOR: Gestiona usuarios y asigna roles */}
          {rol === 'Administrador' && (
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`tab ${activeTab === 'usuarios' ? 'tab-active' : ''}`}
            >
              Gestión de Usuarios
            </button>
          )}
        </div>

        {/* Contenido dinámico según pestaña activa */}
        {activeTab === 'lineas' && (rol === 'Presidente' || rol === 'Administrador') && (
          <div className="space-y-6">
            <div className="panel">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {editingId ? `Editando Línea N° ${numeroLinea}` : 'Registrar Nueva Línea'}
                </h2>
                {editingId && (
                  <button onClick={resetForm} className="text-sm text-white/70 hover:text-white underline cursor-pointer">Cancelar</button>
                )}
              </div>

              {formError && <p className="alert-error mb-3">{formError}</p>}
              
              <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="form-label">Número de Línea</label>
                  <input
                    type="number"
                    value={numeroLinea}
                    onChange={(e) => setNumeroLinea(e.target.value)}
                    placeholder="Ej. 20"
                    className="form-input"
                  />
                </div>

                <div className="flex-1">
                  <label className="form-label">Estado</label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="form-input"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="En Ruta">En Ruta</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className={`btn ${editingId ? 'btn-light' : 'btn-primary'}`}
                >
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
              </form>
            </div>

            <div className="panel">
              <h2 className="text-xl font-semibold text-white mb-3">Líneas Registradas:</h2>
              {loading && <p className="text-white/70">Cargando...</p>}
              {error && <p className="alert-error">{error}</p>}
              
              {!loading && !error && lineas.map((linea) => (
                <div key={linea.id_linea} className="py-3 flex justify-between items-center border-b border-white/10 last:border-none">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-white text-lg">Línea N° {linea.numero_linea}</span>
                    <span className="badge badge-light">{linea.estado}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditClick(linea)} className="btn btn-sm btn-outline">Editar</button>
                    <button onClick={() => handleDelete(linea.id_linea)} className="btn btn-sm btn-danger">Eliminar</button>
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