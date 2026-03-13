import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const u = authService.getUsuario();
    if (u) setUsuario(u);
    setCargando(false);
  }, []);

  const login = async (email, password) => {
    const u = await authService.login(email, password);
    setUsuario(u);
    return u;
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
  };

  const tieneRol = (rol) => {
    if (!usuario?.roles) return false;
    return usuario.roles.includes(rol);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout, tieneRol }}>
      {children}
    </AuthContext.Provider>
  );
};
