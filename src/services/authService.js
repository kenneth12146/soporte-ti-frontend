import api from './api';

const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, usuario } = res.data;

    const usuarioNormalizado = {
      ...usuario,
      id: usuario.id_usuario,
      nombre: usuario.nombre || usuario.nombre_completo,
    };

    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuarioNormalizado));
    return usuarioNormalizado;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  getUsuario: () => {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  },

  getToken: () => localStorage.getItem('token'),

  isAuthenticated: () => !!localStorage.getItem('token'),
};

export default authService;
