import React, { useState } from 'react';
import api from './api';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // 1. Extraemos los datos de la respuesta
      const token = response.data.access_token;
      
      // 2. PROTECCIÓN INTELIGENTE: Si el backend manda el rol lo usamos, 
      // de lo contrario lo deducimos por el usuario para evitar el NULL
      let rol = response.data.rol;
      if (!rol) {
        if (username.toLowerCase() === 'admin') {
          rol = 'Administrador';
        } else {
          rol = 'Presidente'; // Rol por defecto preventivo
        }
      }
      
      // 3. Guardamos en el almacenamiento local
      localStorage.setItem('token', token);
      localStorage.setItem('rol', rol);
      
      if (response.data.nombre_completo) {
        localStorage.setItem('nombre_completo', response.data.nombre_completo);
      } else {
        localStorage.setItem('nombre_completo', username);
      }
      
      // 4. Notificamos el éxito y forzamos recarga de estado si es necesario
      onLoginSuccess();
    } catch (err) {
      console.error('Error de autenticación:', err);
      setError('Credenciales incorrectas. Verifica tu usuario y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand flex items-center justify-center p-4">
      <div className="max-w-md w-full panel p-8 border-t-4 border-t-white">
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Asociación "20 de Diciembre"
        </h2>
        <p className="text-white/60 text-center mb-6 text-sm">
          Inicia sesión para acceder al panel de control
        </p>

        {error && (
          <div className="alert-error mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="form-label">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-input"
              placeholder="Ingresa tu usuario"
            />
          </div>

          <div>
            <label className="form-label">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;