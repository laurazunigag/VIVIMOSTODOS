const { poolConexion } = require('./config/baseDatos');

const ejecutar = async () => {
    try {
        await poolConexion.query(`
            CREATE TABLE IF NOT EXISTS reservas (
                id_reserva INT AUTO_INCREMENT PRIMARY KEY,
                id_apartamento INT NOT NULL,
                fecha_reserva DATE NOT NULL UNIQUE,
                estado ENUM('activa', 'cancelada', 'completada') DEFAULT 'activa',
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_apartamento) REFERENCES usuarios(id_apartamento)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Tabla reservas creada correctamente.');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
ejecutar();
