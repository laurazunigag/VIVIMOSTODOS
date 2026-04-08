import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/ContextoAutenticacion';

export default function PaginaLogin() {
  const [idApartamento, setIdApartamento] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const { iniciarSesion } = useAuth();
  const navegar = useNavigate();

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError('');

    if (!idApartamento.trim() || !contrasena.trim()) {
      setError('Por favor complete todos los campos');
      return;
    }

    setCargando(true);
    const resultado = await iniciarSesion(Number(idApartamento), contrasena);
    setCargando(false);

    if (resultado.exito) {
      navegar('/dashboard');
    } else {
      setError(resultado.mensaje);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #0F2557 100%)' }}
    >
      <div style={{ maxWidth: 420, width: '100%' }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-3 bg-blanco mb-3" //Verde
            style={{ width: 64, height: 64 }}
          >
            <i className="bi bi-building text-white fs-2"></i>
          </div>
          <h2 className="text-white fw-bold">Salón Social</h2>
          <p className="text-white-50">Sistema de Gestión Residencial</p>
        </div>

        {/* Formulario */}
        <div className="card border-0 shadow-lg rounded-4">
          <div className="card-body p-4">
            <h5 className="fw-semibold mb-4">Iniciar Sesión</h5>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small" role="alert">
                <i className="bi bi-exclamation-circle"></i>
                {error}
              </div>
            )}

            <form onSubmit={manejarEnvio}>
              <div className="mb-3">
                <label className="form-label small fw-medium">Número de Apartamento</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-house-door text-secondary"></i>
                  </span>
                  <input
                    type="number"
                    className="form-control border-start-0"
                    value={idApartamento}
                    onChange={(e) => setIdApartamento(e.target.value)}
                    placeholder="Ej: 101"
                    disabled={cargando}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-medium">Contraseña</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-lock text-secondary"></i>
                  </span>
                  <input
                    type={mostrarContrasena ? 'text' : 'password'}
                    className="form-control border-start-0 border-end-0"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="••••••••"
                    disabled={cargando}
                  />
                  <button
                    type="button"
                    className="input-group-text bg-light border-start-0"
                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  >
                    <i className={`bi ${mostrarContrasena ? 'bi-eye-slash' : 'bi-eye'} text-secondary`}></i>
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-azul w-100 py-2" disabled={cargando}>
                {cargando ? (
                  <span className="d-flex align-items-center justify-content-center gap-2">
                    <span className="spinner-border spinner-border-sm"></span>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            <div className="mt-3 pt-3 border-top">
              <p className="text-muted text-center small mb-0">
                Si no tiene acceso, contacte al administrador del edificio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}