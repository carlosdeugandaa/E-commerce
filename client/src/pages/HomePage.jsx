import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Paper,
  useTheme,
  CircularProgress,
  CardMedia,
  CardActionArea,
  Chip,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  LocalShipping,
  VerifiedUser,
  SupportAgent,
  ArrowForward,
  NavigateNext,
  NavigateBefore,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import ProductGrid from '../components/products/ProductGrid';
import { getProducts, getBanners } from '../firebase/config';

function HomePage() {
  const theme = useTheme();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setIsAdmin(user.role === 'admin');
      } catch (error) {
        setIsAdmin(false);
      }
    }
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const loadData = async () => {
    try {
      const [productsResult, bannersResult] = await Promise.all([
        getProducts(),
        getBanners(),
      ]);

      if (productsResult.success) {
        const allProducts = productsResult.products || [];
        const validProducts = allProducts.filter(p => p.name && typeof p.name === 'string' && typeof p.price === 'number');
        setFeaturedProducts(validProducts.filter(p => p.isFeatured).slice(0, 4));
        setLatestProducts(validProducts.slice(0, 4));
        setTrendingProducts(validProducts.slice(4, 8));
      }

      if (bannersResult.success) {
        setBanners(bannersResult.banners);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const features = [
    { icon: <LocalShipping sx={{ fontSize: 32 }} />, title: 'Free Shipping', desc: 'On orders over $50' },
    { icon: <VerifiedUser sx={{ fontSize: 32 }} />, title: 'Secure Payment', desc: '100% secure transactions' },
    { icon: <SupportAgent sx={{ fontSize: 32 }} />, title: '24/7 Support', desc: 'Dedicated support team' },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f7fa' }}>
      {/* ===== HERO CAROUSEL (IMPROVED) ===== */}
      <Box sx={{ position: 'relative', width: '100%', height: { xs: 250, sm: 350, md: 450 }, overflow: 'hidden' }}>
        {banners.length > 0 ? (
          banners.map((banner, index) => (
            <Box
              key={banner.id}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: index === currentSlide ? 1 : 0,
                transition: 'opacity 0.8s ease-in-out',
              }}
            >
              {/* Background Image */}
              <Box
                component="img"
                src={banner.image}
                alt={banner.title}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              
              {/* Dark Overlay - IMPROVED */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 100%)',
                }}
              />
              
              {/* Content - IMPROVED POSITIONING */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: { xs: '5%', sm: '10%', md: '15%' },
                  transform: 'translateY(-50%)',
                  maxWidth: { xs: '90%', sm: '70%', md: '50%' },
                  color: 'white',
                }}
              >
                {/* Badge - NEW */}
                <Typography
                  variant="overline"
                  sx={{
                    bgcolor: '#ff6b00',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    display: 'inline-block',
                    mb: 1,
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    letterSpacing: 1,
                  }}
                >
                  {banner.badge || '🔥 HOT DEAL'}
                </Typography>

                {/* Title - WITH TEXT SHADOW */}
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.5rem', sm: '2.5rem', md: '3.5rem' },
                    textShadow: '2px 2px 8px rgba(0,0,0,0.4)',
                    mb: 1,
                    lineHeight: 1.1,
                  }}
                >
                  {banner.title}
                </Typography>

                {/* Subtitle - WITH TEXT SHADOW */}
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.5rem' },
                    opacity: 0.95,
                    mb: 3,
                    textShadow: '1px 1px 4px rgba(0,0,0,0.3)',
                    fontWeight: 400,
                  }}
                >
                  {banner.subtitle}
                </Typography>

                {/* Button - IMPROVED STYLING */}
                <Button
                  component={Link}
                  to={banner.link || '/products'}
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: '#ff6b00',
                    '&:hover': { 
                      bgcolor: '#e55a00',
                      transform: 'scale(1.02)',
                    },
                    px: { xs: 3, sm: 4, md: 5 },
                    py: { xs: 1, sm: 1.5 },
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                    boxShadow: '0 4px 15px rgba(255,107,0,0.4)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {banner.buttonText || 'Shop Now'} →
                </Button>
              </Box>
            </Box>
          ))
        ) : (
          <Box sx={{ width: '100%', height: '100%', bgcolor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            <Typography variant="h5">No banners available</Typography>
          </Box>
        )}

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <IconButton
              onClick={handlePrevSlide}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                zIndex: 10,
                '&:hover': { transform: 'translateY(-50%) scale(1.1)' },
              }}
            >
              <NavigateBefore />
            </IconButton>
            <IconButton
              onClick={handleNextSlide}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                zIndex: 10,
                '&:hover': { transform: 'translateY(-50%) scale(1.1)' },
              }}
            >
              <NavigateNext />
            </IconButton>

            {/* Indicators - IMPROVED */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1.5,
                zIndex: 10,
              }}
            >
              {banners.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  sx={{
                    width: index === currentSlide ? 28 : 10,
                    height: 10,
                    borderRadius: 5,
                    bgcolor: index === currentSlide ? '#ff6b00' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: index === currentSlide ? '#ff6b00' : 'rgba(255,255,255,0.8)',
                      transform: 'scale(1.1)',
                    },
                  }}
                />
              ))}
            </Box>
          </>
        )}
      </Box>

      {/* ===== FEATURES BAR ===== */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid container spacing={2} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'white',
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                <Box sx={{ color: '#ff6b00' }}>{feature.icon}</Box>
                <Box>
                  <Typography variant="body1" fontWeight={600}>{feature.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{feature.desc}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ===== TODAY'S DEALS ===== */}
      {latestProducts.length > 0 && (
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight={700}>🔥 Today's Deals</Typography>
            <Button component={Link} to="/products" endIcon={<ArrowForward />} size="small">View All</Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#ddd', borderRadius: 3 } }}>
            {latestProducts.map((product) => (
              <Card key={product.id} sx={{ minWidth: 200, maxWidth: 200, flexShrink: 0, borderRadius: 3, overflow: 'hidden' }}>
                <CardActionArea component={Link} to={`/product/${product.id}`}>
                  <Box sx={{ height: 150, overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      image={product.image || 'https://via.placeholder.com/200x150'}
                      alt={product.name}
                      sx={{ height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="body2" fontWeight={500} noWrap>{product.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight={700} color="#ff6b00">
                        ${(product.discountedPrice || product.price).toFixed(2)}
                      </Typography>
                      {product.originalPrice && (
                        <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                          ${product.originalPrice.toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                    {product.discount > 0 && <Chip label={`-${product.discount}%`} size="small" color="error" sx={{ mt: 0.5 }} />}
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Container>
      )}

      {/* ===== FEATURED PRODUCTS ===== */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>⭐ Featured Products</Typography>
          <Button component={Link} to="/products" endIcon={<ArrowForward />} size="small">View All</Button>
        </Box>
        {featuredProducts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'white', borderRadius: 3 }}>
            <Typography variant="body1" color="text.secondary">No featured products yet.</Typography>
            {isAdmin && (
              <Button component={Link} to="/admin/products" variant="contained" sx={{ mt: 2 }}>
                Add Products
              </Button>
            )}
          </Box>
        ) : (
          <ProductGrid products={featuredProducts} />
        )}
      </Container>

      {/* ===== TRENDING PRODUCTS ===== */}
      {trendingProducts.length > 0 && (
        <Box sx={{ bgcolor: 'white', py: 4 }}>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight={700}>🔥 Trending Now</Typography>
              <Button component={Link} to="/products" endIcon={<ArrowForward />} size="small">View All</Button>
            </Box>
            <ProductGrid products={trendingProducts} />
          </Container>
        </Box>
      )}

      {/* ===== NEW ARRIVALS ===== */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>🆕 New Arrivals</Typography>
          <Button component={Link} to="/products" endIcon={<ArrowForward />} size="small">View All</Button>
        </Box>
        {latestProducts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'white', borderRadius: 3 }}>
            <Typography variant="body1" color="text.secondary">No products yet.</Typography>
            {isAdmin && (
              <Button component={Link} to="/admin/products" variant="contained" sx={{ mt: 2 }}>
                Add Products
              </Button>
            )}
          </Box>
        ) : (
          <ProductGrid products={latestProducts} />
        )}
      </Container>
    </Box>
  );
}

export default HomePage;
