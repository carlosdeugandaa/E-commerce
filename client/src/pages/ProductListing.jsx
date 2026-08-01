import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Button,
  Chip,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  FilterList,
  Close,
  Search,
  Sort,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/products/ProductCard';
import { getProducts } from '../firebase/config';
import { categories } from '../utils/constants';

function ProductListing() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    priceRange: [0, 1000],
    rating: 0,
    sortBy: 'relevance',
    inStock: false,
    onSale: false,
  });

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [page, setPage] = useState(1);
  const productsPerPage = 12;

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(false);
      try {
        const result = await getProducts({
          category: filters.category !== 'all' ? filters.category : undefined,
          sort: filters.sortBy === 'newest' ? 'createdAt' : undefined,
        });
        if (result.success) {
          setProducts(result.products || []);
        } else {
          setError(true);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setError(true);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [filters.category, filters.sortBy]);

  useEffect(() => {
    let result = [...products];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    result = result.filter(p => 
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    if (filters.rating > 0) {
      result = result.filter(p => p.rating >= filters.rating);
    }

    if (filters.inStock) {
      result = result.filter(p => p.stock > 0);
    }

    if (filters.onSale) {
      result = result.filter(p => p.discount > 0);
    }

    switch (filters.sortBy) {
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
        break;
    }

    setFilteredProducts(result);
    setPage(1);
  }, [products, filters]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const displayedProducts = filteredProducts.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  );

  const FilterContent = () => (
    <Box sx={{ p: isMobile ? 2 : 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Filters</Typography>
        {isMobile && (
          <IconButton onClick={() => setMobileFilterOpen(false)}>
            <Close />
          </IconButton>
        )}
      </Box>

      <TextField
        fullWidth
        size="small"
        placeholder="Search products..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        InputProps={{
          startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
        }}
        sx={{ mb: 3 }}
      />

      <FormControl fullWidth size="small" sx={{ mb: 3 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          label="Category"
        >
          <MenuItem value="all">All Categories</MenuItem>
          {categories.map(cat => (
            <MenuItem key={cat.id} value={cat.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ display: 'flex', fontSize: 20 }}>{cat.icon}</span>
                {cat.name}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          Price Range
        </Typography>
        <Slider
          value={filters.priceRange}
          onChange={(e, newValue) => setFilters({ ...filters, priceRange: newValue })}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
          step={10}
          sx={{ mt: 1 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption">${filters.priceRange[0]}</Typography>
          <Typography variant="caption">${filters.priceRange[1]}</Typography>
        </Box>
      </Box>

      <FormControl fullWidth size="small" sx={{ mb: 3 }}>
        <InputLabel>Minimum Rating</InputLabel>
        <Select
          value={filters.rating}
          onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
          label="Minimum Rating"
        >
          <MenuItem value={0}>Any Rating</MenuItem>
          <MenuItem value={4}>★★★★ & up</MenuItem>
          <MenuItem value={3}>★★★ & up</MenuItem>
          <MenuItem value={2}>★★ & up</MenuItem>
        </Select>
      </FormControl>

      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.inStock}
              onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
            />
          }
          label="In Stock Only"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.onSale}
              onChange={(e) => setFilters({ ...filters, onSale: e.target.checked })}
            />
          }
          label="On Sale"
        />
      </FormGroup>

      {(filters.category !== 'all' || filters.search || filters.inStock || filters.onSale) && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Active Filters:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {filters.category !== 'all' && (
              <Chip
                label={`Category: ${filters.category}`}
                onDelete={() => setFilters({ ...filters, category: 'all' })}
                size="small"
              />
            )}
            {filters.search && (
              <Chip
                label={`Search: ${filters.search}`}
                onDelete={() => setFilters({ ...filters, search: '' })}
                size="small"
              />
            )}
            {filters.inStock && (
              <Chip
                label="In Stock"
                onDelete={() => setFilters({ ...filters, inStock: false })}
                size="small"
              />
            )}
            {filters.onSale && (
              <Chip
                label="On Sale"
                onDelete={() => setFilters({ ...filters, onSale: false })}
                size="small"
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Unable to load products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please refresh the page or try again later.
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {!isMobile && (
          <Grid item md={3}>
            <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
              <FilterContent />
            </Paper>
          </Grid>
        )}

        <Grid item xs={12} md={9}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                All Products
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredProducts.length} products found
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {isMobile && (
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setMobileFilterOpen(true)}
                >
                  Filters
                </Button>
              )}

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  startAdornment={<Sort sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="rating">Rating</MenuItem>
                  <MenuItem value="newest">Newest</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {displayedProducts.length > 0 ? (
            <>
              <Grid container spacing={2}>
                <AnimatePresence>
                  {displayedProducts.map((product, index) => (
                    <Grid item xs={6} sm={6} md={4} key={product.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>

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
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" gutterBottom>
                No products found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your filters or search terms
              </Typography>
              <Button
                variant="contained"
                onClick={() => setFilters({
                  search: '',
                  category: 'all',
                  priceRange: [0, 1000],
                  rating: 0,
                  sortBy: 'relevance',
                  inStock: false,
                  onSale: false,
                })}
                sx={{ mt: 2 }}
              >
                Clear Filters
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>

      <Drawer
        anchor="bottom"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            p: 3,
          },
        }}
      >
        <FilterContent />
      </Drawer>
    </Container>
  );
}

export default ProductListing;
