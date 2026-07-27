import React, { useState, useEffect } from 'react';
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
  Alert,
} from '@mui/material';
import {
  Delete,
  Remove,
  Add,
  ShoppingCart,
  ArrowBack,
  Clear,
  CheckCircle,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';

function CartPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
        setCartItems([]);
      }
    }
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

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
    const updatedCart = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    // Trigger event for navbar
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleRemoveItem = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    window.dispatchEvent(new Event('cartUpdated'));
    toast.info('Item removed from cart', {
      position: 'bottom-right',
    });
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    setCartItems([]);
    window.dispatchEvent(new Event('cartUpdated'));
    toast.info('Cart cleared', {
      position: 'bottom-right',
    });
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
      toast.success('Coupon applied successfully!', {
        position: 'bottom-right',
      });
      setCouponCode('');
    } else if (couponCode.toUpperCase() === 'FREESHIP') {
      setAppliedCoupon({ code: 'FREESHIP', discount: 0, freeShipping: true });
      toast.success('Free shipping applied!', {
        position: 'bottom-right',
      });
      setCouponCode('');
    } else {
      setPromoError('Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info('Coupon removed', {
      position: 'bottom-right',
    });
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty', {
        position: 'bottom-right',
      });
      return;
    }
    toast.info('Redirecting to checkout...', {
      position: 'bottom-right',
    });
    // navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  // Update CartItem component props
  const renderCartItems = () => {
    return cartItems.map((item) => (
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
    ));
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
              {renderCartItems()}
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
              <CartSummary
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                discount={discount}
                total={total}
                totalItems={totalItems}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                onCheckout={handleProceedToCheckout}
                onContinueShopping={handleContinueShopping}
                isLoading={isLoading}
                promoError={promoError}
              />
            </motion.div>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default CartPage;
