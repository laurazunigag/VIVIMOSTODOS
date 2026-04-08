-- =============================================
-- BASE DE DATOS: vivimostodos
-- Sistema de Gestión de Salón Social
-- Motor: MySQL (XAMPP / phpMyAdmin)
-- =============================================

CREATE DATABASE IF NOT EXISTS vivimostodos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vivimostodos;

-- =============================================
-- TABLA: usuarios
-- =============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id_apartamento INT PRIMARY KEY,
  nombre_titular VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  rol ENUM('administrador', 'residente', 'supervisor') NOT NULL DEFAULT 'residente',
  estado TINYINT(1) DEFAULT 1,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: inventario
-- =============================================
CREATE TABLE IF NOT EXISTS inventario (
  id_inventario INT AUTO_INCREMENT PRIMARY KEY,
  nombre_insumo VARCHAR(100) NOT NULL,
  cantidad_total INT NOT NULL,
  cantidad_disponible INT NOT NULL,
  CHECK (cantidad_total >= 0),
  CHECK (cantidad_disponible >= 0 AND cantidad_disponible <= cantidad_total)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- DATOS INICIALES
-- =============================================

-- Contraseña: admin123 (hash bcrypt)
INSERT INTO usuarios (id_apartamento, nombre_titular, correo, contrasena, rol, estado)
VALUES
  (100, 'Carlos Administrador', 'admin@edificio.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOflnMHqDCMx3sqSHQfEiLqOjqN1zO5FG', 'administrador', 1),
  (101, 'María García', 'maria@edificio.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOflnMHqDCMx3sqSHQfEiLqOjqN1zO5FG', 'residente', 1),
  (102, 'Juan Pérez', 'juan@edificio.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOflnMHqDCMx3sqSHQfEiLqOjqN1zO5FG', 'residente', 1),
  (103, 'Ana Rodríguez', 'ana@edificio.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOflnMHqDCMx3sqSHQfEiLqOjqN1zO5FG', 'supervisor', 1),
  (104, 'Pedro López', 'pedro@edificio.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOflnMHqDCMx3sqSHQfEiLqOjqN1zO5FG', 'residente', 0);

INSERT INTO inventario (nombre_insumo, cantidad_total, cantidad_disponible)
VALUES
  ('Sillas plegables', 30, 25),
  ('Mesas rectangulares', 10, 8),
  ('Vasos desechables (paquete)', 50, 42),
  ('Platos desechables (paquete)', 40, 35),
  ('Manteles', 15, 12),
  ('Servilletas (paquete)', 60, 55),
  ('Hielera grande', 5, 4),
  ('Parlante portátil', 3, 2),
  ('Extensión eléctrica', 8, 7),
  ('Decoraciones festivas (set)', 10, 8);