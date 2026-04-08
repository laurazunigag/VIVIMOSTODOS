const express = require('express');
const router = express.Router();
const controladorPrestamos = require('../controllers/controladorPrestamos');
const { verificarToken } = require('../middlewares/autenticacion');

// Middleware para verificar si es administrador o supervisor
const verificarAdminOsSpervisor = (req, res, next) => {
  if (req.usuario.rol === 'administrador' || req.usuario.rol === 'supervisor') {
    next();
  } else {
    res.status(403).json({ exito: false, mensaje: 'Acceso denegado. Se requieren permisos especiales.' });
  }
};

// Rutas
router.get('/', verificarToken, verificarAdminOsSpervisor, controladorPrestamos.obtenerTodos);
router.get('/mis-prestamos', verificarToken, controladorPrestamos.obtenerMisPrestamos);
router.post('/', verificarToken, controladorPrestamos.crear);
router.put('/:id/devolver', verificarToken, controladorPrestamos.devolver);

module.exports = router;
