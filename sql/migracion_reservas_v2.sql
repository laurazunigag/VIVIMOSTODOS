-- =============================================
-- MIGRACIÓN: reservas v2
-- Agrega estados 'pendiente' y 'rechazada'
-- Agrega campo motivo_rechazo
-- =============================================

USE vivimostodos;

-- 1. Modificar el ENUM de estado para incluir 'pendiente' y 'rechazada'
ALTER TABLE reservas 
MODIFY COLUMN estado ENUM('pendiente', 'activa', 'cancelada', 'completada', 'rechazada') DEFAULT 'pendiente';

-- 2. Agregar columna para motivo de rechazo
ALTER TABLE reservas 
ADD COLUMN motivo_rechazo VARCHAR(255) NULL AFTER estado;
