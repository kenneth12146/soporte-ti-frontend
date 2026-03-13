import api from './api';

const comentarioService = {
  listar: (idTicket) => api.get(`/tickets/${idTicket}/comentarios`),
  crear: (idTicket, data) => api.post(`/tickets/${idTicket}/comentarios`, data),
};

export default comentarioService;
