import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/ContextoAutenticacion';
import { servicioReservas } from '../services/servicioReservas';
import { servicioUsuarios } from '../services/servicioApi';

export default function PaginaReservas() {
  const { usuario, esAdmin, esSupervisor } = useAuth();
  const puedeEditar = esAdmin || esSupervisor;

  const [fechaActual, setFechaActual] = useState(new Date());
  const [reservasMes, setReservasMes] = useState([]);
  const [misReservas, setMisReservas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  
  // Modal de confirmación
  const [modalAbierto, setModalAbierto] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [idApartamentoSeleccionado, setIdApartamentoSeleccionado] = useState('');
  const [procesando, setProcesando] = useState(false);

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      const promesas = [
        servicioReservas.obtenerPorMes(fechaActual.getFullYear(), fechaActual.getMonth() + 1),
        esSupervisor ? servicioReservas.obtenerTodas() : servicioReservas.obtenerMisReservas()
      ];
      if (esSupervisor && usuarios.length === 0) {
        promesas.push(servicioUsuarios.obtenerTodos());
      }

      const res = await Promise.all(promesas);
      
      setReservasMes(res[0].data.datos || []);
      setMisReservas(res[1].data.datos || []);
      
      if (esSupervisor && res[2]) {
        setUsuarios(res[2].data.datos || []);
      }
    } catch (error) {
      console.error('Error cargando reservas:', error);
      mostrarMensaje('danger', 'Error al cargar las reservas');
    } finally {
      setCargando(false);
    }
  }, [fechaActual, esSupervisor, usuarios.length]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const cambiarMes = (incremento) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + incremento);
    setFechaActual(nuevaFecha);
  };

  const procesarClicDia = (dia) => {
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const fechaClic = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), dia);
    
    if (fechaClic < hoy) return; // No se puede reservar en el pasado

    const yaReservado = reservasMes.some(
      r => new Date(r.fecha_reserva).getDate() === dia && r.estado === 'activa'
    );

    if (yaReservado) return; // Día no disponible

    // Formatear para BD YYYY-MM-DD
    const strFecha = `${fechaClic.getFullYear()}-${(fechaClic.getMonth() + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    setFechaSeleccionada(strFecha);
    setIdApartamentoSeleccionado('');
    setModalAbierto(true);
  };

  const confirmarReserva = async () => {
    if (esSupervisor && !idApartamentoSeleccionado) {
       mostrarMensaje('danger', 'Debe seleccionar un apartamento.');
       return;
    }
    
    try {
      setProcesando(true);
      await servicioReservas.crear({
        id_apartamento: esSupervisor ? idApartamentoSeleccionado : usuario.idApartamento,
        fecha_reserva: fechaSeleccionada
      });
      mostrarMensaje('success', '¡Reserva confirmada con éxito!');
      setModalAbierto(false);
      cargarDatos();
    } catch (error) {
      mostrarMensaje('danger', error.response?.data?.mensaje || 'Error al confirmar la reserva');
    } finally {
      setProcesando(false);
    }
  };

  const cancelarReserva = async (id) => {
    if(!confirm('¿Estás seguro de cancelar esta reserva?')) return;
    try {
      await servicioReservas.cancelar(id);
      mostrarMensaje('success', 'Reserva cancelada.');
      cargarDatos();
    } catch (error) {
      mostrarMensaje('danger', error.response?.data?.mensaje || 'Error al cancelar la reserva');
    }
  };

  // Generación del calendario
  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const mesActualStr = fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const primerDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
  const ultimoDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
  const diasDelMes = ultimoDia.getDate();
  const inicioSemana = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;

  const celdas = [];
  for (let i = 0; i < inicioSemana; i++) celdas.push(null);
  for (let d = 1; d <= diasDelMes; d++) celdas.push(d);

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
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Centro de Reservas</h4>
        <p className="text-muted small mb-0">Gestiona y consulta la disponibilidad del salón social</p>
      </div>

      <div className="row g-4">
        {/* Calendario Interactivo */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-3 p-2 bg-primary bg-opacity-10">
                    <i className="bi bi-calendar3 text-primary"></i>
                  </div>
                  <div>
                    <h6 className="fw-semibold mb-0">Disponibilidad</h6>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <button className="btn btn-sm btn-light" onClick={() => cambiarMes(-1)}>
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <span className="fw-medium text-capitalize" style={{minWidth: '120px', textAlign: 'center'}}>
                    {mesActualStr}
                  </span>
                  <button className="btn btn-sm btn-light" onClick={() => cambiarMes(1)}>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>

              {cargando ? (
                <div className="text-center py-5">
                   <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : (
                <>
                  <div className="d-grid text-center mb-2" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                    {diasSemana.map((dia) => (
                      <div key={dia} className="small fw-semibold text-muted py-1">
                        {dia}
                      </div>
                    ))}
                  </div>
                  <div className="d-grid text-center" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px 0' }}>
                    {celdas.map((dia, idx) => {
                      if (dia === null) return <div key={idx} className="py-1"></div>;
                      
                      const fechaIteracion = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), dia);
                      const hoy = new Date();
                      hoy.setHours(0,0,0,0);
                      
                      const esPasado = fechaIteracion < hoy;
                      const esHoy = fechaIteracion.getTime() === hoy.getTime();
                      const reservasDelDia = reservasMes.filter(r => new Date(r.fecha_reserva).getDate() === dia && r.estado === 'activa');
                      const estaReservado = reservasDelDia.length > 0;
                      
                      let claseColor = 'bg-light text-dark hover-shadow cursor-pointer';
                      let cursor = 'pointer';
                      let title = 'Disponible';

                      if (esPasado) {
                        claseColor = 'text-muted opacity-25';
                        cursor = 'not-allowed';
                        title = 'Día pasado';
                      } else if (estaReservado) {
                        claseColor = 'bg-danger text-white opacity-75';
                        cursor = 'not-allowed';
                        title = `Reservado por Apt ${reservasDelDia[0].id_apartamento}`;
                      } else if (esHoy) {
                        claseColor = 'bg-primary text-white hover-shadow';
                      }

                      return (
                        <div key={idx} className="py-1 d-flex justify-content-center">
                           <button
                             type="button"
                             disabled={esPasado || estaReservado}
                             onClick={() => procesarClicDia(dia)}
                             className={`btn rounded-circle d-flex align-items-center justify-content-center p-0 border-0 ${claseColor}`}
                             style={{ width: 40, height: 40, cursor: cursor }}
                             title={title}
                           >
                             <span className={esHoy ? 'fw-bold' : ''}>{dia}</span>
                           </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="d-flex gap-4 mt-3 ms-2 small">
            <div className="d-flex align-items-center gap-2 text-muted">
               <span className="rounded-circle bg-light border d-inline-block" style={{width: 12, height: 12}}></span>
               Disponible
            </div>
            <div className="d-flex align-items-center gap-2 text-muted">
               <span className="rounded-circle bg-danger opacity-75 d-inline-block" style={{width: 12, height: 12}}></span>
               Ocupado
            </div>
            <div className="d-flex align-items-center gap-2 text-muted">
               <span className="rounded-circle bg-primary d-inline-block" style={{width: 12, height: 12}}></span>
               Hoy
            </div>
          </div>
        </div>

        {/* Panel lateral: Mis Reservas */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="rounded-3 p-2 bg-success bg-opacity-10">
                  <i className="bi bi-clock-history text-success"></i>
                </div>
                <h6 className="fw-semibold mb-0">{esSupervisor ? 'Todas las Reservas Activas' : 'Mis Próximas Reservas'}</h6>
              </div>

              {misReservas.filter(r => r.estado === 'activa').length === 0 ? (
                <div className="text-center py-4 text-muted border rounded bg-light">
                  <i className="bi bi-calendar-x fs-3 d-block mb-2 opacity-50"></i>
                  <span className="small">{esSupervisor ? 'No hay reservas activas en el sistema.' : 'No tienes reservas activas.'}</span>
                  {!esSupervisor && <p className="small mb-0 mt-1">Haz clic en un día disponible para agendar.</p>}
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {misReservas.filter(r => r.estado === 'activa').map(reserva => {
                    const fechaR = new Date(reserva.fecha_reserva);
                    // Add timezone offset so it matches local exactly
                    fechaR.setMinutes(fechaR.getMinutes() + fechaR.getTimezoneOffset());
                    
                    return (
                      <div key={reserva.id_reserva} className="list-group-item px-0 py-3 border-bottom-dashed">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex gap-3">
                            <div className="bg-primary bg-opacity-10 rounded px-3 py-2 text-center">
                               <div className="small fw-bold text-primary">{fechaR.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}</div>
                               <div className="fs-5 fw-bold text-primary" style={{lineHeight: 1}}>{fechaR.getDate()}</div>
                            </div>
                            <div>
                               {esSupervisor && <div className="small fw-bold text-success mb-1">Apt {reserva.id_apartamento} - {reserva.nombre_titular}</div>}
                               <h6 className="mb-1 fw-semibold">Reserva Salón Social</h6>
                               <div className="small text-muted">Todo el día seleccionado</div>
                            </div>
                          </div>
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            onClick={() => cancelarReserva(reserva.id_reserva)}
                            title="Cancelar reserva"
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {modalAbierto && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-primary text-white border-bottom-0 rounded-top">
                  <h5 className="modal-title fw-bold">Confirmar Reserva</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setModalAbierto(false)}></button>
                </div>
                <div className="modal-body p-4 text-center">
                  <i className="bi bi-building fs-1 text-primary mb-3"></i>
                  <h5 className="fw-semibold">¿Reservar el salón social?</h5>
                  <p className="text-muted mb-4">
                    Estás a punto de agendar el salón para el día:
                    <br/><strong className="fs-5 text-dark mt-2 d-inline-block">{fechaSeleccionada}</strong>
                  </p>
                  
                  <div className="alert alert-info small text-start d-flex gap-2">
                    <i className="bi bi-info-circle mt-1"></i>
                    {esSupervisor 
                      ? 'Como supervisor, estás forzando una reserva en nombre de un apartamento específico.'
                      : 'Al confirmar, serás el responsable del salón durante esta fecha y tendrás acceso habilitado para solicitar préstamos de insumos del inventario para este día.'}
                  </div>

                  {esSupervisor && (
                    <div className="text-start mt-3">
                      <label className="form-label small fw-semibold text-muted">A nombre de (Apartamento):</label>
                      <select 
                        className="form-select"
                        value={idApartamentoSeleccionado}
                        onChange={(e) => setIdApartamentoSeleccionado(e.target.value)}
                        required
                      >
                         <option value="">Seleccione apartamento...</option>
                         {usuarios.map(u => (
                           <option key={u.id_apartamento} value={u.id_apartamento}>Apt {u.id_apartamento} - {u.nombre_titular}</option>
                         ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="modal-footer bg-light border-top-0 rounded-bottom">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setModalAbierto(false)}>
                    Cancelar
                  </button>
                  <button type="button" className="btn btn-primary" onClick={confirmarReserva} disabled={procesando}>
                    {procesando ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Procesando...</>
                    ) : (
                      'Confirmar Reserva'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}