const { poolConexion } = require('../config/baseDatos');

const ModeloPrestamo = {
  obtenerTodos: async () => {
    const [filas] = await poolConexion.query(`
      SELECT p.*, i.nombre_insumo, u.nombre_titular 
      FROM prestamos_insumos p
      JOIN inventario i ON p.id_inventario = i.id_inventario
      JOIN usuarios u ON p.id_apartamento = u.id_apartamento
      ORDER BY FIELD(p.estado, 'pendiente_devolucion', 'activo', 'devuelto'), p.fecha_prestamo DESC
    `);
    return filas;
  },

  obtenerPorUsuario: async (idApartamento) => {
    const [filas] = await poolConexion.query(`
      SELECT p.*, i.nombre_insumo 
      FROM prestamos_insumos p
      JOIN inventario i ON p.id_inventario = i.id_inventario
      WHERE p.id_apartamento = ?
      ORDER BY p.fecha_prestamo DESC
    `, [idApartamento]);
    return filas;
  },

  crear: async (datosPrestamo) => {
    const { idApartamento, idInventario, cantidad, fechaDevolucionEsperada } = datosPrestamo;
    const conexion = await poolConexion.getConnection();
    
    try {
      await conexion.beginTransaction();

      // Verificar cantidad disponible
      const [inventario] = await conexion.query(
        'SELECT cantidad_disponible FROM inventario WHERE id_inventario = ? FOR UPDATE',
        [idInventario]
      );

      if (inventario.length === 0 || inventario[0].cantidad_disponible < cantidad) {
        throw new Error('Cantidad insuficiente en inventario');
      }

      // Restar del inventario
      await conexion.query(
        'UPDATE inventario SET cantidad_disponible = cantidad_disponible - ? WHERE id_inventario = ?',
        [cantidad, idInventario]
      );

      // Crear préstamo
      const [resultado] = await conexion.query(
        'INSERT INTO prestamos_insumos (id_apartamento, id_inventario, cantidad, fecha_devolucion_esperada, fecha_uso, estado) VALUES (?, ?, ?, ?, ?, "activo")',
        [idApartamento, idInventario, cantidad, fechaDevolucionEsperada, datosPrestamo.fechaUso]
      );

      await conexion.commit();
      return resultado;
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  },

  solicitarDevolucion: async (idPrestamo) => {
    const [resultado] = await poolConexion.query(
      'UPDATE prestamos_insumos SET estado = "pendiente_devolucion" WHERE id_prestamo = ? AND estado = "activo"',
      [idPrestamo]
    );
    if (resultado.affectedRows === 0) {
      throw new Error('Préstamo no encontrado o ya procesado');
    }
    return resultado;
  },

  confirmarDevolucion: async (idPrestamo) => {
    const conexion = await poolConexion.getConnection();
    
    try {
      await conexion.beginTransaction();

      // Obtener datos del préstamo
      const [prestamos] = await conexion.query(
        'SELECT id_inventario, cantidad, estado FROM prestamos_insumos WHERE id_prestamo = ? FOR UPDATE',
        [idPrestamo]
      );

      if (prestamos.length === 0) {
        throw new Error('Préstamo no encontrado');
      }

      if (prestamos[0].estado === 'devuelto') {
        throw new Error('El préstamo ya ha sido devuelto');
      }

      const { id_inventario, cantidad } = prestamos[0];

      // Marcar como devuelto
      const [resultado] = await conexion.query(
        'UPDATE prestamos_insumos SET estado = "devuelto", fecha_devolucion_real = NOW() WHERE id_prestamo = ?',
        [idPrestamo]
      );

      // Sumar al inventario
      await conexion.query(
        'UPDATE inventario SET cantidad_disponible = cantidad_disponible + ? WHERE id_inventario = ?',
        [cantidad, id_inventario]
      );

      await conexion.commit();
      return resultado;
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  }
};

module.exports = ModeloPrestamo;
