const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { verificarConexion } = require('./config/baseDatos');
const manejoErrores = require('./middlewares/manejoErrores');

// Importar rutas
const rutasAutenticacion = require('./routes/rutasAutenticacion');
const rutasUsuarios = require('./routes/rutasUsuarios');
const rutasInventario = require('./routes/rutasInventario');
<<<<<<< HEAD
=======
const rutasPrestamos = require('./routes/rutasPrestamos');
>>>>>>> 56c8acadeeaed21fba6a51dd9e109d2c25545bbf

const app = express();
const PUERTO = process.env.PORT || 5000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/auth', rutasAutenticacion);
app.use('/api/usuarios', rutasUsuarios);
app.use('/api/inventario', rutasInventario);
<<<<<<< HEAD
=======
app.use('/api/prestamos', rutasPrestamos);
>>>>>>> 56c8acadeeaed21fba6a51dd9e109d2c25545bbf

// Ruta de verificación
app.get('/api/salud', (req, res) => {
  res.json({ exito: true, mensaje: 'Servidor funcionando correctamente' });
});

<<<<<<< HEAD
=======
// Middleware de manejo de errores
>>>>>>> 56c8acadeeaed21fba6a51dd9e109d2c25545bbf
app.use(manejoErrores);

// Iniciar servidor
const iniciarServidor = async () => {
  await verificarConexion();
  app.listen(PUERTO, () => {
<<<<<<< HEAD
    console.log(`Servidor ejecutándose en http://localhost:${PUERTO}`);
    console.log(`API disponible en http://localhost:${PUERTO}/api`);
=======
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PUERTO}`);
    console.log(`📡 API disponible en http://localhost:${PUERTO}/api`);
>>>>>>> 56c8acadeeaed21fba6a51dd9e109d2c25545bbf
  });
};

iniciarServidor();