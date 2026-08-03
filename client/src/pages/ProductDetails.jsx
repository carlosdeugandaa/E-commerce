import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Rating,
  Button,
  IconButton,
  Chip,
  Divider,
  Paper,
  TextField,
  useMediaQuery,
  useTheme,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Remove,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Share,
  ArrowBack,
  CheckCircle,
  LocalShipping,
  Shield,
  Refresh,
  Payment,
  Star,
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ProductCard from '../components/products/ProductCard';
import ReviewCard from '../components/products/ReviewCard';
import { getProduct, getProducts, addReview, getProductReviews, auth } from '../firebase/config';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Load reviews for current product
  const loadReviews = async (productId) => {
    if (!productId) return;
    setReviewLoading(true);
    try {
      const result = await getProductReviews(productId);
      if (result.success) {
        setReviews(result.reviews);
      } else {
        console.error('Failed to load reviews:', result.error);
        setReviews([]);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    }
    setReviewLoading(false);
  };

  // Load product data from Firestore
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      const result = await getProduct(id);
      if (result.success) {
        setProduct(result.product);
        setSelectedImage(0);

        // Get related products
        const relatedResult = await getProducts({ category: result.product.category });
        if (relatedResult.success) {
          setRelatedProducts(
            relatedResult.products.filter(p => p.id !== id).slice(0, 4)
          );
        }

        // Load reviews
        await loadReviews(result.product.id);
      } else {
        navigate('/products');
        toast.error('Product not found');
      }
      setLoading(false);
    };
    loadProduct();
  }, [id, navigate]);

  // Check if product is in wishlist
  useEffect(() => {
    if (product) {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const wishlist = JSON.parse(savedWishlist);
        setIsLiked(wishlist.some(item => item.id === product.id));
      }
    }
  }, [product]);

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!currentUser) {
      toast.error('Please login to leave a review');
      return;
    }
    if (reviewRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmittingReview(true);

    const result = await addReview(
      product.id,
      currentUser.uid,
      currentUser.displayName || 'User',
      reviewRating,
      reviewComment.trim()
    );

    if (result.success) {
      toast.success('Review submitted successfully!');
      setReviewRating(0);
      setReviewComment('');
      
      // Reload reviews
      await loadReviews(product.id);
      
      // Reload product to update rating count
      const productResult = await getProduct(product.id);
      if (productResult.success) {
        setProduct(productResult.product);
      }
    } else {
      toast.error(result.error || 'Failed to submit review');
    }
    setSubmittingReview(false);
  };

  // Handle review deletion refresh
  const handleReviewDeleted = async () => {
    await loadReviews(product.id);
    const productResult = await getProduct(product.id);
    if (productResult.success) {
      setProduct(productResult.product);
    }
  };

  const discountPercentage = product?.discount || 0;
  const finalPrice = product?.discountedPrice || product?.price || 0;

  // Quantity handlers
  const handleQuantityChange = (type) => {
    if (type === 'increase' && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    const savedCart = localStorage.getItem('cart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`${quantity} × ${product.name} added to cart!`);
  };

  const handleWishlistToggle = () => {
    const savedWishlist = localStorage.getItem('wishlist');
    const wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
    const index = wishlist.findIndex(item => item.id === product.id);
    if (index > -1) {
      wishlist.splice(index, 1);
      setIsLiked(false);
      toast.info('Removed from wishlist');
    } else {
      wishlist.push(product);
      setIsLiked(true);
      toast.info('Added to wishlist');
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setSnackbar({ open: true, message: 'Link copied to clipboard!', severity: 'success' });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    return {
      stars,
      count,
      percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0,
    };
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Product not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" color="inherit">Home</Link>
        <Link component={RouterLink} to="/products" color="inherit">Products</Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Back
      </Button>

      {/* Main Product Section */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Box sx={{ position: 'relative' }}>
              <Paper sx={{ position: 'relative', overflow: 'hidden', borderRadius: 3, mb: 2, p: 2, bgcolor: 'grey.50' }}>
                <Box
                  component="img"
                  src={product.images?.[selectedImage] || product.image}
                  alt={product.name}
                  sx={{ width: '100%', height: 'auto', maxHeight: 500, objectFit: 'contain' }}
                />
                {discountPercentage > 0 && (
                  <Chip label={`-${discountPercentage}%`} color="error" sx={{ position: 'absolute', top: 16, left: 16, fontWeight: 700 }} />
                )}
              </Paper>
            </Box>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Typography variant="overline" color="text.secondary">{product.brand}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>{product.name}</Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Rating value={product.rating || 0} readOnly precision={0.5} />
              <Typography variant="body2" color="text.secondary">({product.reviewCount || 0} reviews)</Typography>
              <Chip label={`${product.stock} in stock`} color={product.stock > 0 ? 'success' : 'error'} size="small" />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>${finalPrice.toFixed(2)}</Typography>
              {discountPercentage > 0 && (
                <>
                  <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    ${product.originalPrice?.toFixed(2)}
                  </Typography>
                  <Chip label={`Save ${discountPercentage}%`} color="error" size="small" />
                </>
              )}
            </Box>

            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>{product.description}</Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Chip icon={<LocalShipping />} label="Free Shipping" variant="outlined" />
              <Chip icon={<Shield />} label="2 Year Warranty" variant="outlined" />
              <Chip icon={<Refresh />} label="30 Day Returns" variant="outlined" />
              <Chip icon={<Payment />} label="Secure Payment" variant="outlined" />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>Quantity:</Typography>
                <IconButton size="small" onClick={() => handleQuantityChange('decrease')} disabled={quantity <= 1} sx={{ border: '1px solid', borderColor: 'grey.300' }}><Remove /></IconButton>
                <TextField value={quantity} onChange={(e) => { const val = parseInt(e.target.value); if (val > 0 && val <= product.stock) setQuantity(val); }} size="small" sx={{ width: 60, '& input': { textAlign: 'center' } }} inputProps={{ min: 1, max: product.stock }} />
                <IconButton size="small" onClick={() => handleQuantityChange('increase')} disabled={quantity >= product.stock} sx={{ border: '1px solid', borderColor: 'grey.300' }}><Add /></IconButton>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                <Button fullWidth variant="contained" size="large" startIcon={<ShoppingCart />} onClick={handleAddToCart} sx={{ borderRadius: 2 }}>Add to Cart</Button>
                <Button fullWidth variant="outlined" size="large" sx={{ borderRadius: 2 }}>Buy Now</Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button startIcon={isLiked ? <Favorite color="error" /> : <FavoriteBorder />} onClick={handleWishlistToggle} variant="outlined" sx={{ borderRadius: 2 }}>{isLiked ? 'Wishlisted' : 'Add to Wishlist'}</Button>
              <Button startIcon={<Share />} onClick={handleShare} variant="outlined" sx={{ borderRadius: 2 }}>Share</Button>
            </Box>
          </motion.div>
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Box sx={{ mt: 6 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant={isMobile ? 'fullWidth' : 'standard'} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Description" />
          <Tab label="Specifications" />
          <Tab label={`Reviews (${reviews.length})`} />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {/* Description Tab */}
          {tabValue === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>{product.description}</Typography>
            </motion.div>
          )}

          {/* Specifications Tab */}
          {tabValue === 1 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Grid container spacing={2}>
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="caption" color="text.secondary">{key}</Typography>
                      <Typography variant="body1" fontWeight={500}>{value}</Typography>
                    </Paper>
                  </Grid>
                ))}
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="caption" color="text.secondary">Category</Typography>
                    <Typography variant="body1" fontWeight={500}>{product.category}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="caption" color="text.secondary">Stock</Typography>
                    <Typography variant="body1" fontWeight={500}>{product.stock} units</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {/* Reviews Tab */}
          {tabValue === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Grid container spacing={4}>
                {/* Rating Summary */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ fontWeight: 700 }}>
                      {reviews.length > 0 ? averageRating.toFixed(1) : '0.0'}
                    </Typography>
                    <Rating value={averageRating} readOnly precision={0.5} size="large" />
                    <Typography variant="body2" color="text.secondary">
                      Based on {reviews.length} reviews
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ textAlign: 'left' }}>
                      {ratingDistribution.map((item) => (
                        <Box key={item.stars} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="caption" sx={{ minWidth: 20 }}>
                            {item.stars}
                          </Typography>
                          <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                          <LinearProgress
                            variant="determinate"
                            value={item.percentage}
                            sx={{ flex: 1, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {item.count}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                {/* Review Form & List */}
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {currentUser ? 'Write a Review' : 'Login to Write a Review'}
                    </Typography>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Rating
                          value={reviewRating}
                          onChange={(event, newValue) => setReviewRating(newValue || 0)}
                          size="large"
                          disabled={!currentUser}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {reviewRating > 0 ? `${reviewRating} stars` : 'Select rating'}
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder={currentUser ? "Share your experience with this product..." : "Please login to leave a review"}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        disabled={!currentUser}
                        sx={{ mb: 2 }}
                      />
                      {currentUser ? (
                        <Button
                          variant="contained"
                          onClick={handleSubmitReview}
                          disabled={submittingReview}
                          startIcon={submittingReview ? <CircularProgress size={20} /> : <CheckCircle />}
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      ) : (
                        <Button variant="contained" component={RouterLink} to="/login">
                          Login to Review
                        </Button>
                      )}
                    </Box>
                  </Paper>

                  {/* Reviews List */}
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {reviews.length} Reviews
                  </Typography>
                  {reviewLoading ? (
                    <CircularProgress />
                  ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        productId={product.id}
                        currentUser={currentUser}
                        isAdmin={currentUser?.role === 'admin'}
                        onReviewDeleted={handleReviewDeleted}
                      />
                    ))
                  ) : (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        No reviews yet. Be the first to review this product!
                      </Typography>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </motion.div>
          )}
        </Box>
      </Box>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Related Products</Typography>
          <Grid container spacing={3}>
            {relatedProducts.map((product) => (
              <Grid item xs={6} sm={6} md={3} key={product.id}>
                <ProductCard product={product} compact />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ProductDetails;
