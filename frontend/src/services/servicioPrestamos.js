import apiCliente from './servicioApi';

export const servicioPrestamos = {
  obtenerTodos: () => apiCliente.get('/prestamos'),
  obtenerMisPrestamos: () => apiCliente.get('/prestamos/mis-prestamos'),
  crear: (datos) => apiCliente.post('/prestamos', datos),
  devolver: (id) => apiCliente.put(`/prestamos/${id}/devolver`),
};
