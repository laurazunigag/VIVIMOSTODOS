const express = require('express');
const router = express.Router();
const controladorReservas = require('../controllers/controladorReservas');
const { verificarToken, verificarRol } = require('../middlewares/autenticacion');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas de administración (admin y supervisor)
router.get('/pendientes', verificarRol('administrador', 'supervisor'), controladorReservas.obtenerPendientes);
router.get('/contar-pendientes', verificarRol('administrador', 'supervisor'), controladorReservas.contarPendientes);
router.put('/:id/autorizar', verificarRol('administrador', 'supervisor'), controladorReservas.autorizar);
router.put('/:id/rechazar', verificarRol('administrador', 'supervisor'), controladorReservas.rechazar);

// Rutas generales
router.get('/', controladorReservas.obtenerTodas);
router.get('/mes', controladorReservas.obtenerPorMes);
router.get('/mias', controladorReservas.obtenerMisReservas);
router.post('/', controladorReservas.crear);
router.put('/:id/cancelar', controladorReservas.cancelar);

module.exports = router;
