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
import { getWishlist, addToWishlist, removeFromWishlist, getProduct } from '../firebase/config';

function WishlistPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [wishlistItems, setWishlistItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const user = JSON.parse(localStorage.getItem('user'));
  const itemsPerPage = 8;

  // Load wishlist from Firestore
  useEffect(() => {
    const loadWishlist = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const result = await getWishlist(user.uid);
      if (result.success) {
        const productIds = result.wishlist || [];
        // Get product details for each wishlist item
        const products = [];
        for (const productId of productIds) {
          const productResult = await getProduct(productId);
          if (productResult.success) {
            products.push(productResult.product);
          }
        }
        setWishlistItems(products);
        setFilteredItems(products);
      } else {
        toast.error('Failed to load wishlist');
      }
      setLoading(false);
    };
    loadWishlist();
  }, [user]);

  // Filter and sort items
  useEffect(() => {
    let result = [...wishlistItems];
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(item =>
        item.name?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.brand?.toLowerCase().includes(searchLower)
      );
    }
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      default: break;
    }
    setFilteredItems(result);
    setPage(1);
  }, [wishlistItems, searchTerm, sortBy]);

  const handleRemoveItem = async (productId) => {
    if (!user) return;
    const result = await removeFromWishlist(user.uid, productId);
    if (result.success) {
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      window.dispatchEvent(new Event('wishlistUpdated'));
      setSnackbar({ open: true, message: 'Item removed from wishlist', severity: 'success' });
    } else {
      toast.error('Failed to remove item');
    }
  };

  const handleClearWishlist = async () => {
    if (wishlistItems.length === 0) return;
    if (!user) return;
    // Remove each item one by one
    for (const item of wishlistItems) {
      await removeFromWishlist(user.uid, item.id);
    }
    setWishlistItems([]);
    setFilteredItems([]);
    window.dispatchEvent(new Event('wishlistUpdated'));
    setSnackbar({ open: true, message: 'Wishlist cleared', severity: 'info' });
  };

  const handleAddAllToCart = async () => {
    if (wishlistItems.length === 0) {
      toast.warning('Your wishlist is empty');
      return;
    }
    if (!user) {
      toast.error('Please login first');
      return;
    }
    // Add each item to cart
    for (const item of wishlistItems) {
      await addToCart(user.uid, item.id, 1);
    }
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`${wishlistItems.length} items added to cart!`);
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const displayedItems = filteredItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading wishlist...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>My Wishlist</Typography>
              <Typography variant="body2" color="text.secondary">{wishlistItems.length} items saved</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {wishlistItems.length > 0 && (
              <>
                <Button variant="outlined" color="error" startIcon={<Clear />} onClick={handleClearWishlist}>Clear All</Button>
                <Button variant="contained" startIcon={<ShoppingCart />} onClick={handleAddAllToCart}>Add All to Cart</Button>
              </>
            )}
          </Box>
        </Box>

        {wishlistItems.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
              <Favorite sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h5" gutterBottom>Your wishlist is empty</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start adding your favorite items to your wishlist.
              </Typography>
              <Button variant="contained" size="large" onClick={handleContinueShopping} startIcon={<ArrowBack />}>
                Start Shopping
              </Button>
            </Paper>
          </motion.div>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2, mt: 2 }}>
              <TextField
                size="small"
                placeholder="Search in wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                  endAdornment: searchTerm && <IconButton size="small" onClick={() => setSearchTerm('')}><Clear /></IconButton>,
                }}
                sx={{ width: isMobile ? '100%' : 300 }}
              />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Chip label={`${filteredItems.length} items`} size="small" color="primary" variant="outlined" />
                <TextField select size="small" value={sortBy} onChange={(e) => setSortBy(e.target.value)} sx={{ minWidth: 150 }}>
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="rating">Highest Rated</MenuItem>
                </TextField>
              </Box>
            </Box>

            {filteredItems.length > 0 ? (
              <>
                <AnimatePresence>
                  <Grid container spacing={3}>
                    {displayedItems.map((product) => (
                      <Grid item xs={6} sm={6} md={4} lg={3} key={product.id}>
                        <WishlistCard product={product} onRemove={handleRemoveItem} />
                      </Grid>
                    ))}
                  </Grid>
                </AnimatePresence>
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination count={totalPages} page={page} onChange={(e, value) => setPage(value)} color="primary" size={isMobile ? 'small' : 'medium'} />
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" gutterBottom>No items match your search</Typography>
                <Button variant="outlined" onClick={() => setSearchTerm('')} startIcon={<Clear />}>Clear Search</Button>
              </Box>
            )}
          </>
        )}
      </motion.div>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}

export default WishlistPage;
