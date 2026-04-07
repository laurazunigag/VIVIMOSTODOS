const manejoErrores = (error, req, res, next) => {
  console.error('Error no controlado:', error);

  const codigoEstado = error.statusCode || 500;
  const mensaje = error.message || 'Error interno del servidor';

  return res.status(codigoEstado).json({
    exito: false,
    mensaje,
  });
};

module.exports = manejoErrores;