const ModeloPrestamo = require('../models/modeloPrestamo');
const ModeloReserva = require('../models/modeloReserva');

const controladorPrestamos = {
  obtenerTodos: async (req, res) => {
    try {
      const prestamos = await ModeloPrestamo.obtenerTodos();
      res.json({ exito: true, datos: prestamos });
    } catch (error) {
      console.error('Error al obtener préstamos:', error);
      res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
  },

  obtenerMisPrestamos: async (req, res) => {
    try {
      const idApartamento = req.usuario.idApartamento;
      const prestamos = await ModeloPrestamo.obtenerPorUsuario(idApartamento);
      res.json({ exito: true, datos: prestamos });
    } catch (error) {
      console.error('Error al obtener préstamos del usuario:', error);
      res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
  },

  crear: async (req, res) => {
    try {
      const { id_inventario, cantidad, fecha_devolucion_esperada, fecha_uso } = req.body;
      
      let id_apartamento = req.body.id_apartamento;
      if (req.usuario.rol === 'residente') {
        id_apartamento = req.usuario.idApartamento;
      }
      
      if (!id_apartamento || !id_inventario || !cantidad || !fecha_uso) {
        return res.status(400).json({ exito: false, mensaje: 'Faltan campos requeridos, incluyendo la fecha de reserva (fecha_uso).' });
      }

      // Validar que el apartamento tenga una reserva activa para la fecha indicada
      if (req.usuario.rol === 'residente') {
        const tieneReserva = await ModeloReserva.tieneReservaActiva(id_apartamento, fecha_uso);
        if (!tieneReserva) {
          return res.status(403).json({ 
            exito: false, 
            mensaje: 'No tienes una reserva activa para la fecha seleccionada. Por favor agenda el salón primero.' 
          });
        }
      }

      const fechaEsperada = fecha_devolucion_esperada ? new Date(fecha_devolucion_esperada) : null;

      // Validar la restricción máxima de 3 días desde la fecha de uso (reserva)
      if (fechaEsperada) {
        const limiteMaximoStr = `${fecha_uso}T23:59:59`;
        const limiteMaximo = new Date(limiteMaximoStr);
        limiteMaximo.setDate(limiteMaximo.getDate() + 3);

        if (fechaEsperada > limiteMaximo) {
          return res.status(400).json({ 

            exito: false, 
            mensaje: 'La devolución máxima permitida es de 3 días exactos posteriores a la reserva.' 
          });
        }
      }
      
      const resultado = await ModeloPrestamo.crear({
        idApartamento: id_apartamento,
        idInventario: id_inventario,
        cantidad,
        fechaDevolucionEsperada: fechaEsperada,
        fechaUso: fecha_uso
      });

      res.status(201).json({ 
        exito: true, 
        mensaje: 'Préstamo creado correctamente',
        id_prestamo: resultado.insertId 
      });
    } catch (error) {
      console.error('Error al crear préstamo:', error);
      if (error.message === 'Cantidad insuficiente en inventario') {
        return res.status(400).json({ exito: false, mensaje: error.message });
      }
      res.status(500).json({ exito: false, mensaje: 'Error interno del servidor al crear préstamo' });
    }
  },

  devolver: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (req.usuario.rol === 'residente') {
        await ModeloPrestamo.solicitarDevolucion(id);
        res.json({ exito: true, mensaje: 'Devolución solicitada.' });
      } else {
        await ModeloPrestamo.confirmarDevolucion(id);
        res.json({ exito: true, mensaje: 'Insumo devuelto correctamente al inventario.' });
      }
    } catch (error) {
      console.error('Error al devolver préstamo:', error);
      if (error.message.includes('no encontrado') || error.message.includes('ya ha sido devuelto') || error.message.includes('procesado')) {
        return res.status(400).json({ exito: false, mensaje: error.message });
      }
      res.status(500).json({ exito: false, mensaje: 'Error interno del servidor al procesar devolución' });
    }
  }
};

module.exports = controladorPrestamos;
