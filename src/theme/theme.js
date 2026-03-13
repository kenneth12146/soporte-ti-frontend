import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565C0',
      light: '#1976D2',
      dark: '#0D47A1',
    },
    secondary: {
      main: '#0288D1',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    success: { main: '#2E7D32' },
    warning: { main: '#ED6C02' },
    error:   { main: '#D32F2F' },
    info:    { main: '#0288D1' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
      },
    },
  },
});

export default theme;
