import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  useMediaQuery,
  useTheme,
  Pagination,
  Alert,
  Snackbar,
  MenuItem,
} from '@mui/material';
import {
  Favorite,
  ShoppingCart,
  Search,
  Clear,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import WishlistCard from '../components/wishlist/WishlistCard';

function WishlistPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State
  const [wishlistItems, setWishlistItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const itemsPerPage = 8;

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        const wishlist = JSON.parse(savedWishlist);
        setWishlistItems(wishlist);
        setFilteredItems(wishlist);
      } catch (error) {
        console.error('Error loading wishlist:', error);
        setWishlistItems([]);
        setFilteredItems([]);
      }
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  // Filter and sort items
  useEffect(() => {
    let result = [...wishlistItems];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.brand?.toLowerCase().includes(searchLower)
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        // relevance - default order
        break;
    }

    setFilteredItems(result);
    setPage(1);
  }, [wishlistItems, searchTerm, sortBy]);

  // Handlers
  const handleRemoveItem = (itemId) => {
    const updatedWishlist = wishlistItems.filter(item => item.id !== itemId);
    setWishlistItems(updatedWishlist);
    setFilteredItems(updatedWishlist);
    window.dispatchEvent(new Event('wishlistUpdated'));
    setSnackbar({
      open: true,
      message: 'Item removed from wishlist',
      severity: 'success',
    });
  };

  const handleClearWishlist = () => {
    if (wishlistItems.length === 0) return;
    setWishlistItems([]);
    setFilteredItems([]);
    window.dispatchEvent(new Event('wishlistUpdated'));
    setSnackbar({
      open: true,
      message: 'Wishlist cleared',
      severity: 'info',
    });
  };

  const handleAddAllToCart = () => {
    if (wishlistItems.length === 0) {
      toast.warning('Your wishlist is empty', {
        position: 'bottom-right',
      });
      return;
    }
    
    // Add all items to cart
    const savedCart = localStorage.getItem('cart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    
    wishlistItems.forEach(item => {
      const existingItem = cart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...item, quantity: 1 });
      }
    });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    toast.success(`${wishlistItems.length} items added to cart!`, {
      position: 'bottom-right',
    });
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const displayedItems = filteredItems.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>My Wishlist</Typography>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                My Wishlist
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {wishlistItems.length} items saved
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {wishlistItems.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Clear />}
                  onClick={handleClearWishlist}
                >
                  Clear All
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ShoppingCart />}
                  onClick={handleAddAllToCart}
                >
                  Add All to Cart
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
              <Favorite sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Your wishlist is empty
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start adding your favorite items to your wishlist.
                They'll be saved here for easy access.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleContinueShopping}
                startIcon={<ArrowBack />}
              >
                Start Shopping
              </Button>
            </Paper>
          </motion.div>
        ) : (
          <>
            {/* Search and Filter Bar */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2,
                mt: 2,
              }}
            >
              <TextField
                size="small"
                placeholder="Search in wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ width: isMobile ? '100%' : 300 }}
              />

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Chip
                  label={`${filteredItems.length} items`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <TextField
                  select
                  size="small"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="rating">Highest Rated</MenuItem>
                  <MenuItem value="newest">Newest First</MenuItem>
                </TextField>
              </Box>
            </Box>

            {/* Products Grid */}
            {filteredItems.length > 0 ? (
              <>
                <AnimatePresence>
                  <Grid container spacing={3}>
                    {displayedItems.map((product) => (
                      <Grid item xs={6} sm={6} md={4} lg={3} key={product.id}>
                        <WishlistCard
                          product={product}
                          onRemove={handleRemoveItem}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(e, value) => setPage(value)}
                      color="primary"
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" gutterBottom>
                  No items match your search
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setSearchTerm('')}
                  startIcon={<Clear />}
                >
                  Clear Search
                </Button>
              </Box>
            )}
          </>
        )}
      </motion.div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default WishlistPage;
