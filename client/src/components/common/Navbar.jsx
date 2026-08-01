import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Button,
  Container,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Avatar,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import {
  ShoppingCart,
  Search,
  Person,
  Favorite,
  Menu as MenuIcon,
  Home,
  Category,
  History,
  ExitToApp,
  Dashboard,
  Settings,
  Help,
  Receipt,
  Store,
  People,
  Image,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logoutUser, getCart, getWishlist } from '../../firebase/config';

function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loadingCounts, setLoadingCounts] = useState(false);

  // Load user from localStorage
  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsLoggedIn(true);
          setIsAdmin(parsedUser.role === 'admin');
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user');
          setUser(null);
          setIsLoggedIn(false);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };

    loadUser();
    window.addEventListener('storage', loadUser);
    return () => {
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  // Fetch cart and wishlist counts from Firestore when user logs in
  const fetchCounts = async () => {
    if (!user?.uid) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    setLoadingCounts(true);
    try {
      const cartResult = await getCart(user.uid);
      const wishlistResult = await getWishlist(user.uid);
      
      if (cartResult.success) {
        setCartCount(cartResult.cart.length);
      } else {
        console.error('Failed to fetch cart:', cartResult.error);
        setCartCount(0);
      }

      if (wishlistResult.success) {
        setWishlistCount(wishlistResult.wishlist.length);
      } else {
        console.error('Failed to fetch wishlist:', wishlistResult.error);
        setWishlistCount(0);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
      setCartCount(0);
      setWishlistCount(0);
    } finally {
      setLoadingCounts(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchCounts();
    } else {
      setCartCount(0);
      setWishlistCount(0);
    }
  }, [isLoggedIn, user]);

  // Listen for cart/wishlist update events
  useEffect(() => {
    const handleCartUpdate = () => {
      if (isLoggedIn && user) fetchCounts();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('wishlistUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('wishlistUpdated', handleCartUpdate);
    };
  }, [isLoggedIn, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm}`);
      setSearchTerm('');
      if (isMobile) setMobileDrawerOpen(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logoutUser();
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    
    setUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCartCount(0);
    setWishlistCount(0);
    
    window.dispatchEvent(new Event('storage'));
    
    toast.success('Logged out successfully!', {
      position: 'bottom-right',
    });
    
    navigate('/login');
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Products', icon: <Category />, path: '/products' },
    { text: 'My Orders', icon: <History />, path: '/orders' },
    { text: 'Wishlist', icon: <Favorite />, path: '/wishlist' },
  ];

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 1, flexWrap: 'wrap', gap: 2 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                flexGrow: isMobile ? 1 : 0,
                textDecoration: 'none',
                color: 'primary.main',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: isMobile ? '1.25rem' : '1.5rem',
              }}
            >
              🛍️ ShopHub
            </Typography>

            {!isMobile && (
              <Box
                component="form"
                onSubmit={handleSearch}
                sx={{
                  flexGrow: 1,
                  maxWidth: '500px',
                  mx: 4,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 8,
                      backgroundColor: 'grey.50',
                    },
                  }}
                />
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isMobile ? (
                <IconButton onClick={handleSearch}>
                  <Search />
                </IconButton>
              ) : (
                <>
                  <IconButton
                    color="inherit"
                    component={Link}
                    to="/wishlist"
                    sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                  >
                    <Badge badgeContent={wishlistCount} color="secondary" max={99}>
                      <Favorite />
                    </Badge>
                  </IconButton>

                  <IconButton
                    color="inherit"
                    component={Link}
                    to="/cart"
                  >
                    <Badge badgeContent={cartCount} color="primary" max={99}>
                      <ShoppingCart />
                    </Badge>
                  </IconButton>
                </>
              )}

              {isLoggedIn ? (
                <>
                  <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      {user?.name?.[0] || user?.email?.[0] || 'U'}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        minWidth: 200,
                        borderRadius: 2,
                        boxShadow: theme.shadows[4],
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {user?.name || 'User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user?.email || ''}
                      </Typography>
                    </Box>
                    <Divider />
                    
                    <MenuItem onClick={handleMenuClose} component={Link} to="/profile">
                      <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                      <ListItemText>Profile</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose} component={Link} to="/orders">
                      <ListItemIcon><History fontSize="small" /></ListItemIcon>
                      <ListItemText>My Orders</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose} component={Link} to="/wishlist">
                      <ListItemIcon><Favorite fontSize="small" /></ListItemIcon>
                      <ListItemText>Wishlist</ListItemText>
                      {wishlistCount > 0 && (
                        <Chip label={wishlistCount} size="small" color="secondary" sx={{ ml: 'auto' }} />
                      )}
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose} component={Link} to="/cart">
                      <ListItemIcon><ShoppingCart fontSize="small" /></ListItemIcon>
                      <ListItemText>Cart</ListItemText>
                      {cartCount > 0 && (
                        <Chip label={cartCount} size="small" color="primary" sx={{ ml: 'auto' }} />
                      )}
                    </MenuItem>
                    
                    {isAdmin && (
                      <>
                        <Divider />
                        <Typography variant="caption" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
                          Admin
                        </Typography>
                        <MenuItem onClick={handleMenuClose} component={Link} to="/admin">
                          <ListItemIcon><Dashboard fontSize="small" /></ListItemIcon>
                          <ListItemText>Dashboard</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleMenuClose} component={Link} to="/admin/products">
                          <ListItemIcon><Store fontSize="small" /></ListItemIcon>
                          <ListItemText>Products</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleMenuClose} component={Link} to="/admin/orders">
                          <ListItemIcon><Receipt fontSize="small" /></ListItemIcon>
                          <ListItemText>Orders</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleMenuClose} component={Link} to="/admin/users">
                          <ListItemIcon><People fontSize="small" /></ListItemIcon>
                          <ListItemText>Users</ListItemText>
                        </MenuItem>
                        {/* ✅ Banners Admin Link */}
                        <MenuItem onClick={handleMenuClose} component={Link} to="/admin/banners">
                          <ListItemIcon><Image fontSize="small" /></ListItemIcon>
                          <ListItemText>Banners</ListItemText>
                        </MenuItem>
                      </>
                    )}
                    
                    <Divider />
                    <MenuItem onClick={handleMenuClose} component={Link} to="/settings">
                      <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
                      <ListItemText>Settings</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose} component={Link} to="/help">
                      <ListItemIcon><Help fontSize="small" /></ListItemIcon>
                      <ListItemText>Help & Support</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                      <ListItemIcon sx={{ color: 'error.main' }}>
                        <ExitToApp fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Logout</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/login"
                  startIcon={<Person />}
                  sx={{ borderRadius: 8, display: isMobile ? 'none' : 'inline-flex' }}
                >
                  Login
                </Button>
              )}
            </Box>
          </Toolbar>

          {isMobile && (
            <Box component="form" onSubmit={handleSearch} sx={{ px: 2, pb: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 8,
                    backgroundColor: 'grey.50',
                  },
                }}
              />
            </Box>
          )}
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            borderRadius: '0 16px 16px 0',
          },
        }}
      >
        <Box sx={{ pt: 2 }}>
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              🛍️ ShopHub
            </Typography>
            {isLoggedIn && user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {user.name?.[0] || user.email?.[0] || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {user.name || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email || ''}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
          
          <Divider />

          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                component={Link}
                to={item.path}
                onClick={() => setMobileDrawerOpen(false)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                {item.text === 'Wishlist' && wishlistCount > 0 && (
                  <Chip label={wishlistCount} size="small" color="secondary" />
                )}
                {item.text === 'Cart' && cartCount > 0 && (
                  <Chip label={cartCount} size="small" color="primary" />
                )}
              </ListItem>
            ))}

            <Divider sx={{ my: 1 }} />

            {isLoggedIn ? (
              <>
                <ListItem
                  button
                  component={Link}
                  to="/profile"
                  onClick={() => setMobileDrawerOpen(false)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  }}
                >
                  <ListItemIcon><Person /></ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItem>
                <ListItem
                  button
                  component={Link}
                  to="/orders"
                  onClick={() => setMobileDrawerOpen(false)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  }}
                >
                  <ListItemIcon><History /></ListItemIcon>
                  <ListItemText primary="My Orders" />
                </ListItem>
                <ListItem
                  button
                  component={Link}
                  to="/wishlist"
                  onClick={() => setMobileDrawerOpen(false)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  }}
                >
                  <ListItemIcon><Favorite /></ListItemIcon>
                  <ListItemText primary="Wishlist" />
                  {wishlistCount > 0 && (
                    <Chip label={wishlistCount} size="small" color="secondary" />
                  )}
                </ListItem>
                <ListItem
                  button
                  component={Link}
                  to="/cart"
                  onClick={() => setMobileDrawerOpen(false)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  }}
                >
                  <ListItemIcon><ShoppingCart /></ListItemIcon>
                  <ListItemText primary="Cart" />
                  {cartCount > 0 && (
                    <Chip label={cartCount} size="small" color="primary" />
                  )}
                </ListItem>
                {isAdmin && (
                  <>
                    <Divider />
                    <ListItem
                      button
                      component={Link}
                      to="/admin"
                      onClick={() => setMobileDrawerOpen(false)}
                      sx={{
                        borderRadius: 2,
                        mx: 1,
                        '&:hover': {
                          bgcolor: 'primary.light',
                        },
                      }}
                    >
                      <ListItemIcon><Dashboard /></ListItemIcon>
                      <ListItemText primary="Admin Dashboard" />
                    </ListItem>
                    {/* ✅ Banners in Mobile Drawer */}
                    <ListItem
                      button
                      component={Link}
                      to="/admin/banners"
                      onClick={() => setMobileDrawerOpen(false)}
                      sx={{
                        borderRadius: 2,
                        mx: 1,
                        '&:hover': {
                          bgcolor: 'primary.light',
                        },
                      }}
                    >
                      <ListItemIcon><Image /></ListItemIcon>
                      <ListItemText primary="Banners" />
                    </ListItem>
                  </>
                )}
                <Divider />
                <ListItem
                  button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    handleLogout();
                  }}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'error.light',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'error.main' }}>
                    <ExitToApp />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            ) : (
              <ListItem
                button
                component={Link}
                to="/login"
                onClick={() => setMobileDrawerOpen(false)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>
                  <Person />
                </ListItemIcon>
                <ListItemText primary="Login / Register" primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItem>
            )}
          </List>

          <Box sx={{ p: 2, mt: 'auto', bgcolor: 'grey.50' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              © 2024 ShopHub
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Help
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Privacy
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Terms
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default Navbar;

