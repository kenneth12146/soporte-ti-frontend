import {
  AppBar, Toolbar, Typography, IconButton,
  Avatar, Box, Tooltip, Menu, MenuItem, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Navbar = ({ onToggleSidebar }) => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" elevation={0} sx={{
      zIndex: (theme) => theme.zIndex.drawer + 1,
      backgroundColor: '#1565C0',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    }}>
      <Toolbar>
        <IconButton color="inherit" edge="start" onClick={onToggleSidebar} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 0.5 }}>
          🖥️ Soporte TI
        </Typography>

        <Tooltip title="Notificaciones">
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <NotificationsOutlinedIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={usuario?.nombre || 'Usuario'}>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
            <Avatar sx={{ bgcolor: '#0D47A1', width: 36, height: 36, fontSize: '0.9rem' }}>
              {iniciales}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { mt: 1.5, minWidth: 200, borderRadius: 2 } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>{usuario?.nombre}</Typography>
            <Typography variant="caption" color="text.secondary">{usuario?.email}</Typography>
            <Typography variant="caption" display="block" color="primary" fontWeight={600}>
              {usuario?.roles?.join(', ')}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 600 }}>
            Cerrar sesión
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
