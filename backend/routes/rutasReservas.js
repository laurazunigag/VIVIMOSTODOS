const express = require('express');
const router = express.Router();
const controladorReservas = require('../controllers/controladorReservas');
const { verificarToken } = require('../middlewares/autenticacion');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas generales
router.get('/', controladorReservas.obtenerTodas);
router.get('/mes', controladorReservas.obtenerPorMes);
router.get('/mias', controladorReservas.obtenerMisReservas);
router.post('/', controladorReservas.crear);
router.put('/:id/cancelar', controladorReservas.cancelar);

module.exports = router;
