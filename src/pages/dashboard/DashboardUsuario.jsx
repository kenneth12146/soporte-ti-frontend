import {
  Box, Grid, Card, CardContent, Typography,
  Button, Divider
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketService from '../../services/ticketService';
import TicketEstadoChip from '../../components/tickets/TicketEstadoChip';
import useAuth from '../../hooks/useAuth';

const StatCard = ({ icon, label, value, color }) => (
  <Card>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{
        p: 1.5, borderRadius: 2,
        backgroundColor: `${color}18`,
        color: color, display: 'flex'
      }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="h4" fontWeight={700}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const DashboardUsuario = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    ticketService.listarMios()
      .then(res => {
        const data = res.data;
        const lista = Array.isArray(data) ? data : (data?.tickets || []);
        setTickets(lista);
      })
      .catch(() => setTickets([]))
      .finally(() => setCargando(false));
  }, []);

  const abiertos   = tickets.filter(t => t.estado === 'Abierto' || t.estado === 'En Proceso' || t.estado === 'En Espera').length;
  const resueltos  = tickets.filter(t => t.estado === 'Resuelto' || t.estado === 'Cerrado').length;
  const pendientes = tickets.filter(t => t.estado === 'Pendiente').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5">¡Hola, {usuario?.nombre?.split(' ')[0]}! 👋</Typography>
          <Typography variant="body2" color="text.secondary">
            Aquí puedes ver el estado de tus solicitudes de soporte.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => navigate('/tickets/crear')}
        >
          Nuevo Ticket
        </Button>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<ConfirmationNumberOutlinedIcon />} label="Tickets activos" value={abiertos}   color="#1565C0" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<PendingActionsIcon />}            label="Pendientes"       value={pendientes} color="#ED6C02" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<CheckCircleOutlineIcon />}        label="Resueltos"        value={resueltos}  color="#2E7D32" />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Mis últimos tickets</Typography>
            <Button size="small" onClick={() => navigate('/tickets/mis-tickets')}>
              Ver todos
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {cargando ? (
            <Typography color="text.secondary">Cargando...</Typography>
          ) : tickets.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No tienes tickets aún.</Typography>
              <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/tickets/crear')}>
                Crear mi primer ticket
              </Button>
            </Box>
          ) : (
            tickets.slice(0, 5).map((t) => (
              <Box
                key={t.id_ticket}
                onClick={() => navigate(`/tickets/${t.id_ticket}`)}
                sx={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  py: 1.5, px: 1, borderRadius: 2, cursor: 'pointer',
                  '&:hover': { backgroundColor: '#F5F7FA' },
                  borderBottom: '1px solid #F0F0F0'
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>{t.codigo}</Typography>
                  <Typography variant="caption" color="text.secondary">{t.titulo}</Typography>
                </Box>
                <TicketEstadoChip estado={t.estado} />
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardUsuario;
