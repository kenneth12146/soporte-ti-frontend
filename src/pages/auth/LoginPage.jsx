import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ComputerIcon from '@mui/icons-material/Computer';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Completa todos los campos.');
      return;
    }
    try {
      setCargando(true);
      const usuario = await login(form.email, form.password);
      if (usuario.roles?.includes('Admin')) navigate('/dashboard/admin');
      else if (usuario.roles?.includes('Agente')) navigate('/dashboard/agente');
      else navigate('/dashboard/usuario');
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        'Credenciales incorrectas. Intenta de nuevo.'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0D1B2A 0%, #1565C0 100%)',
    }}>
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 3, p: 1 }}>
        <CardContent sx={{ p: 4 }}>

          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1565C0, #0288D1)',
              mb: 2,
            }}>
              <ComputerIcon sx={{ color: '#fff', fontSize: 34 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="primary">
              Soporte TI
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Ingresa con tu cuenta institucional
            </Typography>
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Correo electrónico"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={cargando}
              sx={{ mt: 3, py: 1.4, borderRadius: 2, fontSize: '1rem' }}
            >
              {cargando
                ? <CircularProgress size={24} color="inherit" />
                : 'Iniciar sesión'
              }
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={3}>
            Sistema de Gestión de Soporte Técnico
          </Typography>

        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
