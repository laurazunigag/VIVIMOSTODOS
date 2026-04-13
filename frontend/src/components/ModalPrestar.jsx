import { useState, useEffect } from 'react';
import { servicioUsuarios } from '../services/servicioApi';
import { useAuth } from '../context/ContextoAutenticacion';

export default function ModalPrestar({ insumo, onGuardar, onCerrar }) {
  const { esAdmin, esSupervisor, usuario } = useAuth();
  const puedeEditar = esAdmin || esSupervisor;
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [datosFormulario, setDatosFormulario] = useState({
    id_apartamento: puedeEditar ? '' : usuario?.id_apartamento,
    cantidad: 1,
    fecha_devolucion_esperada: ''
  });

  useEffect(() => {
    if (puedeEditar) {
      const cargarUsuarios = async () => {
        try {
          const res = await servicioUsuarios.obtenerTodos();
          setUsuarios(res.data.datos || []);
        } catch (error) {
          console.error('Error cargando usuarios:', error);
        } finally {
          setCargandoUsuarios(false);
        }
      };
      cargarUsuarios();
    }
  }, [puedeEditar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatosFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar({
      id_apartamento: parseInt(datosFormulario.id_apartamento),
      id_inventario: insumo.id_inventario,
      cantidad: parseInt(datosFormulario.cantidad),
      fecha_devolucion_esperada: datosFormulario.fecha_devolucion_esperada || null
    });
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header bg-light border-bottom-0">
              <h5 className="modal-title fw-bold">Prestar Insumo</h5>
              <button type="button" className="btn-close" onClick={onCerrar}></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="alert alert-info py-2 small mb-3">
                  <strong>Insumo:</strong> {insumo?.nombre_insumo} <br />
                  <strong>Disponible:</strong> {insumo?.cantidad_disponible} unidades
                </div>

                {puedeEditar && (
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Usuario (Apartamento)</label>
                    <select
                      className="form-select"
                      name="id_apartamento"
                      value={datosFormulario.id_apartamento}
                      onChange={handleChange}
                      required
                      disabled={cargandoUsuarios}
                    >
                      <option value="">Seleccione un apartamento...</option>
                      {usuarios.map(u => (
                        <option key={u.id_apartamento} value={u.id_apartamento}>
                          Apt {u.id_apartamento} - {u.nombre_titular}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Cantidad a prestar</label>
                  <input
                    type="number"
                    className="form-control"
                    name="cantidad"
                    min="1"
                    max={insumo?.cantidad_disponible || 1}
                    value={datosFormulario.cantidad}
                    onChange={handleChange}
                    required
                  />
                  <div className="form-text" style={{ fontSize: '0.75rem' }}>
                    Máximo disponible: {insumo?.cantidad_disponible}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Fecha límite de devolución</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    name="fecha_devolucion_esperada"
                    value={datosFormulario.fecha_devolucion_esperada}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="modal-footer border-top-0 bg-light">
                <button type="button" className="btn btn-outline-secondary" onClick={onCerrar}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-verde">
                  Confirmar Préstamo
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
