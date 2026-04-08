const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const encabezadoAuth = req.headers['authorization'];

  if (!encabezadoAuth) {
    return res.status(401).json({
      exito: false,
      mensaje: 'Token de acceso no proporcionado',
    });
  }

  const token = encabezadoAuth.startsWith('Bearer ')
    ? encabezadoAuth.slice(7)
    : encabezadoAuth;

  try {
    const datosDecodificados = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = datosDecodificados;
    next();
  } catch (error) {
    return res.status(401).json({
      exito: false,
      mensaje: 'Token inválido o expirado',
    });
  }
};

const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        exito: false,
        mensaje: 'No autenticado',
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tiene permisos para realizar esta acción',
      });
    }

    next();
  };
};

module.exports = { verificarToken, verificarRol };