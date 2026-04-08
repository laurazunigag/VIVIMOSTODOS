import axios from 'axios';

const apiCliente = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a cada petición
apiCliente.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token_salon');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiCliente.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Token inválido o credenciales incorrectas");
    }

    return Promise.reject(error);
  }
);
// Interceptor para manejar errores de autenticación

//VERSIÓN ANTERIOR
    //if (error.response && error.response.status === 401) {
   //   localStorage.removeItem('token_salon');
   //   localStorage.removeItem('usuario_salon');
    //  window.location.href = '/login';
  //  }
  //  return Promise.reject(error);


// ==================== AUTENTICACIÓN ====================
export const servicioAuth = {
  iniciarSesion: (idApartamento, contrasena) =>
    apiCliente.post('/auth/login', { idApartamento, contrasena }),

  verificarToken: () =>
    apiCliente.get('/auth/verificar'),
};

// ==================== USUARIOS ====================
export const servicioUsuarios = {
  obtenerTodos: () =>
    apiCliente.get('/usuarios'),

  obtenerPorId: (idApartamento) =>
    apiCliente.get(`/usuarios/${idApartamento}`),

  crear: (datosUsuario) =>
    apiCliente.post('/usuarios', datosUsuario),

  actualizar: (idApartamento, datosUsuario) =>
    apiCliente.put(`/usuarios/${idApartamento}`, datosUsuario),

  cambiarEstado: (idApartamento, estado) =>
    apiCliente.patch(`/usuarios/${idApartamento}/estado`, { estado }),

  obtenerEstadisticas: () =>
    apiCliente.get('/usuarios/estadisticas'),
};

// ==================== INVENTARIO ====================
export const servicioInventario = {
  obtenerTodos: () =>
    apiCliente.get('/inventario'),

  obtenerPorId: (idInventario) =>
    apiCliente.get(`/inventario/${idInventario}`),

  crear: (datosInsumo) =>
    apiCliente.post('/inventario', datosInsumo),

  actualizar: (idInventario, datosInsumo) =>
    apiCliente.put(`/inventario/${idInventario}`, datosInsumo),

  eliminar: (idInventario) =>
    apiCliente.delete(`/inventario/${idInventario}`),

  obtenerEstadisticas: () =>
    apiCliente.get('/inventario/estadisticas'),
};

export default apiCliente;