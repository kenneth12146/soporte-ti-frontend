import {
  Box, Card, CardContent, Typography, TextField,
  Button, Grid, MenuItem, Alert, CircularProgress, Divider
} from '@mui/material';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketService from '../../services/ticketService';
import catalogoService from '../../services/catalogoService';

const CrearTicketPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    id_categoria: '',
    id_subcategoria: '',
    id_prioridad: '',
    id_departamento: '',
    id_activo: '',
  });

  const [catalogos, setCatalogos] = useState({
    categorias: [],
    subcategorias: [],
    prioridades: [],
    departamentos: [],
    activos: [],
  });

  const [cargando, setCargando]     = useState(false);
  const [cargandoSub, setCargandoSub] = useState(false);
  const [error, setError]           = useState('');
  const [exito, setExito]           = useState('');

  // Carga catálogos iniciales
  useEffect(() => {
    Promise.all([
      catalogoService.categorias(),
      catalogoService.prioridades(),
      catalogoService.departamentos(),
      catalogoService.activos(),
    ]).then(([cats, prios, deptos, activos]) => {
      setCatalogos(prev => ({
        ...prev,
        categorias:    cats.data    || [],
        prioridades:   prios.data   || [],
        departamentos: deptos.data  || [],
        activos:       activos.data || [],
      }));
    }).catch(() => setError('Error cargando catálogos.'));
  }, []);

  // Carga subcategorías cuando cambia categoría
  useEffect(() => {
    if (!form.id_categoria) {
      setCatalogos(prev => ({ ...prev, subcategorias: [] }));
      setForm(prev => ({ ...prev, id_subcategoria: '' }));
      return;
    }
    setCargandoSub(true);
    catalogoService.subcategorias(form.id_categoria)
      .then(res => setCatalogos(prev => ({ ...prev, subcategorias: res.data || [] })))
      .catch(() => setCatalogos(prev => ({ ...prev, subcategorias: [] })))
      .finally(() => setCargandoSub(false));
  }, [form.id_categoria]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo || !form.descripcion || !form.id_categoria || !form.id_prioridad || !form.id_departamento) {
      setError('Completa los campos obligatorios (*).');
      return;
    }
    try {
      setCargando(true);
      const payload = { ...form };
      if (!payload.id_subcategoria) delete payload.id_subcategoria;
      if (!payload.id_activo)       delete payload.id_activo;
      const res = await ticketService.crear(payload);
      const id = res.data?.ticket?.id_ticket || res.data?.id_ticket;
      setExito('¡Ticket creado exitosamente!');
      setTimeout(() => navigate(`/tickets/${id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear el ticket.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box maxWidth={750} mx="auto">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <ConfirmationNumberOutlinedIcon color="primary" fontSize="large" />
        <Box>
          <Typography variant="h5">Crear Nuevo Ticket</Typography>
          <Typography variant="body2" color="text.secondary">
            Describe tu solicitud y la atenderemos a la brevedad.
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {error  && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
          {exito  && <Alert severity="success" sx={{ mb: 2 }}>{exito}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>

            {/* Título */}
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              Información general
            </Typography>
            <TextField
              fullWidth label="Título *" name="titulo"
              value={form.titulo} onChange={handleChange}
              placeholder="Ej: No puedo acceder al sistema de nómina"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Descripción detallada *" name="descripcion"
              value={form.descripcion} onChange={handleChange}
              multiline rows={4}
              placeholder="Describe el problema con el mayor detalle posible..."
              sx={{ mb: 3 }}
            />

            <Divider sx={{ mb: 3 }} />
            <Typography variant="subtitle2" fontWeight={700} mb={2}>
              Clasificación
            </Typography>

            <Grid container spacing={2}>
              {/* Categoría */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select fullWidth label="Categoría *" name="id_categoria"
                  value={form.id_categoria} onChange={handleChange}
                >
                  <MenuItem value="">Seleccionar...</MenuItem>
                  {catalogos.categorias.map(c => (
                    <MenuItem key={c.id_categoria} value={c.id_categoria}>
                      {c.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Subcategoría */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select fullWidth label="Subcategoría" name="id_subcategoria"
                  value={form.id_subcategoria} onChange={handleChange}
                  disabled={!form.id_categoria || cargandoSub}
                >
                  <MenuItem value="">
                    {cargandoSub ? 'Cargando...' : 'Seleccionar...'}
                  </MenuItem>
                  {catalogos.subcategorias.map(s => (
                    <MenuItem key={s.id_subcategoria} value={s.id_subcategoria}>
                      {s.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Prioridad */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select fullWidth label="Prioridad *" name="id_prioridad"
                  value={form.id_prioridad} onChange={handleChange}
                >
                  <MenuItem value="">Seleccionar...</MenuItem>
                  {catalogos.prioridades.map(p => (
                    <MenuItem key={p.id_prioridad} value={p.id_prioridad}>
                      {p.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Departamento */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select fullWidth label="Departamento *" name="id_departamento"
                  value={form.id_departamento} onChange={handleChange}
                >
                  <MenuItem value="">Seleccionar...</MenuItem>
                  {catalogos.departamentos.map(d => (
                    <MenuItem key={d.id_departamento} value={d.id_departamento}>
                      {d.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Activo (opcional) */}
              <Grid item xs={12}>
                <TextField
                  select fullWidth label="Equipo / Activo (opcional)" name="id_activo"
                  value={form.id_activo} onChange={handleChange}
                >
                  <MenuItem value="">Sin equipo asociado</MenuItem>
                  {catalogos.activos.map(a => (
                    <MenuItem key={a.id_activo} value={a.id_activo}>
                      {a.nombre} {a.codigo ? `— ${a.codigo}` : ''}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate(-1)} disabled={cargando}>
                Cancelar
              </Button>
              <Button
                type="submit" variant="contained" size="large"
                disabled={cargando}
                startIcon={cargando ? <CircularProgress size={18} color="inherit" /> : null}
              >
                {cargando ? 'Creando...' : 'Crear Ticket'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CrearTicketPage;
