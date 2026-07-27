import React, { useState } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  IconButton,
  TextField,
  Chip,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Delete,
  Remove,
  Add,
  ShoppingCart,
  ArrowBack,
  LocalOffer,
  Clear,
  CheckCircle,
  ErrorOutline,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import { mockCartItems } from '../utils/mockData';

function CartPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // State
  // Load cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
  const savedCart = localStorage.getItem('cart');
  return savedCart ? JSON.parse(savedCart) : [];
});
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const discount = appliedCoupon ? subtotal * 0.1 : 0; // 10% discount
  const total = subtotal + shipping + tax - discount;

  // Handlers
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    toast.info('Item removed from cart');
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    setCartItems([]);
    toast.info('Cart cleared');
  };

  const handleApplyCoupon = () => {
    setPromoError('');
    if (!couponCode.trim()) {
      setPromoError('Please enter a coupon code');
      return;
    }

    // Mock coupon validation
    if (couponCode.toUpperCase() === 'SAVE10') {
      setAppliedCoupon({ code: 'SAVE10', discount: 10 });
      toast.success('Coupon applied successfully!');
      setCouponCode('');
    } else if (couponCode.toUpperCase() === 'FREESHIP') {
      setAppliedCoupon({ code: 'FREESHIP', discount: 0, freeShipping: true });
      toast.success('Free shipping applied!');
      setCouponCode('');
    } else {
      setPromoError('Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info('Coupon removed');
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    toast.info('Redirecting to checkout...');
    // navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Shopping Cart
        </Typography>
        <Chip
          label={`${totalItems} items`}
          color="primary"
          size={isMobile ? 'small' : 'medium'}
        />
      </Box>

      {cartItems.length === 0 ? (
        // Empty Cart
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <ShoppingCart sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Looks like you haven't added any items to your cart yet.
              Start shopping to fill it up!
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleContinueShopping}
              startIcon={<ArrowBack />}
            >
              Continue Shopping
            </Button>
          </Paper>
        </motion.div>
      ) : (
        <Grid container spacing={3}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            {/* Action Bar */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {totalItems} items in your cart
              </Typography>
              <Button
                size="small"
                color="error"
                startIcon={<Clear />}
                onClick={handleClearCart}
                disabled={cartItems.length === 0}
              >
                Clear Cart
              </Button>
            </Box>

            {/* Cart Items List */}
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <CartItem
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue Shopping */}
            <Button
              startIcon={<ArrowBack />}
              onClick={handleContinueShopping}
              sx={{ mt: 2 }}
            >
              Continue Shopping
            </Button>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Order Summary
                </Typography>

                {/* Coupon Section */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      disabled={!!appliedCoupon}
                      fullWidth
                      error={!!promoError}
                      helperText={promoError}
                      InputProps={{
                        startAdornment: <LocalOffer sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleApplyCoupon}
                      disabled={!!appliedCoupon}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      Apply
                    </Button>
                  </Box>
                  {appliedCoupon && (
                    <Chip
                      label={`Coupon ${appliedCoupon.code} applied`}
                      color="success"
                      size="small"
                      onDelete={handleRemoveCoupon}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Price Breakdown */}
                <Box sx={{ space: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal
                    </Typography>
                    <Typography variant="body2">
                      ${subtotal.toFixed(2)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Shipping
                    </Typography>
                    <Typography variant="body2">
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tax (8%)
                    </Typography>
                    <Typography variant="body2">
                      ${tax.toFixed(2)}
                    </Typography>
                  </Box>

                  {discount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="success.main">
                        Discount
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        -${discount.toFixed(2)}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      ${total.toFixed(2)}
                    </Typography>
                  </Box>

                  {shipping === 0 && subtotal > 0 && (
                    <Alert icon={<CheckCircle />} severity="success" sx={{ mb: 2 }}>
                      You've qualified for free shipping!
                    </Alert>
                  )}

                  {subtotal < 50 && subtotal > 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Add ${(50 - subtotal).toFixed(2)} more for free shipping
                    </Alert>
                  )}
                </Box>

                {/* Checkout Button */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleProceedToCheckout}
                  disabled={cartItems.length === 0}
                  sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
                >
                  Proceed to Checkout
                </Button>

                {/* Secure Payment Info */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    🔒 Secure Checkout
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    •
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    💳 All Major Cards
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default CartPage;
