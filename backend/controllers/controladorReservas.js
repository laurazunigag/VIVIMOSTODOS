const ModeloReserva = require('../models/modeloReserva');

const controladorReservas = {
  obtenerTodas: async (req, res) => {
    try {
      const reservas = await ModeloReserva.obtenerTodas();
      res.json({ exito: true, datos: reservas });
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
  },

  obtenerPorMes: async (req, res) => {
    try {
      const { year, month } = req.query;
      if (!year || !month) return res.status(400).json({ mensaje: 'Faltan parámetros year y month' });
      
      const reservas = await ModeloReserva.obtenerPorMes(parseInt(year), parseInt(month));
      res.json({ exito: true, datos: reservas });
    } catch (error) {
      console.error('Error al obtener reservas por mes:', error);
      res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
  },

  obtenerMisReservas: async (req, res) => {
    try {
      const idApartamento = req.usuario.idApartamento;
      const reservas = await ModeloReserva.obtenerPorUsuario(idApartamento);
      res.json({ exito: true, datos: reservas });
    } catch (error) {
      console.error('Error al obtener reservas del usuario:', error);
      res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
  },

  crear: async (req, res) => {
    try {
      const { fecha_reserva } = req.body;
      let id_apartamento = req.body.id_apartamento;
      if (req.usuario.rol === 'residente') {
        id_apartamento = req.usuario.idApartamento;
      }

      if (!id_apartamento || !fecha_reserva) {
        return res.status(400).json({ exito: false, mensaje: 'Faltan campos requeridos' });
      }

      // Validar si la fecha es en el pasado
      const hoy = new Date();
      hoy.setHours(0,0,0,0);
      const fechaReq = new Date(fecha_reserva + "T00:00:00");
      if (fechaReq < hoy) {
        return res.status(400).json({ exito: false, mensaje: 'No puedes reservar una fecha en el pasado' });
      }

      // Validar disponibilidad
      const disponible = await ModeloReserva.verificarDisponibilidad(fecha_reserva);
      if (!disponible) {
        return res.status(400).json({ exito: false, mensaje: 'Esa fecha ya se encuentra reservada. Por favor, elige otra.' });
      }

      const resultado = await ModeloReserva.crear({
        idApartamento: id_apartamento,
        fechaReserva: fecha_reserva
      });

      res.status(201).json({ 
        exito: true, 
        mensaje: 'Reserva confirmada exitosamente',
        id_reserva: resultado.insertId 
      });
    } catch (error) {
      console.error('Error al crear reserva:', error);
      if (error.code === 'ER_DUP_ENTRY') {
         return res.status(400).json({ exito: false, mensaje: 'Esa fecha ya se encuentra reservada.' });
      }
      res.status(500).json({ exito: false, mensaje: 'Error interno del servidor al crear reserva' });
    }
  },

  cancelar: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Obtener el registro actual para verificar pertenencia si es residente
      const reservas = await ModeloReserva.obtenerPorUsuario(req.usuario.idApartamento);
      const reserva = (req.usuario.rol === 'administrador' || req.usuario.rol === 'supervisor') 
        ? true  // admin y sup pueden cancelar todo
        : reservas.find(r => r.id_reserva === parseInt(id));

      if (!reserva) {
        return res.status(403).json({ exito: false, mensaje: 'No tienes permiso para cancelar esta reserva' });
      }

      await ModeloReserva.cancelar(id);
      res.json({ exito: true, mensaje: 'Reserva cancelada correctamente' });
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      res.status(500).json({ exito: false, mensaje: 'Error al procesar la cancelación' });
    }
  }
};

module.exports = controladorReservas;
