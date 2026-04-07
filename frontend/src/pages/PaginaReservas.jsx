export default function PaginaReservas() {
  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const hoy = new Date();
  const mesActual = hoy.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  const diasDelMes = ultimoDia.getDate();
  const inicioSemana = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;

  const celdas = [];
  for (let i = 0; i < inicioSemana; i++) celdas.push(null);
  for (let d = 1; d <= diasDelMes; d++) celdas.push(d);

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Reservas del Salón</h4>
        <p className="text-muted small mb-0">Módulo de reservas del salón social</p>
      </div>

      {/* Aviso */}
      <div className="alert alert-warning d-flex align-items-start gap-2" role="alert">
        <i className="bi bi-info-circle mt-1"></i>
        <div>
          <strong className="small">Módulo en Desarrollo</strong>
          <p className="small mb-0 mt-1">
            El módulo de reservas se encuentra en fase de preparación. Próximamente podrá reservar el salón social,
            consultar disponibilidad y gestionar sus eventos.
          </p>
        </div>
      </div>

      <div className="row g-3">
        {/* Calendario */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="rounded-3 p-2 bg-primary bg-opacity-10">
                  <i className="bi bi-calendar3 text-primary"></i>
                </div>
                <div>
                  <h6 className="fw-semibold mb-0">Calendario</h6>
                  <small className="text-muted text-capitalize">{mesActual}</small>
                </div>
              </div>

              <div className="row g-0 text-center mb-1">
                {diasSemana.map((dia) => (
                  <div key={dia} className="col small fw-semibold text-muted py-1">
                    {dia}
                  </div>
                ))}
              </div>
              <div className="row g-0 text-center">
                {celdas.map((dia, idx) => (
                  <div key={idx} className="col py-1">
                    {dia !== null && (
                      <span
                        className={`d-inline-flex align-items-center justify-content-center rounded-circle small ${
                          dia === hoy.getDate()
                            ? 'bg-azul-oscuro text-white fw-bold'
                            : 'text-dark'
                        }`}
                        style={{ width: 32, height: 32 }}
                      >
                        {dia}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Próximas funcionalidades */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="rounded-3 p-2 bg-success bg-opacity-10">
                  <i className="bi bi-clock text-success"></i>
                </div>
                <h6 className="fw-semibold mb-0">Próximas Funcionalidades</h6>
              </div>

              {[
                { titulo: 'Crear Reserva', descripcion: 'Seleccione fecha y horario para reservar el salón social.' },
                { titulo: 'Visualizar Disponibilidad', descripcion: 'Consulte en tiempo real qué fechas están disponibles.' },
                { titulo: 'Historial de Reservas', descripcion: 'Revise el historial completo de reservas realizadas.' },
                { titulo: 'Notificaciones', descripcion: 'Reciba recordatorios y confirmaciones automáticas.' },
              ].map((item, idx) => (
                <div key={idx} className="d-flex align-items-start gap-2 p-2 rounded bg-light mb-2">
                  <span
                    className="badge rounded-circle bg-azul-oscuro d-flex align-items-center justify-content-center"
                    style={{ width: 24, height: 24, fontSize: 11 }}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div className="small fw-semibold">{item.titulo}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>{item.descripcion}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}