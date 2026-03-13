import api from './api';

const ticketService = {
  listar: (params) => api.get('/tickets', { params }),
  listarMios: (params) => api.get('/tickets', { params }),
  obtener: (id) => api.get(`/tickets/${id}`),
  crear: (data) => api.post('/tickets', data),
  cambiarEstado: (id, data) => api.put(`/tickets/${id}/estado`, data),
  asignar: (id, data) => api.put(`/tickets/${id}/asignar`, data),
  calificar: (id, data) => api.put(`/tickets/${id}/calificar`, data),
  historial: (id) => api.get(`/tickets/${id}/historial`),
};

export default ticketService;
