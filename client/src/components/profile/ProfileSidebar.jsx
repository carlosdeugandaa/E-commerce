import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Typography,
  Divider,
  Badge,
  Chip,
} from '@mui/material';
import {
  Person,
  ShoppingBag,
  Favorite,
  Settings,
  Logout,
  CreditCard,
  Notifications,
  Help,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logoutUser } from '../../firebase/config';

function ProfileSidebar({ activeTab, onTabChange, user }) {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: <Person /> },
    { id: 'orders', label: 'My Orders', icon: <ShoppingBag /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Favorite /> },
    { id: 'payments', label: 'Payment Methods', icon: <CreditCard /> },
    { id: 'notifications', label: 'Notifications', icon: <Notifications /> },
    { id: 'settings', label: 'Settings', icon: <Settings /> },
  ];

  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <Box>
      {/* User Info */}
      <Box sx={{ textAlign: 'center', py: 3, px: 2 }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Chip
              label="Verified"
              color="success"
              size="small"
              sx={{ fontSize: '0.6rem', height: 20 }}
            />
          }
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              bgcolor: 'primary.main',
              fontSize: 32,
              mb: 2,
              boxShadow: 3,
            }}
          >
            {user?.name?.[0] || 'U'}
          </Avatar>
        </Badge>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {user?.name || 'User'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.email || 'user@example.com'}
        </Typography>
        <Chip
          label="Member"
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mt: 1 }}
        />
      </Box>

      <Divider />

      {/* Menu Items */}
      <List sx={{ py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={activeTab === item.id}
              onClick={() => onTabChange(item.id)}
              sx={{
                borderRadius: 2,
                mx: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
                '&:hover': {
                  bgcolor: 'grey.50',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: activeTab === item.id ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: activeTab === item.id ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ my: 1 }} />

        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              mx: 1,
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.light',
                color: 'error.dark',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Help Section */}
      <Box sx={{ p: 2, mt: 2, bgcolor: 'grey.50', borderRadius: 2, mx: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          Need help?
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            icon={<Help fontSize="small" />}
            label="FAQ"
            size="small"
            variant="outlined"
            onClick={() => toast.info('Redirecting to FAQ...')}
          />
          <Chip
            label="Contact Support"
            size="small"
            variant="outlined"
            onClick={() => toast.info('Opening support chat...')}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default ProfileSidebar;
