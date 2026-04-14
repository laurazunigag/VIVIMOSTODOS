import { useState, useEffect } from 'react';
import { servicioPrestamos } from '../services/servicioPrestamos';
import { useAuth } from '../context/ContextoAutenticacion';

export default function ModalPrestamosActivos({ onCerrar, recargarInventario }) {
  const { esAdmin, esSupervisor } = useAuth();
  const puedeEditar = esAdmin || esSupervisor;
  
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(null);

  const cargarPrestamos = async () => {
    try {
      setCargando(true);
      const res = puedeEditar 
        ? await servicioPrestamos.obtenerTodos()
        : await servicioPrestamos.obtenerMisPrestamos();
        
      const activos = res.data.datos.filter(p => p.estado === 'activo' || p.estado === 'pendiente_devolucion');
      setPrestamos(activos);
    } catch (error) {
      console.error('Error cargando prestamos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPrestamos();
  }, []);

  const devolverInsumo = async (idPrestamo) => {
    if (!confirm('¿Marcar este insumo como devuelto? La cantidad volverá a estar disponible.')) return;
    
    try {
      setProcesando(idPrestamo);
      await servicioPrestamos.devolver(idPrestamo);
      await cargarPrestamos();
      if (recargarInventario) recargarInventario(); // para que la pantalla de inventario actualice sus barras
    } catch (error) {
      console.error('Error al devolver', error);
      alert('Error al devolver insumo: ' + (error.response?.data?.mensaje || 'Desconocido'));
    } finally {
      setProcesando(null);
    }
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'N/A';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-ES', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const calcularVencido = (fechaEsperada) => {
    if (!fechaEsperada) return false;
    const ahora = new Date();
    const esperada = new Date(fechaEsperada);
    return ahora > esperada;
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow">
            <div className="modal-header bg-light border-bottom-0">
              <h5 className="modal-title fw-bold">
                {puedeEditar ? 'Préstamos Activos' : 'Mis Préstamos'}
              </h5>
              <button type="button" className="btn-close" onClick={onCerrar}></button>
            </div>
            
            <div className="modal-body p-0">
              <div className="table-responsive" style={{ maxHeight: '60vh' }}>
                <table className="table table-hover mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      {puedeEditar && <th className="small fw-semibold text-muted px-3">Usuario</th>}
                      <th className="small fw-semibold text-muted px-3">Insumo</th>
                      <th className="small fw-semibold text-muted text-center">Cant.</th>
                      <th className="small fw-semibold text-muted text-center" title="Fecha para usar">Para Evento</th>
                      <th className="small fw-semibold text-muted">Límite</th>
                      <th className="small fw-semibold text-muted text-end px-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargando ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          <div className="spinner-border spinner-border-sm me-2"></div>
                          Cargando préstamos...
                        </td>
                      </tr>
                    ) : prestamos.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          <i className="bi bi-check-circle fs-3 d-block mb-2 text-success opacity-50"></i>
                          No hay préstamos activos
                        </td>
                      </tr>
                    ) : (
                      prestamos.map(p => {
                        const vencido = calcularVencido(p.fecha_devolucion_esperada);
                        return (
                          <tr key={p.id_prestamo}>
                            {puedeEditar && (
                              <td className="px-3 align-middle">
                                <div className="fw-medium">Apt {p.id_apartamento}</div>
                                <div className="small text-muted">{p.nombre_titular}</div>
                              </td>
                            )}
                            <td className="align-middle fw-medium px-3">{p.nombre_insumo}</td>
                            <td className="align-middle text-center">{p.cantidad}</td>
                            <td className="align-middle text-center small text-primary fw-medium">{p.fecha_uso ? p.fecha_uso.split('T')[0] : 'N/A'}</td>
                            <td className="align-middle">
                              <span className={`small ${vencido ? 'text-danger fw-bold' : 'text-muted'}`}>
                                {formatearFecha(p.fecha_devolucion_esperada)}
                                {vencido && <i className="bi bi-exclamation-triangle ms-1"></i>}
                              </span>
                            </td>
                            <td className="align-middle text-end px-3">
                              {p.estado === 'pendiente_devolucion' && !puedeEditar ? (
                                <span className="badge bg-warning text-dark"><i className="bi bi-hourglass-split"></i> Pendiente</span>
                              ) : (
                                <button 
                                  className={`btn btn-sm ${p.estado === 'pendiente_devolucion' ? 'btn-success' : 'btn-outline-success'} d-inline-flex align-items-center gap-1`}
                                  onClick={() => devolverInsumo(p.id_prestamo)}
                                  disabled={procesando === p.id_prestamo}
                                >
                                  {procesando === p.id_prestamo ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                  ) : (
                                    <i className={p.estado === 'pendiente_devolucion' ? "bi bi-check2-all" : "bi bi-arrow-return-left"}></i>
                                  )}
                                  {p.estado === 'pendiente_devolucion' ? 'Aceptar Devolución' : 'Devolver'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="modal-footer border-top-0 bg-light">
              <button type="button" className="btn btn-outline-secondary" onClick={onCerrar}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
