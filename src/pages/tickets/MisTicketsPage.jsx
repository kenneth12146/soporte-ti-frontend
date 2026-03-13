import {
  Box, Typography, Card, CardContent, TextField,
  MenuItem, Grid, Chip, Button, Pagination,
  InputAdornment
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketService from '../../services/ticketService';
import TicketEstadoChip from '../../components/tickets/TicketEstadoChip';

const ESTADOS = ['Todos', 'Abierto', 'En Proceso', 'En Espera', 'Pendiente', 'Resuelto', 'Cerrado', 'Cancelado'];
const POR_PAGINA = 8;

const MisTicketsPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado]     = useState('Todos');
  const [pagina, setPagina]     = useState(1);

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

  const filtrados = tickets.filter(t => {
    const matchEstado   = estado === 'Todos' || t.estado === estado;
    const matchBusqueda = !busqueda ||
      t.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.codigo?.toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchBusqueda;
  });

  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const paginados    = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5">Mis Tickets</Typography>
          <Typography variant="body2" color="text.secondary">
            Historial de todas tus solicitudes de soporte.
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

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth size="small" placeholder="Buscar por título o código..."
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            select fullWidth size="small" label="Estado"
            value={estado}
            onChange={(e) => { setEstado(e.target.value); setPagina(1); }}
          >
            {ESTADOS.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>

      {cargando ? (
        <Typography color="text.secondary">Cargando tickets...</Typography>
      ) : paginados.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary" mb={2}>No se encontraron tickets.</Typography>
            <Button variant="outlined" onClick={() => navigate('/tickets/crear')}>
              Crear ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {paginados.map((t) => (
            <Grid item xs={12} key={t.id_ticket}>
              <Card
                sx={{ cursor: 'pointer', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.12)' } }}
                onClick={() => navigate(`/tickets/${t.id_ticket}`)}
              >
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={700} color="primary">{t.codigo}</Typography>
                      <Chip label={t.prioridad || 'Normal'} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="body1" fontWeight={500}>{t.titulo}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.categoria} · {t.departamento} · {new Date(t.fecha_creacion).toLocaleDateString('es-CO')}
                    </Typography>
                  </Box>
                  <TicketEstadoChip estado={t.estado} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {totalPaginas > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPaginas} page={pagina}
            onChange={(_, v) => setPagina(v)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default MisTicketsPage;
