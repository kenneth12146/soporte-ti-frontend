import { Box, CircularProgress } from '@mui/material';

const LoadingSpinner = () => (
  <Box sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#F5F7FA'
  }}>
    <CircularProgress size={50} />
  </Box>
);

export default LoadingSpinner;
