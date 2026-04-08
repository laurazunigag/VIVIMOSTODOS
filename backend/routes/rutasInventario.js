const express = require('express');
const enrutador = express.Router();
const ControladorInventario = require('../controllers/controladorInventario');
const { verificarToken, verificarRol } = require('../middlewares/autenticacion');

// Todas las rutas requieren autenticación
enrutador.use(verificarToken);

// GET /api/inventario/estadisticas
enrutador.get('/estadisticas', ControladorInventario.obtenerEstadisticas);

// GET /api/inventario
enrutador.get('/', ControladorInventario.obtenerTodos);

// GET /api/inventario/:idInventario
enrutador.get('/:idInventario', ControladorInventario.obtenerPorId);

// POST /api/inventario (admin y supervisor)
enrutador.post('/', verificarRol('administrador', 'supervisor'), ControladorInventario.crear);

// PUT /api/inventario/:idInventario (admin y supervisor)
enrutador.put('/:idInventario', verificarRol('administrador', 'supervisor'), ControladorInventario.actualizar);

// DELETE /api/inventario/:idInventario (solo admin)
enrutador.delete('/:idInventario', verificarRol('administrador'), ControladorInventario.eliminar);

module.exports = enrutador;