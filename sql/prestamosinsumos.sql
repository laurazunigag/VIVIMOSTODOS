CREATE TABLE IF NOT EXISTS prestamos_insumos (
    id_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    id_apartamento INT NOT NULL,
    id_inventario INT NOT NULL,
    cantidad INT NOT NULL,
    fecha_prestamo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion TIMESTAMP NULL,
    estado ENUM('activo', 'devuelto') DEFAULT 'activo',
    FOREIGN KEY (id_apartamento) REFERENCES usuarios(id_apartamento),
    FOREIGN KEY (id_inventario) REFERENCES inventario(id_inventario)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;