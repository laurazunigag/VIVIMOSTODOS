const { poolConexion } = require('../config/baseDatos');

class ModeloReserva {
  // Obtener todas las reservas de un mes y año específicos (para el calendario)
  static async obtenerPorMes(year, month) {
    // month is 1-12
    const fechaInicio = `${year}-${month.toString().padStart(2, '0')}-01`;
    // Calculamos el próximo mes para el límite superior
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const fechaFin = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;

    const [filas] = await poolConexion.query(`
      SELECT r.id_reserva, r.fecha_reserva, r.estado, r.motivo_rechazo, u.nombre_titular, u.id_apartamento
      FROM reservas r
      JOIN usuarios u ON r.id_apartamento = u.id_apartamento
      WHERE r.fecha_reserva >= ? AND r.fecha_reserva < ?
      ORDER BY r.fecha_reserva ASC
    `, [fechaInicio, fechaFin]);
    return filas;
  }

  static async obtenerTodas() {
    const [filas] = await poolConexion.query(`
      SELECT r.id_reserva, r.fecha_reserva, r.estado, r.motivo_rechazo, r.fecha_creacion, u.nombre_titular, u.id_apartamento
      FROM reservas r
      JOIN usuarios u ON r.id_apartamento = u.id_apartamento
      ORDER BY r.fecha_reserva DESC
    `);
    return filas;
  }

  static async obtenerPorUsuario(idApartamento) {
    const [filas] = await poolConexion.query(`
      SELECT * FROM reservas
      WHERE id_apartamento = ?
      ORDER BY fecha_reserva DESC
    `, [idApartamento]);
    return filas;
  }

  static async obtenerPendientes() {
    const [filas] = await poolConexion.query(`
      SELECT r.id_reserva, r.fecha_reserva, r.estado, r.fecha_creacion, u.nombre_titular, u.id_apartamento
      FROM reservas r
      JOIN usuarios u ON r.id_apartamento = u.id_apartamento
      WHERE r.estado = 'pendiente'
      ORDER BY r.fecha_reserva ASC
    `);
    return filas;
  }

  static async contarPendientes() {
    const [filas] = await poolConexion.query(
      "SELECT COUNT(*) as total FROM reservas WHERE estado = 'pendiente'"
    );
    return filas[0].total;
  }
  
  static async tieneReservaActiva(idApartamento, fecha) {
    const [filas] = await poolConexion.query(`
      SELECT id_reserva FROM reservas
      WHERE id_apartamento = ? AND fecha_reserva = ? AND estado = 'activa'
    `, [idApartamento, fecha]);
    return filas.length > 0;
  }

  static async verificarDisponibilidad(fechaReserva) {
    const [filas] = await poolConexion.query(
      'SELECT id_reserva FROM reservas WHERE fecha_reserva = ? AND estado IN ("activa", "pendiente")', 
      [fechaReserva]
    );
    return filas.length === 0;
  }

  static async crear({ idApartamento, fechaReserva, estadoInicial = 'pendiente' }) {
    const [resultado] = await poolConexion.query(
      'INSERT INTO reservas (id_apartamento, fecha_reserva, estado) VALUES (?, ?, ?)',
      [idApartamento, fechaReserva, estadoInicial]
    );
    return resultado;
  }

  static async autorizar(idReserva) {
    const [resultado] = await poolConexion.query(
      'UPDATE reservas SET estado = "activa", motivo_rechazo = NULL WHERE id_reserva = ? AND estado = "pendiente"',
      [idReserva]
    );
    if (resultado.affectedRows === 0) {
      throw new Error('Reserva no encontrada o no está en estado pendiente');
    }
    return resultado;
  }

  static async rechazar(idReserva, motivo = null) {
    const [resultado] = await poolConexion.query(
      'UPDATE reservas SET estado = "rechazada", motivo_rechazo = ? WHERE id_reserva = ? AND estado = "pendiente"',
      [motivo, idReserva]
    );
    if (resultado.affectedRows === 0) {
      throw new Error('Reserva no encontrada o no está en estado pendiente');
    }
    return resultado;
  }

  static async cancelar(idReserva) {
    const [resultado] = await poolConexion.query(
      'UPDATE reservas SET estado = "cancelada" WHERE id_reserva = ? AND estado IN ("activa", "pendiente")',
      [idReserva]
    );
    return resultado;
  }
}

module.exports = ModeloReserva;
