const express = require('express');
const enrutador = express.Router();
const ControladorUsuarios = require('../controllers/controladorUsuarios');
const { verificarToken, verificarRol } = require('../middlewares/autenticacion');

// Todas las rutas requieren autenticación
enrutador.use(verificarToken);

// GET /api/usuarios/estadisticas
enrutador.get('/estadisticas', ControladorUsuarios.obtenerEstadisticas);

// GET /api/usuarios
enrutador.get('/', verificarRol('administrador', 'supervisor'), ControladorUsuarios.obtenerTodos);

// GET /api/usuarios/:idApartamento
enrutador.get('/:idApartamento', verificarRol('administrador'), ControladorUsuarios.obtenerPorId);

// POST /api/usuarios
enrutador.post('/', verificarRol('administrador'), ControladorUsuarios.crear);

// PUT /api/usuarios/:idApartamento
enrutador.put('/:idApartamento', verificarRol('administrador'), ControladorUsuarios.actualizar);

// PATCH /api/usuarios/:idApartamento/estado
enrutador.patch('/:idApartamento/estado', verificarRol('administrador'), ControladorUsuarios.cambiarEstado);

module.exports = enrutador;