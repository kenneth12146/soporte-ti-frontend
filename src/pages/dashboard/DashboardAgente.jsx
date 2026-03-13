import {
  Box, Grid, Card, CardContent, Typography,
  Divider, Avatar, Chip
} from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketService from '../../services/ticketService';
import TicketEstadoChip from '../../components/tickets/TicketEstadoChip';
import useAuth from '../../hooks/useAuth';

const StatCard = ({ icon, label, value, color }) => (
  <Card>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: `${color}18`, color, display: 'flex' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="h4" fontWeight={700}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const DashboardAgente = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    ticketService.listar({ limite: 10 })
      .then(res => setTickets(res.data?.tickets || res.data || []))
      .catch(() => setTickets([]))
      .finally(() => setCargando(false));
  }, []);

  const abiertos   = tickets.filter(t => t.estado === 'Abierto').length;
  const enProceso  = tickets.filter(t => t.estado === 'En Proceso').length;
  const resueltos  = tickets.filter(t => t.estado === 'Resuelto').length;
  const asignados  = tickets.filter(t => t.agente).length;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">Panel de Agente 🛠️</Typography>
        <Typography variant="body2" color="text.secondary">
          Hola {usuario?.nombre?.split(' ')[0]}, aquí están los tickets que requieren atención.
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<InboxIcon />}                label="Abiertos"   value={abiertos}  color="#1565C0" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<HourglassEmptyIcon />}       label="En Proceso" value={enProceso} color="#ED6C02" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CheckCircleOutlineIcon />}   label="Resueltos"  value={resueltos} color="#2E7D32" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<AssignmentIndIcon />}        label="Asignados"  value={asignados} color="#7B1FA2" />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Tickets recientes</Typography>
            <Chip
              label="Ver bandeja completa"
              clickable
              color="primary"
              size="small"
              onClick={() => navigate('/tickets/bandeja')}
            />
          </Box>
          <Divider sx={{ mb: 1 }} />

          {cargando ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>Cargando tickets...</Typography>
          ) : tickets.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>No hay tickets disponibles.</Typography>
          ) : (
            tickets.slice(0, 8).map((t) => (
              <Box
                key={t.id_ticket}
                onClick={() => navigate(`/tickets/${t.id_ticket}`)}
                sx={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  py: 1.5, px: 1, borderRadius: 2, cursor: 'pointer',
                  '&:hover': { backgroundColor: '#F5F7FA' },
                  borderBottom: '1px solid #F5F5F5'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: '#1565C0' }}>
                    {t.solicitante?.charAt(0) || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{t.codigo} — {t.titulo}</Typography>
                    <Typography variant="caption" color="text.secondary">{t.solicitante}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip label={t.prioridad} size="small" variant="outlined" />
                  <TicketEstadoChip estado={t.estado} />
                </Box>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardAgente;
