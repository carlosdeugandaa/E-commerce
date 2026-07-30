import React from 'react';
import { Box, Button, Divider, Typography } from '@mui/material';
import { Google } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { googleLogin } from '../../firebase/config';

function SocialLogin() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await googleLogin();
      
      if (result.success) {
        localStorage.setItem('token', result.user.uid);
        localStorage.setItem('user', JSON.stringify(result.user));
        // Force immediate update
        window.dispatchEvent(new Event('storage'));
        toast.success(`Welcome ${result.user.name || 'User'}!`, {
          position: 'bottom-right',
        });
        navigate('/');
      } else {
        toast.error('Google login failed. Please try again.', {
          position: 'bottom-right',
        });
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again.', {
        position: 'bottom-right',
      });
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ mb: 3 }}>
        <Typography variant="caption" color="text.secondary">
          OR CONTINUE WITH
        </Typography>
      </Divider>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Google />}
          onClick={handleGoogleLogin}
          sx={{
            py: 1.5,
            borderRadius: 2,
            borderColor: 'grey.300',
            color: 'text.primary',
            maxWidth: '300px',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.light',
              color: 'primary.main',
            },
          }}
        >
          Sign in with Google
        </Button>
      </Box>
    </Box>
  );
}

export default SocialLogin;
