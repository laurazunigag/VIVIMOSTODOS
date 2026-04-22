-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-04-2026 a las 01:04:24
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;
/*!40101 SET NAMES utf8mb4 */
;
--
-- Base de datos: `vivimostodos`
--
-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `reservas`
--
CREATE TABLE `reservas` (
    `id_reserva` int(11) NOT NULL,
    `id_apartamento` int(11) NOT NULL,
    `fecha_reserva` date NOT NULL,
    `estado` enum('activa', 'cancelada', 'completada') DEFAULT 'activa',
    `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
--
-- Volcado de datos para la tabla `reservas`
--
INSERT INTO `reservas` (
        `id_reserva`,
        `id_apartamento`,
        `fecha_reserva`,
        `estado`,
        `fecha_creacion`
    )
VALUES (
        1,
        101,
        '2026-04-10',
        'cancelada',
        '2026-04-09 18:27:11'
    ),
    (
        2,
        102,
        '2026-04-16',
        'activa',
        '2026-04-09 18:29:52'
    ),
    (
        3,
        102,
        '2026-04-13',
        'activa',
        '2026-04-14 03:09:41'
    );
--
-- Índices para tablas volcadas
--
--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
ADD PRIMARY KEY (`id_reserva`),
    ADD UNIQUE KEY `fecha_reserva` (`fecha_reserva`),
    ADD KEY `id_apartamento` (`id_apartamento`);
--
-- AUTO_INCREMENT de las tablas volcadas
--
--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 4;
--
-- Restricciones para tablas volcadas
--
--
-- Filtros para la tabla `reservas`
--
ALTER TABLE `reservas`
ADD CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`id_apartamento`) REFERENCES `usuarios` (`id_apartamento`);
COMMIT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;