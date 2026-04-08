const ModeloPrestamo = require('../models/modeloPrestamo');

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
      const { id_inventario, cantidad, fecha_devolucion_esperada } = req.body;
      
      let id_apartamento = req.body.id_apartamento;
      if (req.usuario.rol === 'residente') {
        id_apartamento = req.usuario.idApartamento;
      }
      
      if (!id_apartamento || !id_inventario || !cantidad) {
        return res.status(400).json({ exito: false, mensaje: 'Faltan campos requeridos' });
      }

      const fechaEsperada = fecha_devolucion_esperada ? new Date(fecha_devolucion_esperada) : null;
      
      const resultado = await ModeloPrestamo.crear({
        idApartamento: id_apartamento,
        idInventario: id_inventario,
        cantidad,
        fechaDevolucionEsperada: fechaEsperada
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
