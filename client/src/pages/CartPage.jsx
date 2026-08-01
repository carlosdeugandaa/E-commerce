import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  useMediaQuery,
  useTheme,
  Alert,
  IconButton,
} from '@mui/material';
import {
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
import { getCart, addToCart, removeFromCart, clearCart } from '../firebase/config';

function CartPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  // Load cart from Firestore
  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const result = await getCart(user.uid);
      if (result.success) {
        setCartItems(result.cart || []);
      } else {
        toast.error('Failed to load cart');
      }
      setLoading(false);
    };
    loadCart();
  }, [user]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const discount = appliedCoupon ? subtotal * 0.1 : 0;
  const total = subtotal + shipping + tax - discount;

  // Handlers
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    if (!user) return;
    
    setIsLoading(true);
    const result = await addToCart(user.uid, itemId, newQuantity);
    if (result.success) {
      setCartItems(result.cart);
      window.dispatchEvent(new Event('cartUpdated'));
    } else {
      toast.error(result.error || 'Failed to update cart');
    }
    setIsLoading(false);
  };

  const handleRemoveItem = async (itemId) => {
    if (!user) return;
    
    const result = await removeFromCart(user.uid, itemId);
    if (result.success) {
      setCartItems(result.cart);
      window.dispatchEvent(new Event('cartUpdated'));
      toast.info('Item removed from cart');
    } else {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (cartItems.length === 0) return;
    if (!user) return;
    
    const result = await clearCart(user.uid);
    if (result.success) {
      setCartItems([]);
      window.dispatchEvent(new Event('cartUpdated'));
      toast.info('Cart cleared');
    } else {
      toast.error('Failed to clear cart');
    }
  };

  const handleApplyCoupon = () => {
    setPromoError('');
    if (!couponCode.trim()) {
      setPromoError('Please enter a coupon code');
      return;
    }
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
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading cart...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Shopping Cart
        </Typography>
        <Chip label={`${totalItems} items`} color="primary" size={isMobile ? 'small' : 'medium'} />
      </Box>

      {cartItems.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <ShoppingCart sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Looks like you haven't added any items yet.
            </Typography>
            <Button variant="contained" size="large" onClick={handleContinueShopping} startIcon={<ArrowBack />}>
              Continue Shopping
            </Button>
          </Paper>
        </motion.div>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">{totalItems} items in your cart</Typography>
              <Button size="small" color="error" startIcon={<Clear />} onClick={handleClearCart}>Clear Cart</Button>
            </Box>
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div key={item.productId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }}>
                  <CartItem
                    item={{
                      id: item.productId,
                      name: item.name,
                      price: item.price,
                      quantity: item.quantity,
                      image: item.image,
                    }}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            <Button startIcon={<ArrowBack />} onClick={handleContinueShopping} sx={{ mt: 2 }}>
              Continue Shopping
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
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
