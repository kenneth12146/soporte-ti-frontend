import {
  Box, Card, CardContent, Typography, Chip, Button,
  Divider, TextField, MenuItem, Grid, Alert,
  CircularProgress, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, Rating
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import LockIcon from '@mui/icons-material/Lock';
import StarIcon from '@mui/icons-material/Star';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ticketService from '../../services/ticketService';
import comentarioService from '../../services/comentarioService';
import catalogoService from '../../services/catalogoService';
import TicketEstadoChip from '../../components/tickets/TicketEstadoChip';
import useAuth from '../../hooks/useAuth';

const ESTADOS_AGENTE = ['Abierto', 'En Proceso', 'Pendiente', 'Resuelto'];
const ESTADOS_ADMIN  = ['Abierto', 'En Proceso', 'Pendiente', 'Resuelto', 'Cerrado', 'Cancelado'];

const DetalleTicketPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, tieneRol } = useAuth();

  const esAdmin  = tieneRol('Admin');
  const esAgente = tieneRol('Agente');

  const [ticket, setTicket]           = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [historial, setHistorial]     = useState([]);
  const [agentes, setAgentes]         = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState('');
  const [exito, setExito]             = useState('');

  // Comentario
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [esInterno, setEsInterno]             = useState(false);
  const [enviando, setEnviando]               = useState(false);

  // Cambio de estado
  const [nuevoEstado, setNuevoEstado]         = useState('');
  const [comentarioEstado, setComentarioEstado] = useState('');
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  // Asignar agente
  const [agenteSeleccionado, setAgenteSeleccionado] = useState('');
  const [asignando, setAsignando]                   = useState(false);

  // Calificación
  const [dialogCalif, setDialogCalif]       = useState(false);
  const [calificacion, setCalificacion]     = useState(0);
  const [comentarioCalif, setComentarioCalif] = useState('');
  const [calificando, setCalificando]       = useState(false);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [tRes, cRes, hRes] = await Promise.all([
        ticketService.obtener(id),
        comentarioService.listar(id),
        ticketService.historial(id),
      ]);
      setTicket(tRes.data?.ticket || tRes.data);
      setComentarios(cRes.data?.comentarios || cRes.data || []);
      setHistorial(hRes.data?.historial || hRes.data || []);

      if (esAdmin) {
        const aRes = await catalogoService.agentes();
        setAgentes(aRes.data || []);
      }
    } catch {
      setError('Error cargando el ticket.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, [id]);

  const handleComentario = async () => {
    if (!nuevoComentario.trim()) return;
    try {
      setEnviando(true);
      await comentarioService.crear(id, { mensaje: nuevoComentario, es_interno: esInterno });
      setNuevoComentario('');
      const cRes = await comentarioService.listar(id);
      setComentarios(cRes.data?.comentarios || cRes.data || []);
    } catch {
      setError('Error enviando comentario.');
    } finally {
      setEnviando(false);
    }
  };

  const handleCambiarEstado = async () => {
    if (!nuevoEstado) return;
    try {
      setCambiandoEstado(true);
      await ticketService.cambiarEstado(id, {
        id_estado: nuevoEstado,
        comentario: comentarioEstado
      });
      setExito('Estado actualizado correctamente.');
      setComentarioEstado('');
      setNuevoEstado('');
      await cargarDatos();
      setTimeout(() => setExito(''), 3000);
    } catch {
      setError('Error al cambiar estado.');
    } finally {
      setCambiandoEstado(false);
    }
  };

  const handleAsignar = async () => {
    if (!agenteSeleccionado) return;
    try {
      setAsignando(true);
      await ticketService.asignar(id, { id_agente: agenteSeleccionado });
      setExito('Agente asignado correctamente.');
      await cargarDatos();
      setTimeout(() => setExito(''), 3000);
    } catch {
      setError('Error al asignar agente.');
    } finally {
      setAsignando(false);
    }
  };

  const handleCalificar = async () => {
    if (!calificacion) return;
    try {
      setCalificando(true);
      await ticketService.calificar(id, {
        calificacion,
        comentario_cierre: comentarioCalif
      });
      setDialogCalif(false);
      setExito('¡Gracias por tu calificación!');
      await cargarDatos();
    } catch {
      setError('Error al calificar.');
    } finally {
      setCalificando(false);
    }
  };

  const esSolicitante = ticket?.id_solicitante === usuario?.id ||
                        ticket?.solicitante_email === usuario?.email;

  const estadosDisponibles = esAdmin ? ESTADOS_ADMIN : ESTADOS_AGENTE;

  if (cargando) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Box>
  );

  if (!ticket) return (
    <Alert severity="error">No se encontró el ticket.</Alert>
  );

  return (
    <Box maxWidth={900} mx="auto">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} variant="outlined" size="small">
          Volver
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" fontWeight={700}>{ticket.codigo}</Typography>
            <TicketEstadoChip estado={ticket.estado} size="medium" />
            <Chip label={ticket.prioridad} size="small" variant="outlined" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Creado el {new Date(ticket.fecha_creacion).toLocaleDateString('es-CO', {
              year: 'numeric', month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </Typography>
        </Box>
      </Box>

      {error  && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {exito  && <Alert severity="success" sx={{ mb: 2 }}>{exito}</Alert>}

      <Grid container spacing={3}>
        {/* Columna principal */}
        <Grid item xs={12} md={8}>

          {/* Detalle del ticket */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={1}>{ticket.titulo}</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                {ticket.descripcion}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={1}>
                {[
                  ['Categoría',     ticket.categoria],
                  ['Subcategoría',  ticket.subcategoria || '—'],
                  ['Departamento',  ticket.departamento],
                  ['Activo',        ticket.activo || '—'],
                  ['Solicitante',   ticket.solicitante],
                  ['Agente',        ticket.agente || 'Sin asignar'],
                ].map(([label, val]) => (
                  <Grid item xs={6} key={label}>
                    <Typography variant="caption" color="text.disabled" fontWeight={700}>
                      {label.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>{val}</Typography>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Comentarios */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Comentarios ({comentarios.length})
              </Typography>

              {comentarios.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No hay comentarios aún.
                </Typography>
              ) : (
                comentarios.map((c) => (
                  <Box
                    key={c.id_comentario}
                    sx={{
                      display: 'flex', gap: 1.5, mb: 2,
                      backgroundColor: c.es_interno ? '#FFF8E1' : '#F5F7FA',
                      borderRadius: 2, p: 1.5,
                      borderLeft: c.es_interno ? '3px solid #FFC107' : '3px solid #1565C0',
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: '#1565C0' }}>
                      {c.autor?.charAt(0) || 'U'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={700}>{c.autor}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {c.es_interno && (
                            <Chip label="Interno" size="small"
                              sx={{ backgroundColor: '#FFF3CD', color: '#856404', fontSize: '0.7rem' }} />
                          )}
                          <Typography variant="caption" color="text.disabled">
                            {new Date(c.fecha_creacion).toLocaleDateString('es-CO')}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {c.mensaje}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}

              {/* Nuevo comentario */}
              {ticket.estado !== 'Cerrado' && ticket.estado !== 'Cancelado' && (
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ mb: 2 }} />
                  <TextField
                    fullWidth multiline rows={3}
                    placeholder="Escribe un comentario..."
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {(esAdmin || esAgente) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LockIcon fontSize="small" color="warning" />
                        <Typography
                          variant="body2" color="warning.main"
                          sx={{ cursor: 'pointer', fontWeight: esInterno ? 700 : 400 }}
                          onClick={() => setEsInterno(!esInterno)}
                        >
                          {esInterno ? '🔒 Nota interna (solo agentes)' : '🌐 Comentario público'}
                        </Typography>
                      </Box>
                    )}
                    <Button
                      variant="contained" size="small"
                      endIcon={<SendIcon />}
                      onClick={handleComentario}
                      disabled={enviando || !nuevoComentario.trim()}
                    >
                      {enviando ? 'Enviando...' : 'Enviar'}
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Historial */}
          {historial.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>Historial de cambios</Typography>
                {historial.map((h, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
                    <Box sx={{
                      width: 8, height: 8, borderRadius: '50%',
                      backgroundColor: '#1565C0', mt: 0.8, flexShrink: 0
                    }} />
                    <Box>
                      <Typography variant="body2">
                        <strong>{h.usuario}</strong> cambió estado de{' '}
                        <strong>{h.estado_anterior}</strong> a <strong>{h.estado_nuevo}</strong>
                      </Typography>
                      {h.comentario && (
                        <Typography variant="caption" color="text.secondary">"{h.comentario}"</Typography>
                      )}
                      <Typography variant="caption" display="block" color="text.disabled">
                        {new Date(h.fecha).toLocaleString('es-CO')}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Columna lateral — acciones */}
        <Grid item xs={12} md={4}>

          {/* Cambiar estado — Admin y Agente */}
          {(esAdmin || esAgente) && ticket.estado !== 'Cerrado' && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                  Cambiar Estado
                </Typography>
                <TextField
                  select fullWidth size="small" label="Nuevo estado"
                  value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}
                  sx={{ mb: 1.5 }}
                >
                  <MenuItem value="1">Abierto</MenuItem>
                  <MenuItem value="2">En Proceso</MenuItem>
                  <MenuItem value="3">En Espera</MenuItem>
                  <MenuItem value="4">Resuelto</MenuItem>
                  {esAdmin && <MenuItem value="5">Cerrado</MenuItem>}
                  {esAdmin && <MenuItem value="6">Cancelado</MenuItem>}
                </TextField>
                <TextField
                  fullWidth size="small" multiline rows={2}
                  label="Comentario (opcional)"
                  value={comentarioEstado}
                  onChange={(e) => setComentarioEstado(e.target.value)}
                  sx={{ mb: 1.5 }}
                />
                <Button
                  fullWidth variant="contained" size="small"
                  onClick={handleCambiarEstado}
                  disabled={cambiandoEstado || !nuevoEstado}
                >
                  {cambiandoEstado ? <CircularProgress size={18} /> : 'Actualizar Estado'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Asignar agente — solo Admin */}
          {esAdmin && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                  <AssignmentIndIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                  Asignar Agente
                </Typography>
                <TextField
                  select fullWidth size="small" label="Seleccionar agente"
                  value={agenteSeleccionado}
                  onChange={(e) => setAgenteSeleccionado(e.target.value)}
                  sx={{ mb: 1.5 }}
                >
                  {agentes.map(a => (
                    <MenuItem key={a.id_usuario} value={a.id_usuario}>
                      {a.nombre}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  fullWidth variant="outlined" size="small"
                  onClick={handleAsignar}
                  disabled={asignando || !agenteSeleccionado}
                >
                  {asignando ? <CircularProgress size={18} /> : 'Asignar'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Calificar — solicitante cuando está Resuelto */}
          {esSolicitante && ticket.estado === 'Resuelto' && !ticket.calificacion && (
            <Card sx={{ mb: 2, border: '2px solid #2E7D32' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <StarIcon sx={{ color: '#FFC107', fontSize: 40 }} />
                <Typography variant="subtitle2" fontWeight={700} mt={1}>
                  ¿Tu problema fue resuelto?
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  Califica la atención recibida para cerrar el ticket.
                </Typography>
                <Button
                  fullWidth variant="contained" color="success"
                  onClick={() => setDialogCalif(true)}
                >
                  Calificar y Cerrar
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Calificación existente */}
          {ticket.calificacion && (
            <Card sx={{ mb: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" fontWeight={700}>Calificación</Typography>
                <Rating value={ticket.calificacion} readOnly sx={{ mt: 1 }} />
                {ticket.comentario_cierre && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    "{ticket.comentario_cierre}"
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* Info adicional */}
          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Información</Typography>
              {[
                ['ID',          `#${ticket.id_ticket}`],
                ['Código',      ticket.codigo],
                ['Creado',      new Date(ticket.fecha_creacion).toLocaleDateString('es-CO')],
                ['Actualizado', new Date(ticket.fecha_actualizacion || ticket.fecha_creacion).toLocaleDateString('es-CO')],
              ].map(([label, val]) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.disabled">{label}</Typography>
                  <Typography variant="caption" fontWeight={600}>{val}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog calificación */}
      <Dialog open={dialogCalif} onClose={() => setDialogCalif(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Calificar atención recibida</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              ¿Qué tan satisfecho estás con la solución?
            </Typography>
            <Rating
              value={calificacion}
              onChange={(_, val) => setCalificacion(val)}
              size="large"
            />
          </Box>
          <TextField
            fullWidth multiline rows={3}
            label="Comentario adicional (opcional)"
            value={comentarioCalif}
            onChange={(e) => setComentarioCalif(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogCalif(false)}>Cancelar</Button>
          <Button
            variant="contained" color="success"
            onClick={handleCalificar}
            disabled={calificando || !calificacion}
          >
            {calificando ? <CircularProgress size={20} /> : 'Enviar calificación'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DetalleTicketPage;