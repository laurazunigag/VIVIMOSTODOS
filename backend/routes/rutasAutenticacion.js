const express = require('express');
const enrutador = express.Router();
const ControladorAutenticacion = require('../controllers/controladorAutenticacion');
const { verificarToken } = require('../middlewares/autenticacion');

// POST /api/auth/login
enrutador.post('/login', ControladorAutenticacion.iniciarSesion);

// GET /api/auth/verificar
enrutador.get('/verificar', verificarToken, ControladorAutenticacion.verificarToken);

module.exports = enrutador;