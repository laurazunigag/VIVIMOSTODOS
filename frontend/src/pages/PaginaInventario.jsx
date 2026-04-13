import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/ContextoAutenticacion';
import { servicioInventario } from '../services/servicioApi';
import ModalInventario from '../components/ModalInventario';
<<<<<<< HEAD
=======
import ModalPrestar from '../components/ModalPrestar';
import ModalPrestamosActivos from '../components/ModalPrestamosActivos';
import { servicioPrestamos } from '../services/servicioPrestamos';
import './PaginaInventario.css';
>>>>>>> 56c8acadeeaed21fba6a51dd9e109d2c25545bbf

export default function PaginaInventario() {
  const { esAdmin, esSupervisor } = useAuth();
  const puedeEditar = esAdmin || esSupervisor;

  const [insumos, setInsumos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [insumoEditar, setInsumoEditar] = useState(null);
  const [mensaje, setMensaje] = useState(null);
<<<<<<< HEAD
=======
  
  const [modalPrestarAbierto, setModalPrestarAbierto] = useState(false);
  const [insumoPrestar, setInsumoPrestar] = useState(null);
  const [modalPrestamosActivosAbierto, setModalPrestamosActivosAbierto] = useState(false);
>>>>>>> 56c8acadeeaed21fba6a51dd9e109d2c25545bbf

  const cargarInsumos = useCallback(async () => {
    try {
      setCargando(true);
      const respuesta = await servicioInventario.obtenerTodos();
      setInsumos(respuesta.data.datos || []);
    } catch (error) {
      console.error('Error cargando inventario:', error);
      mostrarMensaje('danger', 'Error al cargar inventario');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarInsumos();
  }, [cargarInsumos]);

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  const abrirModalCrear = () => {
    setInsumoEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (insumo) => {
    setInsumoEditar(insumo);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setInsumoEditar(null);
  };

  const guardarInsumo = async (datosFormulario) => {
    try {
      if (insumoEditar) {
        await servicioInventario.actualizar(insumoEditar.id_inventario, datosFormulario);
        mostrarMensaje('success', 'Insumo actualizado correctamente');
      } else {
        await servicioInventario.crear(datosFormulario);
        mostrarMensaje('success', 'Insumo creado correctamente');
      }
      cerrarModal();
      cargarInsumos();
    } catch (error) {
      const mensajeError = error.response?.data?.mensaje || 'Error al guardar insumo';
      mostrarMensaje('danger', mensajeError);
    }
  };

<<<<<<< HEAD
=======
  const abrirModalPrestar = (insumo) => {
    setInsumoPrestar(insumo);
    setModalPrestarAbierto(true);
  };

  const guardarPrestamo = async (datos) => {
    try {
      await servicioPrestamos.crear(datos);
      mostrarMensaje('success', 'Préstamo registrado exitosamente');
      setModalPrestarAbierto(false);
      setInsumoPrestar(null);
      cargarInsumos();
    } catch (error) {
      mostrarMensaje('danger', error.response?.data?.mensaje || 'Error al registrar préstamo');
    }
  };

>>>>>>> 56c8acadeeaed21fba6a51dd9e109d2c25545bbf
  const eliminarInsumo = async (insumo) => {
    if (!confirm(`¿Está seguro de eliminar "${insumo.nombre_insumo}"?`)) return;
    try {
      await servicioInventario.eliminar(insumo.id_inventario);
      mostrarMensaje('success', 'Insumo eliminado correctamente');
      cargarInsumos();
    } catch (error) {
      mostrarMensaje('danger', 'Error al eliminar insumo');
    }
  };

  const insumosFiltrados = insumos.filter((i) =>
    i.nombre_insumo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const calcularPorcentaje = (disponible, total) => {
    if (total === 0) return 0;
    return Math.round((disponible / total) * 100);
  };

  const obtenerColorBarra = (porcentaje) => {
    if (porcentaje > 60) return '#10B981';
    if (porcentaje > 30) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div>
      {/* Mensaje */}
      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show d-flex align-items-center gap-2 small`} role="alert">
          <i className={`bi ${mensaje.tipo === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}`}></i>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1">Inventario del Salón</h4>
          <p className="text-muted small mb-0">Control de insumos y artículos disponibles</p>
        </div>
<<<<<<< HEAD
        {puedeEditar && (
          <button className="btn btn-verde d-flex align-items-center gap-2" onClick={abrirModalCrear}>
            <i className="bi bi-plus-lg"></i>
            Nuevo Insumo
          </button>
        )}
=======
        <div className="d-flex flex-wrap gap-2">
          {!puedeEditar && (
            <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={() => setModalPrestamosActivosAbierto(true)}>
              <i className="bi bi-card-checklist"></i>
              Mis Préstamos
            </button>
          )}
          {puedeEditar && (
            <>
              <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={() => setModalPrestamosActivosAbierto(true)}>
                <i className="bi bi-card-checklist"></i>
                Préstamos Activos
              </button>
              <button className="btn btn-nuevo-insumo d-flex align-items-center gap-2" onClick={abrirModalCrear}>
                <i className="bi bi-plus-lg"></i>
                Nuevo Insumo
              </button>
            </>
          )}
        </div>
>>>>>>> 56c8acadeeaed21fba6a51dd9e109d2c25545bbf
      </div>

      {/* Búsqueda */}
      <div className="mb-3" style={{ maxWidth: 400 }}>
        <div className="input-group">
          <span className="input-group-text bg-white">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar insumo..."
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="small fw-semibold text-muted">Insumo</th>
                <th className="small fw-semibold text-muted text-center">Total</th>
                <th className="small fw-semibold text-muted text-center">Disponible</th>
                <th className="small fw-semibold text-muted d-none d-sm-table-cell">Disponibilidad</th>
<<<<<<< HEAD
                {puedeEditar && <th className="small fw-semibold text-muted text-end">Acciones</th>}
=======
                <th className="small fw-semibold text-muted text-end">Acciones</th>
>>>>>>> 56c8acadeeaed21fba6a51dd9e109d2c25545bbf
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
<<<<<<< HEAD
                  <td colSpan={puedeEditar ? 5 : 4} className="text-center py-4 text-muted">
=======
                  <td colSpan={5} className="text-center py-4 text-muted">
>>>>>>> 56c8acadeeaed21fba6a51dd9e109d2c25545bbf
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    Cargando inventario...
                  </td>
                </tr>
              ) : insumosFiltrados.length === 0 ? (
                <tr>
<<<<<<< HEAD
                  <td colSpan={puedeEditar ? 5 : 4} className="text-center py-4 text-muted">
=======
                  <td colSpan={5} className="text-center py-4 text-muted">
>>>>>>> 56c8acadeeaed21fba6a51dd9e109d2c25545bbf
                    <i className="bi bi-box-seam fs-3 d-block mb-2 text-secondary opacity-50"></i>
                    No se encontraron insumos
                  </td>
                </tr>
              ) : (
                insumosFiltrados.map((insumo) => {
                  const porcentaje = calcularPorcentaje(insumo.cantidad_disponible, insumo.cantidad_total);
                  const colorBarra = obtenerColorBarra(porcentaje);

                  return (
                    <tr key={insumo.id_inventario}>
                      <td className="fw-medium">{insumo.nombre_insumo}</td>
                      <td className="text-center">{insumo.cantidad_total}</td>
                      <td className="text-center fw-medium">{insumo.cantidad_disponible}</td>
                      <td className="d-none d-sm-table-cell">
                        <div className="d-flex align-items-center gap-2">
                          <div className="barra-disponibilidad flex-grow-1">
                            <div
                              className="barra-disponibilidad-relleno"
                              style={{ width: `${porcentaje}%`, backgroundColor: colorBarra }}
                            ></div>
                          </div>
                          <span className="small text-muted" style={{ minWidth: 35 }}>{porcentaje}%</span>
                        </div>
                      </td>
<<<<<<< HEAD
                      {puedeEditar && (
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => abrirModalEditar(insumo)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          {esAdmin && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => eliminarInsumo(insumo)}
                              title="Eliminar"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </td>
                      )}
=======
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-success me-1"
                          onClick={() => abrirModalPrestar(insumo)}
                          title="Prestar"
                          disabled={insumo.cantidad_disponible === 0}
                        >
                          <i className="bi bi-box-arrow-right"></i>
                        </button>
                        {puedeEditar && (
                          <>
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => abrirModalEditar(insumo)}
                              title="Editar"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            {esAdmin && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => eliminarInsumo(insumo)}
                                title="Eliminar"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </>
                        )}
                      </td>
>>>>>>> 56c8acadeeaed21fba6a51dd9e109d2c25545bbf
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalAbierto && (
        <ModalInventario
          insumo={insumoEditar}
          onGuardar={guardarInsumo}
          onCerrar={cerrarModal}
        />
      )}
<<<<<<< HEAD
=======

      {modalPrestarAbierto && insumoPrestar && (
        <ModalPrestar
          insumo={insumoPrestar}
          onGuardar={guardarPrestamo}
          onCerrar={() => {
            setModalPrestarAbierto(false);
            setInsumoPrestar(null);
          }}
        />
      )}

      {modalPrestamosActivosAbierto && (
        <ModalPrestamosActivos
          onCerrar={() => setModalPrestamosActivosAbierto(false)}
          recargarInventario={cargarInsumos}
        />
      )}
>>>>>>> 56c8acadeeaed21fba6a51dd9e109d2c25545bbf
    </div>
  );
}