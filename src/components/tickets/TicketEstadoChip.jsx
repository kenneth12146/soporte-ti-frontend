import { Chip } from '@mui/material';

const colores = {
  'Abierto':    { bg: '#E3F2FD', color: '#1565C0' },
  'En Proceso': { bg: '#FFF3E0', color: '#E65100' },
  'En Espera':  { bg: '#F3E5F5', color: '#6A1B9A' },
  'Pendiente':  { bg: '#F3E5F5', color: '#6A1B9A' },
  'Resuelto':   { bg: '#E8F5E9', color: '#2E7D32' },
  'Cerrado':    { bg: '#EEEEEE', color: '#424242' },
  'Cancelado':  { bg: '#FFEBEE', color: '#C62828' },
};

const TicketEstadoChip = ({ estado, size = 'small' }) => {
  const estilo = colores[estado] || { bg: '#EEEEEE', color: '#424242' };
  return (
    <Chip
      label={estado}
      size={size}
      sx={{
        backgroundColor: estilo.bg,
        color: estilo.color,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.72rem' : '0.85rem',
      }}
    />
  );
};

export default TicketEstadoChip;
