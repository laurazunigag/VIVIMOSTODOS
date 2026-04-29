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

  obtenerPendientes: async (req, res) => {
    try {
      const reservas = await ModeloReserva.obtenerPendientes();
      res.json({ exito: true, datos: reservas });
    } catch (error) {
      console.error('Error al obtener reservas pendientes:', error);
      res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
  },

  contarPendientes: async (req, res) => {
    try {
      const total = await ModeloReserva.contarPendientes();
      res.json({ exito: true, datos: { total } });
    } catch (error) {
      console.error('Error al contar pendientes:', error);
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

      // ===== VALIDACIÓN PUNTO 7: Mínimo 48 horas de anticipación =====
      const ahora = new Date();
      const fechaEvento = new Date(fecha_reserva + 'T00:00:00');
      const diffMs = fechaEvento.getTime() - ahora.getTime();
      const diffHoras = diffMs / (1000 * 60 * 60);

      if (diffHoras < 48) {
        return res.status(400).json({ 
          exito: false, 
          mensaje: 'Debes reservar con al menos 48 horas de anticipación para evitar reservas de un día para otro.' 
        });
      }

      // ===== VALIDACIÓN PUNTO 7: Máximo 90 días de anticipación =====
      const limiteMax = new Date();
      limiteMax.setHours(0, 0, 0, 0);
      limiteMax.setDate(limiteMax.getDate() + 90);

      if (fechaEvento > limiteMax) {
        return res.status(400).json({ 
          exito: false, 
          mensaje: 'No puedes reservar con más de 90 días de anticipación a partir de la fecha actual.' 
        });
      }

      // Validar disponibilidad (considera activas Y pendientes)
      const disponible = await ModeloReserva.verificarDisponibilidad(fecha_reserva);
      if (!disponible) {
        return res.status(400).json({ exito: false, mensaje: 'Esa fecha ya se encuentra reservada o tiene una solicitud pendiente. Por favor, elige otra.' });
      }

      // ===== PUNTO 6: Estado según rol =====
      // Admin y supervisor auto-aprueban, residentes quedan pendientes
      const esPrivilegiado = req.usuario.rol === 'administrador' || req.usuario.rol === 'supervisor';
      const estadoInicial = esPrivilegiado ? 'activa' : 'pendiente';

      const resultado = await ModeloReserva.crear({
        idApartamento: id_apartamento,
        fechaReserva: fecha_reserva,
        estadoInicial
      });

      const mensajeExito = esPrivilegiado 
        ? 'Reserva confirmada exitosamente'
        : 'Solicitud de reserva enviada. Espera la autorización del administrador.';

      res.status(201).json({ 
        exito: true, 
        mensaje: mensajeExito,
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

  autorizar: async (req, res) => {
    try {
      const { id } = req.params;
      await ModeloReserva.autorizar(id);
      res.json({ exito: true, mensaje: 'Reserva autorizada correctamente' });
    } catch (error) {
      console.error('Error al autorizar reserva:', error);
      if (error.message.includes('no encontrada') || error.message.includes('pendiente')) {
        return res.status(400).json({ exito: false, mensaje: error.message });
      }
      res.status(500).json({ exito: false, mensaje: 'Error al autorizar la reserva' });
    }
  },

  rechazar: async (req, res) => {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      await ModeloReserva.rechazar(id, motivo || null);
      res.json({ exito: true, mensaje: 'Reserva rechazada correctamente' });
    } catch (error) {
      console.error('Error al rechazar reserva:', error);
      if (error.message.includes('no encontrada') || error.message.includes('pendiente')) {
        return res.status(400).json({ exito: false, mensaje: error.message });
      }
      res.status(500).json({ exito: false, mensaje: 'Error al rechazar la reserva' });
    }
  },

  cancelar: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Obtener todas las reservas para encontrar la que se quiere cancelar
      const todasReservas = await ModeloReserva.obtenerTodas();
      const reservaObj = todasReservas.find(r => r.id_reserva === parseInt(id));

      if (!reservaObj) {
        return res.status(404).json({ exito: false, mensaje: 'Reserva no encontrada' });
      }

      // Validar que la fecha de la reserva no sea hoy ni en el pasado
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaReserva = new Date(reservaObj.fecha_reserva);
      fechaReserva.setHours(0, 0, 0, 0);

      if (fechaReserva <= hoy) {
        return res.status(400).json({ 
          exito: false, 
          mensaje: 'No puedes cancelar una reserva del día actual o de una fecha que ya pasó.' 
        });
      }

      // Verificar pertenencia si es residente
      const esPrivilegiado = req.usuario.rol === 'administrador' || req.usuario.rol === 'supervisor';
      if (!esPrivilegiado && reservaObj.id_apartamento !== req.usuario.idApartamento) {
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
