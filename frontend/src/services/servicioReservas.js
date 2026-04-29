import api from './servicioApi';

export const servicioReservas = {
  obtenerTodas: () => api.get('/reservas'),
  obtenerPorMes: (year, month) => api.get(`/reservas/mes?year=${year}&month=${month}`),
  obtenerMisReservas: () => api.get('/reservas/mias'),
  obtenerPendientes: () => api.get('/reservas/pendientes'),
  contarPendientes: () => api.get('/reservas/contar-pendientes'),
  crear: (datos) => api.post('/reservas', datos),
  cancelar: (id) => api.put(`/reservas/${id}/cancelar`),
  autorizar: (id) => api.put(`/reservas/${id}/autorizar`),
  rechazar: (id, motivo) => api.put(`/reservas/${id}/rechazar`, { motivo }),
};
