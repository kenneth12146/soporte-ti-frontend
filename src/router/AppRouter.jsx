import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

import LoginPage from '../pages/auth/LoginPage';
import Layout from '../components/common/Layout';
import DashboardAdmin from '../pages/dashboard/DashboardAdmin';
import DashboardAgente from '../pages/dashboard/DashboardAgente';
import DashboardUsuario from '../pages/dashboard/DashboardUsuario';
import CrearTicketPage from '../pages/tickets/CrearTicketPage';
import MisTicketsPage from '../pages/tickets/MisTicketsPage';
import BandejaTicketsPage from '../pages/tickets/BandejaTicketsPage';
import DetalleTicketPage from '../pages/tickets/DetalleTicketPage';
import GestionUsuariosPage from '../pages/admin/GestionUsuariosPage';

const RutaPrivada = ({ children, roles }) => {
  const { usuario, cargando } = useAuth();
  if (cargando) return <LoadingSpinner />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (roles && !roles.some(r => usuario.roles?.includes(r)))
    return <Navigate to="/dashboard" replace />;
  return children;
};

const RutaDashboard = () => {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.roles?.includes('Admin')) return <Navigate to="/dashboard/admin" replace />;
  if (usuario.roles?.includes('Agente')) return <Navigate to="/dashboard/agente" replace />;
  return <Navigate to="/dashboard/usuario" replace />;
};

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<RutaPrivada><Layout /></RutaPrivada>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<RutaDashboard />} />

        <Route path="dashboard/admin" element={
          <RutaPrivada roles={['Admin']}><DashboardAdmin /></RutaPrivada>
        } />
        <Route path="dashboard/agente" element={
          <RutaPrivada roles={['Admin','Agente']}><DashboardAgente /></RutaPrivada>
        } />
        <Route path="dashboard/usuario" element={
          <RutaPrivada><DashboardUsuario /></RutaPrivada>
        } />

        <Route path="tickets/crear" element={
          <RutaPrivada><CrearTicketPage /></RutaPrivada>
        } />
        <Route path="tickets/mis-tickets" element={
          <RutaPrivada><MisTicketsPage /></RutaPrivada>
        } />
        <Route path="tickets/bandeja" element={
          <RutaPrivada roles={['Admin','Agente']}><BandejaTicketsPage /></RutaPrivada>
        } />
        <Route path="tickets/:id" element={
          <RutaPrivada><DetalleTicketPage /></RutaPrivada>
        } />

        <Route path="admin/usuarios" element={
          <RutaPrivada roles={['Admin']}><GestionUsuariosPage /></RutaPrivada>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
