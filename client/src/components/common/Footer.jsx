import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  YouTube,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'white', py: 6, mt: 'auto' }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              🛍️ ShopHub
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.400', mb: 2 }}>
              Your one-stop shop for quality products at the best prices.
              Shop with confidence and enjoy fast delivery.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton sx={{ color: 'grey.400' }} size="small">
                <Facebook />
              </IconButton>
              <IconButton sx={{ color: 'grey.400' }} size="small">
                <Twitter />
              </IconButton>
              <IconButton sx={{ color: 'grey.400' }} size="small">
                <Instagram />
              </IconButton>
              <IconButton sx={{ color: 'grey.400' }} size="small">
                <YouTube />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom>
              Shop
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="grey.400" underline="hover">
                All Products
              </Link>
              <Link href="#" color="grey.400" underline="hover">
                New Arrivals
              </Link>
              <Link href="#" color="grey.400" underline="hover">
                Best Sellers
              </Link>
              <Link href="#" color="grey.400" underline="hover">
                Deals & Offers
              </Link>
            </Box>
          </Grid>

          {/* Customer Service */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom>
              Customer Service
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="grey.400" underline="hover">
                Help Center
              </Link>
              <Link href="#" color="grey.400" underline="hover">
                Returns Policy
              </Link>
              <Link href="#" color="grey.400" underline="hover">
                Shipping Info
              </Link>
              <Link href="#" color="grey.400" underline="hover">
                Contact Us
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocationOn sx={{ color: 'grey.400' }} />
                <Typography variant="body2" sx={{ color: 'grey.400' }}>
                  20028 Kampala Uganda 
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Phone sx={{ color: 'grey.400' }} />
                <Typography variant="body2" sx={{ color: 'grey.400' }}>
                  +256755045225 +256707071929
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Email sx={{ color: 'grey.400' }} />
                <Typography variant="body2" sx={{ color: 'grey.400' }}>
                  carlosdeuganda
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'grey.700' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'grey.400' }}>
            © {currentYear} dukkastore. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" color="grey.400" underline="hover" variant="body2">
              Privacy Policy
            </Link>
            <Link href="#" color="grey.400" underline="hover" variant="body2">
              Terms of Service
            </Link>
            <Link href="#" color="grey.400" underline="hover" variant="body2">
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
