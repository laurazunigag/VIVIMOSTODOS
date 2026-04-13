import { useState, useEffect } from 'react';
import { useAuth } from '../context/ContextoAutenticacion';
import { servicioUsuarios, servicioInventario } from '../services/servicioApi';
<<<<<<< HEAD
=======
import './PaginaDashboard.css';
>>>>>>> 56c8acadeeaed21fba6a51dd9e109d2c25545bbf

export default function PaginaDashboard() {
  const { usuario } = useAuth();
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const [respUsuarios, respInventario] = await Promise.all([
          servicioUsuarios.obtenerEstadisticas(),
          servicioInventario.obtenerEstadisticas(),
        ]);
        setEstadisticas({
          ...respUsuarios.data.datos,
          ...respInventario.data.datos,
        });
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setCargando(false);
      }
    };
    cargarEstadisticas();
  }, []);

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const tarjetas = estadisticas
    ? [
        { titulo: 'Total Usuarios', valor: estadisticas.totalUsuarios, icono: 'bi-people', colorFondo: 'bg-primary bg-opacity-10', colorIcono: 'text-primary' },
        { titulo: 'Usuarios Activos', valor: estadisticas.activos, icono: 'bi-person-check', colorFondo: 'bg-success bg-opacity-10', colorIcono: 'text-success' },
        { titulo: 'Usuarios Inactivos', valor: estadisticas.inactivos, icono: 'bi-person-x', colorFondo: 'bg-warning bg-opacity-10', colorIcono: 'text-warning' },
        { titulo: 'Total Insumos', valor: estadisticas.totalInsumos, icono: 'bi-box-seam', colorFondo: 'bg-info bg-opacity-10', colorIcono: 'text-info' },
      ]
    : [];

  return (
    <div>
      {/* Saludo */}
      <div className="mb-4">
        <h3 className="fw-bold">{obtenerSaludo()}, {usuario?.nombreTitular?.split(' ')[0]}</h3>
        <p className="text-muted mb-0">Bienvenido al panel de gestión del Salón Social</p>
      </div>

      {/* Tarjetas */}
      {cargando ? (
        <div className="row g-3 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="col-sm-6 col-xl-3">
              <div className="card tarjeta-estadistica shadow-sm">
                <div className="card-body placeholder-glow">
                  <span className="placeholder col-6 mb-2 d-block"></span>
                  <span className="placeholder col-4 placeholder-lg"></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row g-3 mb-4">
          {tarjetas.map((tarjeta) => (
            <div key={tarjeta.titulo} className="col-sm-6 col-xl-3">
              <div className="card tarjeta-estadistica shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="small fw-medium text-muted">{tarjeta.titulo}</span>
                    <div className={`rounded-3 p-2 ${tarjeta.colorFondo}`}>
                      <i className={`bi ${tarjeta.icono} ${tarjeta.colorIcono}`}></i>
                    </div>
                  </div>
                  <h3 className="fw-bold mb-0">{tarjeta.valor}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sección informativa */}
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="rounded-3 p-2 bg-primary bg-opacity-10">
                  <i className="bi bi-graph-up text-primary"></i>
                </div>
                <h6 className="fw-semibold mb-0">Resumen del Sistema</h6>
              </div>
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span className="small text-muted">Módulo de Usuarios</span>
                  <span className="badge bg-success bg-opacity-10 text-success">Activo</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span className="small text-muted">Módulo de Inventario</span>
                  <span className="badge bg-success bg-opacity-10 text-success">Activo</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center px-0 border-0">
                  <span className="small text-muted">Módulo de Reservas</span>
                  <span className="badge bg-warning bg-opacity-10 text-warning">Próximamente</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="rounded-3 p-2 bg-success bg-opacity-10">
                  <i className="bi bi-lightning text-success"></i>
                </div>
                <h6 className="fw-semibold mb-0">Acceso Rápido</h6>
              </div>
              <p className="small text-muted">
                Desde este panel puede acceder a todas las funciones del sistema.
              </p>
              <ul className="list-unstyled small text-muted mb-0">
                <li className="mb-2 d-flex align-items-center gap-2">
                  <span className="rounded-circle bg-azul-oscuro d-inline-block" style={{ width: 6, height: 6 }}></span>
                  Gestionar usuarios y titulares de apartamentos
                </li>
                <li className="mb-2 d-flex align-items-center gap-2">
                  <span className="rounded-circle bg-verde d-inline-block" style={{ width: 6, height: 6 }}></span>
                  Controlar el inventario de insumos del salón
                </li>
                <li className="d-flex align-items-center gap-2">
                  <span className="rounded-circle bg-warning d-inline-block" style={{ width: 6, height: 6 }}></span>
                  Módulo de reservas (próximamente)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}