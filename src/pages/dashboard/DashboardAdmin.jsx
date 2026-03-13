import {
  Box, Grid, Card, CardContent, Typography,
  Divider, Chip, Button
} from '@mui/material';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketService from '../../services/ticketService';
import TicketEstadoChip from '../../components/tickets/TicketEstadoChip';

const StatCard = ({ icon, label, value, color, sub }) => (
  <Card>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: `${color}18`, color, display: 'flex' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="h4" fontWeight={700}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        {sub && <Typography variant="caption" color="text.disabled">{sub}</Typography>}
      </Box>
    </CardContent>
  </Card>
);

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    ticketService.listar({ limite: 20 })
      .then(res => setTickets(res.data?.tickets || res.data || []))
      .catch(() => setTickets([]))
      .finally(() => setCargando(false));
  }, []);

  const total      = tickets.length;
  const abiertos   = tickets.filter(t => t.estado === 'Abierto').length;
  const enProceso  = tickets.filter(t => t.estado === 'En Proceso').length;
  const sinAsignar = tickets.filter(t => !t.agente).length;
  const resueltos  = tickets.filter(t => t.estado === 'Resuelto' || t.estado === 'Cerrado').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5">Panel Administrativo ⚙️</Typography>
          <Typography variant="body2" color="text.secondary">
            Vista general del sistema de soporte.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<PeopleAltOutlinedIcon />}
          onClick={() => navigate('/admin/usuarios')}
        >
          Gestionar Usuarios
        </Button>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<ConfirmationNumberOutlinedIcon />} label="Total tickets"   value={total}      color="#1565C0" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<HourglassEmptyIcon />}             label="Abiertos"        value={abiertos}   color="#ED6C02" sub={`${enProceso} en proceso`} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<PeopleAltOutlinedIcon />}          label="Sin asignar"     value={sinAsignar} color="#D32F2F" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CheckCircleOutlineIcon />}         label="Resueltos"       value={resueltos}  color="#2E7D32" />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Todos los tickets recientes</Typography>
            <Chip
              label="Ver bandeja completa"
              clickable color="primary" size="small"
              onClick={() => navigate('/tickets/bandeja')}
            />
          </Box>
          <Divider sx={{ mb: 1 }} />

          {cargando ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>Cargando...</Typography>
          ) : tickets.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>No hay tickets en el sistema.</Typography>
          ) : (
            tickets.slice(0, 10).map((t) => (
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
                <Box>
                  <Typography variant="body2" fontWeight={600}>{t.codigo} — {t.titulo}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t.solicitante} · {t.departamento}
                    {!t.agente && <span style={{ color: '#D32F2F', fontWeight: 600 }}> · Sin asignar</span>}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={t.prioridad || 'Normal'} size="small" variant="outlined" />
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

export default DashboardAdmin;
