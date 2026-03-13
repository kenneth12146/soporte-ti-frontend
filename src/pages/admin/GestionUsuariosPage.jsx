import {
  Box, Typography, Card, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Avatar, Chip, Button, TextField, MenuItem, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert,
  CircularProgress, Grid, InputAdornment, Table
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import api from '../../services/api';

const ROLES = ['Admin', 'Agente', 'Docente', 'Estudiante', 'Personal'];

const ROL_IDS = {
  'Admin':      1,
  'Agente':     2,
  'Estudiante': 3,
  'Docente':    4,
  'Personal':   5,
};

const colorRol = {
  'Admin':      '#7B1FA2',
  'Agente':     '#1565C0',
  'Docente':    '#2E7D32',
  'Estudiante': '#ED6C02',
  'Personal':   '#00796B',
};

const GestionUsuariosPage = () => {
  const [usuarios, setUsuarios]     = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [busqueda, setBusqueda]     = useState('');
  const [error, setError]           = useState('');
  const [exito, setExito]           = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [guardando, setGuardando]   = useState(false);
  const [form, setForm] = useState({
    nombre: '', email: '', password: '', rol: 'Estudiante'
  });

  const cargarUsuarios = () => {
    setCargando(true);
    api.get('/usuarios')
      .then(res => setUsuarios(res.data?.usuarios || res.data || []))
      .catch(() => setError('Error cargando usuarios.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCrear = async () => {
    if (!form.nombre || !form.email || !form.password) {
      setError('Completa todos los campos.');
      return;
    }
    try {
      setGuardando(true);
      setError('');
      await api.post('/auth/registro', {
        nombre_completo: form.nombre,
        email:           form.email,
        password:        form.password,
        id_rol:          ROL_IDS[form.rol] || 3,
      });
      setExito('Usuario creado correctamente.');
      setDialogOpen(false);
      setForm({ nombre: '', email: '', password: '', rol: 'Estudiante' });
      cargarUsuarios();
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        `Error ${err.response?.status}`
      );
    } finally {
      setGuardando(false);
    }
  };

  const filtrados = usuarios.filter(u =>
    !busqueda ||
    u.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5">Gestión de Usuarios</Typography>
          <Typography variant="body2" color="text.secondary">
            Administra los usuarios del sistema.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Nuevo Usuario
        </Button>
      </Box>

      {error && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {exito && <Alert severity="success" sx={{ mb: 2 }}>{exito}</Alert>}

      <TextField
        fullWidth size="small" placeholder="Buscar por nombre o correo..."
        value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
        }}
      />

      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F7FA' }}>
                <TableCell><strong>Usuario</strong></TableCell>
                <TableCell><strong>Correo</strong></TableCell>
                <TableCell><strong>Rol</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell><strong>Registro</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cargando ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((u) => {
                  const rol = u.roles?.[0] || u.rol || '—';
                  return (
                    <TableRow key={u.id_usuario} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{
                            width: 34, height: 34, fontSize: '0.85rem',
                            bgcolor: colorRol[rol] || '#1565C0'
                          }}>
                            {(u.nombre_completo || u.nombre)?.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>
                            {u.nombre_completo || u.nombre}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rol}
                          size="small"
                          sx={{
                            backgroundColor: `${colorRol[rol] || '#666'}18`,
                            color: colorRol[rol] || '#666',
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.es_activo ? 'Activo' : 'Inactivo'}
                          size="small"
                          color={u.es_activo ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {u.fecha_creacion
                            ? new Date(u.fecha_creacion).toLocaleDateString('es-CO')
                            : '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog nuevo usuario */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Crear nuevo usuario</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth label="Nombre completo *"
                name="nombre" value={form.nombre} onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth label="Correo electrónico *"
                name="email" type="email" value={form.email} onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Contraseña *"
                name="password" type="password"
                value={form.password} onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Rol *"
                name="rol" value={form.rol} onChange={handleChange}
              >
                {ROLES.map(r => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCrear} disabled={guardando}>
            {guardando ? <CircularProgress size={20} color="inherit" /> : 'Crear Usuario'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionUsuariosPage;
