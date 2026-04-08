const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ModeloUsuario = require('../models/modeloUsuario');

const SALT_ROUNDS = 10;

const ControladorAutenticacion = {
  iniciarSesion: async (req, res) => {
    try {
      const { idApartamento, contrasena } = req.body;

      if (!idApartamento || !contrasena) {
        return res.status(400).json({
          exito: false,
          mensaje: 'El número de apartamento y la contraseña son obligatorios',
        });
      }

      const usuario = await ModeloUsuario.obtenerParaLogin(idApartamento);

      if (!usuario) {
        return res.status(401).json({
          exito: false,
          mensaje: 'Apartamento no registrado en el sistema',
        });
      }

      if (!usuario.estado) {
        return res.status(403).json({
          exito: false,
          mensaje: 'Usuario desactivado. Contacte al administrador.',
        });
      }

      const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

      if (!contrasenaValida) {
        return res.status(401).json({
          exito: false,
          mensaje: 'Contraseña incorrecta',
        });
      }

      const token = jwt.sign(
        {
          idApartamento: usuario.id_apartamento,
          rol: usuario.rol,
          nombreTitular: usuario.nombre_titular,
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      return res.json({
        exito: true,
        mensaje: 'Inicio de sesión exitoso',
        token,
        usuario: {
          idApartamento: usuario.id_apartamento,
          nombreTitular: usuario.nombre_titular,
          correo: usuario.correo,
          rol: usuario.rol,
        },
      });
    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
      });
    }
  },

  verificarToken: async (req, res) => {
    try {
      const usuario = await ModeloUsuario.obtenerPorId(req.usuario.idApartamento);
      if (!usuario) {
        return res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado' });
      }
      return res.json({
        exito: true,
        usuario: {
          idApartamento: usuario.id_apartamento,
          nombreTitular: usuario.nombre_titular,
          correo: usuario.correo,
          rol: usuario.rol,
        },
      });
    } catch (error) {
      console.error('Error verificando token:', error);
      return res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
  },
};

module.exports = ControladorAutenticacion;