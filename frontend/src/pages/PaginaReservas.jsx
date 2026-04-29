import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/ContextoAutenticacion';
import { servicioReservas } from '../services/servicioReservas';
import { servicioUsuarios } from '../services/servicioApi';

export default function PaginaReservas() {
  const { usuario, esAdmin, esSupervisor } = useAuth();
  const puedeEditar = esAdmin || esSupervisor;
  const puedeGestionar = esAdmin || esSupervisor;

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

  // Admin: reservas pendientes
  const [pendientes, setPendientes] = useState([]);
  const [modalRechazo, setModalRechazo] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      const promesas = [
        servicioReservas.obtenerPorMes(fechaActual.getFullYear(), fechaActual.getMonth() + 1),
        puedeGestionar ? servicioReservas.obtenerTodas() : servicioReservas.obtenerMisReservas()
      ];
      if (puedeGestionar && usuarios.length === 0) {
        promesas.push(servicioUsuarios.obtenerTodos());
      }
      if (puedeGestionar) {
        promesas.push(servicioReservas.obtenerPendientes());
      }

      const res = await Promise.all(promesas);
      
      setReservasMes(res[0].data.datos || []);
      setMisReservas(res[1].data.datos || []);
      
      let idx = 2;
      if (puedeGestionar && res[idx] && !Array.isArray(res[idx].data.datos?.length === undefined)) {
        if (usuarios.length === 0 && res[idx]) {
          setUsuarios(res[idx].data.datos || []);
          idx++;
        }
        if (res[idx]) {
          setPendientes(res[idx].data.datos || []);
        }
      }
    } catch (error) {
      console.error('Error cargando reservas:', error);
      mostrarMensaje('danger', 'Error al cargar las reservas');
    } finally {
      setCargando(false);
    }
  }, [fechaActual, puedeGestionar, usuarios.length]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const cambiarMes = (incremento) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + incremento);
    setFechaActual(nuevaFecha);
  };

  // Helper: verifica si una fecha está dentro de las 48h mínimas
  const dentroMin48h = (fechaObj) => {
    const ahora = new Date();
    const diffH = (fechaObj - ahora) / (1000 * 60 * 60);
    return diffH < 48;
  };

  // Helper: verifica si una fecha supera los 90 días
  const superaMax90d = (fechaObj) => {
    const limite = new Date();
    limite.setHours(0,0,0,0);
    limite.setDate(limite.getDate() + 90);
    return fechaObj > limite;
  };

  const procesarClicDia = (dia) => {
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const fechaClic = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), dia);
    
    if (fechaClic < hoy) return;
    if (dentroMin48h(fechaClic)) return;
    if (superaMax90d(fechaClic)) return;

    const yaOcupado = reservasMes.some(
      r => new Date(r.fecha_reserva).getDate() === dia && (r.estado === 'activa' || r.estado === 'pendiente')
    );
    if (yaOcupado) return;

    const strFecha = `${fechaClic.getFullYear()}-${(fechaClic.getMonth() + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    setFechaSeleccionada(strFecha);
    setIdApartamentoSeleccionado('');
    setModalAbierto(true);
  };

  const confirmarReserva = async () => {
    if (puedeGestionar && !idApartamentoSeleccionado) {
       mostrarMensaje('danger', 'Debe seleccionar un apartamento.');
       return;
    }
    
    try {
      setProcesando(true);
      await servicioReservas.crear({
        id_apartamento: puedeGestionar ? idApartamentoSeleccionado : usuario.idApartamento,
        fecha_reserva: fechaSeleccionada
      });
      mostrarMensaje('success', puedeGestionar ? '¡Reserva confirmada con éxito!' : '¡Solicitud enviada! Espera la aprobación.');
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

  const autorizarReserva = async (id) => {
    try {
      setProcesando(true);
      await servicioReservas.autorizar(id);
      mostrarMensaje('success', 'Reserva autorizada exitosamente.');
      cargarDatos();
    } catch (error) {
      mostrarMensaje('danger', error.response?.data?.mensaje || 'Error al autorizar');
    } finally {
      setProcesando(false);
    }
  };

  const rechazarReserva = async () => {
    if (!modalRechazo) return;
    try {
      setProcesando(true);
      await servicioReservas.rechazar(modalRechazo, motivoRechazo);
      mostrarMensaje('success', 'Reserva rechazada.');
      setModalRechazo(null);
      setMotivoRechazo('');
      cargarDatos();
    } catch (error) {
      mostrarMensaje('danger', error.response?.data?.mensaje || 'Error al rechazar');
    } finally {
      setProcesando(false);
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
                      const es48h = !esPasado && dentroMin48h(fechaIteracion);
                      const es90d = !esPasado && superaMax90d(fechaIteracion);
                      const reservasActivas = reservasMes.filter(r => new Date(r.fecha_reserva).getDate() === dia && r.estado === 'activa');
                      const reservasPend = reservasMes.filter(r => new Date(r.fecha_reserva).getDate() === dia && r.estado === 'pendiente');
                      const estaReservado = reservasActivas.length > 0;
                      const estaPendiente = reservasPend.length > 0;
                      const noDisponible = esPasado || es48h || es90d || estaReservado || estaPendiente;
                      
                      let claseColor = 'bg-light text-dark hover-shadow cursor-pointer';
                      let cursor = 'pointer';
                      let title = 'Disponible';

                      if (esPasado) {
                        claseColor = 'text-muted opacity-25';
                        cursor = 'not-allowed';
                        title = 'Día pasado';
                      } else if (es48h) {
                        claseColor = 'text-muted opacity-50';
                        cursor = 'not-allowed';
                        title = 'Menos de 48h de anticipación';
                      } else if (es90d) {
                        claseColor = 'text-muted opacity-25';
                        cursor = 'not-allowed';
                        title = 'Supera los 90 días máximos';
                      } else if (estaReservado) {
                        claseColor = 'bg-danger text-white opacity-75';
                        cursor = 'not-allowed';
                        title = `Reservado por Apt ${reservasActivas[0].id_apartamento}`;
                      } else if (estaPendiente) {
                        claseColor = 'bg-warning text-dark opacity-75';
                        cursor = 'not-allowed';
                        title = 'Solicitud pendiente de aprobación';
                      } else if (esHoy) {
                        claseColor = 'bg-primary text-white hover-shadow';
                      }

                      return (
                        <div key={idx} className="py-1 d-flex justify-content-center">
                           <button
                             type="button"
                             disabled={noDisponible}
                             onClick={() => procesarClicDia(dia)}
                             className={`btn rounded-circle d-flex align-items-center justify-content-center p-0 border-0 ${claseColor}`}
                             style={{ width: 40, height: 40, cursor: noDisponible ? 'not-allowed' : 'pointer' }}
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
          
          <div className="d-flex flex-wrap gap-3 mt-3 ms-2 small">
            <div className="d-flex align-items-center gap-2 text-muted">
               <span className="rounded-circle bg-light border d-inline-block" style={{width: 12, height: 12}}></span>
               Disponible
            </div>
            <div className="d-flex align-items-center gap-2 text-muted">
               <span className="rounded-circle bg-danger opacity-75 d-inline-block" style={{width: 12, height: 12}}></span>
               Aprobada
            </div>
            <div className="d-flex align-items-center gap-2 text-muted">
               <span className="rounded-circle bg-warning opacity-75 d-inline-block" style={{width: 12, height: 12}}></span>
               Pendiente
            </div>
            <div className="d-flex align-items-center gap-2 text-muted">
               <span className="rounded-circle bg-primary d-inline-block" style={{width: 12, height: 12}}></span>
               Hoy
            </div>
          </div>
        </div>

        {/* Panel lateral: Reservas */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="rounded-3 p-2 bg-success bg-opacity-10">
                  <i className="bi bi-clock-history text-success"></i>
                </div>
                <h6 className="fw-semibold mb-0">{puedeGestionar ? 'Todas las Reservas' : 'Mis Reservas'}</h6>
              </div>

              {misReservas.filter(r => ['activa','pendiente'].includes(r.estado)).length === 0 ? (
                <div className="text-center py-4 text-muted border rounded bg-light">
                  <i className="bi bi-calendar-x fs-3 d-block mb-2 opacity-50"></i>
                  <span className="small">{puedeGestionar ? 'No hay reservas en el sistema.' : 'No tienes reservas.'}</span>
                  {!puedeGestionar && <p className="small mb-0 mt-1">Haz clic en un día disponible para agendar.</p>}
                </div>
              ) : (
                <div className="list-group list-group-flush" style={{maxHeight: 350, overflowY: 'auto'}}>
                  {misReservas.filter(r => ['activa','pendiente','rechazada'].includes(r.estado)).map(reserva => {
                    const fechaR = new Date(reserva.fecha_reserva);
                    fechaR.setMinutes(fechaR.getMinutes() + fechaR.getTimezoneOffset());
                    const hoyList = new Date(); hoyList.setHours(0,0,0,0);
                    const esPasadaOHoy = fechaR <= hoyList;
                    const badgeMap = { pendiente: 'bg-warning text-dark', activa: 'bg-success', rechazada: 'bg-danger', cancelada: 'bg-secondary' };
                    const labelMap = { pendiente: 'Pendiente', activa: 'Aprobada', rechazada: 'Rechazada', cancelada: 'Cancelada' };
                    const puedeCancelar = !esPasadaOHoy && (reserva.estado === 'activa' || reserva.estado === 'pendiente');
                    
                    return (
                      <div key={reserva.id_reserva} className={`list-group-item px-0 py-3 border-bottom-dashed ${esPasadaOHoy && reserva.estado === 'activa' ? 'opacity-50' : ''}`}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="d-flex gap-3">
                            <div className={`rounded px-3 py-2 text-center ${esPasadaOHoy && reserva.estado === 'activa' ? 'bg-secondary bg-opacity-10' : 'bg-primary bg-opacity-10'}`}>
                               <div className={`small fw-bold ${esPasadaOHoy && reserva.estado === 'activa' ? 'text-secondary' : 'text-primary'}`}>{fechaR.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}</div>
                               <div className={`fs-5 fw-bold ${esPasadaOHoy && reserva.estado === 'activa' ? 'text-secondary' : 'text-primary'}`} style={{lineHeight: 1}}>{fechaR.getDate()}</div>
                            </div>
                            <div>
                               {puedeGestionar && <div className="small fw-bold text-muted mb-1">Apt {reserva.id_apartamento} - {reserva.nombre_titular}</div>}
                               <h6 className="mb-1 fw-semibold">Reserva Salón Social</h6>
                               {esPasadaOHoy && reserva.estado === 'activa' ? (
                                 <span className="badge bg-secondary small">Finalizada</span>
                               ) : (
                                 <span className={`badge ${badgeMap[reserva.estado]} small`}>{labelMap[reserva.estado]}</span>
                               )}
                               {reserva.estado === 'rechazada' && reserva.motivo_rechazo && (
                                 <div className="small text-danger mt-1"><i className="bi bi-info-circle me-1"></i>{reserva.motivo_rechazo}</div>
                               )}
                            </div>
                          </div>
                          {puedeCancelar && (
                            <button 
                              className="btn btn-sm btn-outline-danger" 
                              onClick={() => cancelarReserva(reserva.id_reserva)}
                              title="Cancelar reserva"
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          )}
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

      {/* Panel Admin: Reservas Pendientes */}
      {puedeGestionar && pendientes.length > 0 && (
        <div className="card shadow-sm border-0 mt-4">
          <div className="card-body">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="rounded-3 p-2 bg-warning bg-opacity-10">
                <i className="bi bi-hourglass-split text-warning"></i>
              </div>
              <h6 className="fw-semibold mb-0">Solicitudes Pendientes</h6>
              <span className="badge bg-warning text-dark rounded-pill">{pendientes.length}</span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="small fw-semibold text-muted">Apartamento</th>
                    <th className="small fw-semibold text-muted">Titular</th>
                    <th className="small fw-semibold text-muted">Fecha Solicitada</th>
                    <th className="small fw-semibold text-muted">Fecha Solicitud</th>
                    <th className="small fw-semibold text-muted text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendientes.map(p => {
                    const fR = new Date(p.fecha_reserva); fR.setMinutes(fR.getMinutes() + fR.getTimezoneOffset());
                    const fC = new Date(p.fecha_creacion);
                    return (
                      <tr key={p.id_reserva}>
                        <td>Apt {p.id_apartamento}</td>
                        <td>{p.nombre_titular}</td>
                        <td className="fw-medium">{fR.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="small text-muted">{fC.toLocaleDateString('es-ES')}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-success me-1" onClick={() => autorizarReserva(p.id_reserva)} disabled={procesando} title="Autorizar">
                            <i className="bi bi-check-lg"></i>
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => { setModalRechazo(p.id_reserva); setMotivoRechazo(''); }} title="Rechazar">
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
                    {puedeGestionar 
                      ? 'Como administrador/supervisor, la reserva se aprobará automáticamente.'
                      : 'Tu solicitud será enviada al administrador para su aprobación. Recibirás la confirmación una vez autorizada.'}
                  </div>

                  {puedeGestionar && (
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

      {/* Modal de rechazo */}
      {modalRechazo && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-danger text-white border-bottom-0 rounded-top">
                  <h5 className="modal-title fw-bold">Rechazar Reserva</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setModalRechazo(null)}></button>
                </div>
                <div className="modal-body p-4">
                  <p className="text-muted">Indica el motivo del rechazo (opcional):</p>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Ej: Salón en mantenimiento ese día..."
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                  />
                </div>
                <div className="modal-footer bg-light border-top-0 rounded-bottom">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setModalRechazo(null)}>Cancelar</button>
                  <button type="button" className="btn btn-danger" onClick={rechazarReserva} disabled={procesando}>
                    {procesando ? <><span className="spinner-border spinner-border-sm me-2"></span>Procesando...</> : 'Confirmar Rechazo'}
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