const express = require('express');
const enrutador = express.Router();
const ControladorAutenticacion = require('../controllers/controladorAutenticacion');
const { verificarToken } = require('../middlewares/autenticacion');

<<<<<<< HEAD
enrutador.post('/login', ControladorAutenticacion.iniciarSesion);

=======
// POST /api/auth/login
enrutador.post('/login', ControladorAutenticacion.iniciarSesion);

// GET /api/auth/verificar
>>>>>>> 56c8acadeeaed21fba6a51dd9e109d2c25545bbf
enrutador.get('/verificar', verificarToken, ControladorAutenticacion.verificarToken);

module.exports = enrutador;