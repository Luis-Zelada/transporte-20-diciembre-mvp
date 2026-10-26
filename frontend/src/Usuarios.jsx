import React, { useEffect, useState } from 'react';
import api from './api';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [idRol, setIdRol] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resUsr, resRol] = await Promise.all([
        api.get('/api/v1/usuarios'), // <-- Añadido /api/v1/
        api.get('/api/v1/roles')     // <-- Añadido /api/v1/
      ]);
      setUsuarios(resUsr.data);
      setRoles(resRol.data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      nombre,
      apellido,
      nombre_usuario: nombreUsuario,
      contrasena,
      id_rol: parseInt(idRol),
      estado: "Activo"
    };

    api.post('/api/v1/usuarios', payload) // <-- Añadido /api/v1/
      .then(() => {
        setNombre('');
        setApellido('');
        setNombreUsuario('');
        setContrasena('');
        setIdRol('');
        fetchData();
        alert('Usuario creado exitosamente');
      })
      .catch((err) => alert(err.response?.data?.detail || 'Error al crear usuario'));
  };

  return (
    <div className="panel space-y-6">
      <h2 className="text-2xl font-bold text-white">Gestión de Usuarios y Roles</h2>

      <form onSubmit={handleSubmit} className="subpanel space-y-4">
        <h3 className="text-lg font-semibold text-white">Crear Nuevo Usuario</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Nombre</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required className="form-input" />
          </div>
          <div>
            <label className="form-label">Apellido</label>
            <input type="text" value={apellido} onChange={e => setApellido(e.target.value)} required className="form-input" />
          </div>
          <div>
            <label className="form-label">Nombre de Usuario</label>
            <input type="text" value={nombreUsuario} onChange={e => setNombreUsuario(e.target.value)} required className="form-input" />
          </div>
          <div>
            <label className="form-label">Contraseña</label>
            <input type="password" value={contrasena} onChange={e => setContrasena(e.target.value)} required className="form-input" />
          </div>
          <div>
            <label className="form-label">Rol</label>
            <select value={idRol} onChange={e => setIdRol(e.target.value)} required className="form-input">
              <option value="">Seleccione un rol</option>
              {roles.map(r => (
                <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Guardar Usuario
        </button>
      </form>

      <div>
        <h3 className="text-xl font-semibold text-white mb-3">Usuarios Registrados</h3>
        <div className="space-y-2">
          {usuarios.map(u => (
            <div key={u.id_usuario} className="row-card p-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-white">{u.nombre} {u.apellido}</span>
                <p className="text-xs text-white/60">Usuario: {u.nombre_usuario}</p>
              </div>
              <span className="badge badge-brand">
                {u.rol ? u.rol.nombre_rol : 'Sin Rol'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Usuarios;