import api from './api';

const catalogoService = {
  categorias: () => api.get('/catalogos/categorias'),
  subcategorias: (idCategoria) => api.get(`/catalogos/subcategorias?id_categoria=${idCategoria}`),
  prioridades: () => api.get('/catalogos/prioridades'),
  estados: () => api.get('/catalogos/estados'),
  departamentos: () => api.get('/catalogos/departamentos'),
  activos: () => api.get('/catalogos/activos'),
  agentes: () => api.get('/usuarios').then(res => {
    const data = res.data?.usuarios || res.data || [];
    return data.filter(u => u.roles?.includes('Agente'));
  }),
};

export default catalogoService;
