import {
  Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Toolbar,
  Divider, Typography, Box
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import InboxIcon from '@mui/icons-material/Inbox';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const DRAWER_WIDTH = 240;

const Sidebar = ({ open, variant = 'permanent' }) => {
  const { usuario, tieneRol } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const esAdmin  = tieneRol('Admin');
  const esAgente = tieneRol('Agente');

  const menuItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: esAdmin ? '/dashboard/admin' : esAgente ? '/dashboard/agente' : '/dashboard/usuario',
      visible: true,
    },
    {
      label: 'Crear Ticket',
      icon: <AddCircleOutlineIcon />,
      path: '/tickets/crear',
      visible: !esAdmin,
    },
    {
      label: 'Mis Tickets',
      icon: <ConfirmationNumberOutlinedIcon />,
      path: '/tickets/mis-tickets',
      visible: !esAdmin && !esAgente,
    },
    {
      label: 'Bandeja de Tickets',
      icon: <InboxIcon />,
      path: '/tickets/bandeja',
      visible: esAdmin || esAgente,
    },
    {
      label: 'Gestión de Usuarios',
      icon: <PeopleAltOutlinedIcon />,
      path: '/admin/usuarios',
      visible: esAdmin,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <Drawer
      variant={variant}
      open={open}
      sx={{
        width: open ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        transition: 'width 0.2s',
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#0D1B2A',
          color: '#fff',
          borderRight: 'none',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="caption" sx={{ color: '#90A4AE', textTransform: 'uppercase', fontWeight: 700 }}>
          {usuario?.roles?.join(' · ')}
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      <List sx={{ px: 1, mt: 1 }}>
        {menuItems.filter(i => i.visible).map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                backgroundColor: isActive(item.path) ? 'rgba(21,101,192,0.8)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
              }}
            >
              <ListItemIcon sx={{ color: isActive(item.path) ? '#fff' : '#90A4AE', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: isActive(item.path) ? 700 : 400,
                  color: isActive(item.path) ? '#fff' : '#CFD8DC',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
