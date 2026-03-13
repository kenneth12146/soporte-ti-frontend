import {
  Box, Typography, Card, CardContent, TextField,
  MenuItem, Grid, Chip, Button, Pagination,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketService from '../../services/ticketService';
import TicketEstadoChip from '../../components/tickets/TicketEstadoChip';
import useAuth from '../../hooks/useAuth';

const ESTADOS    = ['Todos', 'Abierto', 'En Proceso', 'Pendiente', 'Resuelto', 'Cerrado'];
const PRIORIDADES = ['Todas', 'Baja', 'Media', 'Alta', 'Crítica'];
const POR_PAGINA = 10;

const BandejaTicketsPage = () => {
  const navigate = useNavigate();
  const { tieneRol } = useAuth();

  const [tickets, setTickets]       = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [busqueda, setBusqueda]     = useState('');
  const [estado, setEstado]         = useState('Todos');
  const [prioridad, setPrioridad]   = useState('Todas');
  const [pagina, setPagina]         = useState(1);

  useEffect(() => {
    ticketService.listar()
      .then(res => setTickets(res.data?.tickets || res.data || []))
      .catch(() => setTickets([]))
      .finally(() => setCargando(false));
  }, []);

  const filtrados = tickets.filter(t => {
    const matchEstado    = estado === 'Todos'    || t.estado    === estado;
    const matchPrioridad = prioridad === 'Todas' || t.prioridad === prioridad;
    const matchBusqueda  = !busqueda ||
      t.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.solicitante?.toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchPrioridad && matchBusqueda;
  });

  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const paginados    = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const colorPrioridad = {
    'Baja':    '#2E7D32',
    'Media':   '#ED6C02',
    'Alta':    '#D32F2F',
    'Crítica': '#B71C1C',
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">Bandeja de Tickets</Typography>
        <Typography variant="body2" color="text.secondary">
          {tieneRol('Admin') ? 'Todos los tickets del sistema.' : 'Tickets asignados a ti.'}
        </Typography>
      </Box>

      {/* Filtros */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth size="small" placeholder="Buscar por código, título o usuario..."
            value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
            }}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField select fullWidth size="small" label="Estado" value={estado}
            onChange={(e) => { setEstado(e.target.value); setPagina(1); }}>
            {ESTADOS.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField select fullWidth size="small" label="Prioridad" value={prioridad}
            onChange={(e) => { setPrioridad(e.target.value); setPagina(1); }}>
            {PRIORIDADES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
          </Typography>
        </Grid>
      </Grid>

      {/* Tabla */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F7FA' }}>
                <TableCell><strong>Código</strong></TableCell>
                <TableCell><strong>Título</strong></TableCell>
                <TableCell><strong>Solicitante</strong></TableCell>
                <TableCell><strong>Prioridad</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell><strong>Agente</strong></TableCell>
                <TableCell><strong>Fecha</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cargando ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    Cargando tickets...
                  </TableCell>
                </TableRow>
              ) : paginados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    No hay tickets con esos filtros.
                  </TableCell>
                </TableRow>
              ) : (
                paginados.map((t) => (
                  <TableRow
                    key={t.id_ticket}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/tickets/${t.id_ticket}`)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary">
                        {t.codigo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                        {t.titulo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#1565C0' }}>
                          {t.solicitante?.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">{t.solicitante}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t.prioridad || 'Normal'}
                        size="small"
                        sx={{
                          backgroundColor: `${colorPrioridad[t.prioridad] || '#666'}18`,
                          color: colorPrioridad[t.prioridad] || '#666',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell><TicketEstadoChip estado={t.estado} /></TableCell>
                    <TableCell>
                      <Typography variant="body2" color={t.agente ? 'text.primary' : 'error.main'}>
                        {t.agente || 'Sin asignar'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(t.fecha_creacion).toLocaleDateString('es-CO')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPaginas > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Pagination
              count={totalPaginas} page={pagina}
              onChange={(_, v) => setPagina(v)}
              color="primary" size="small"
            />
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default BandejaTicketsPage;
