import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { addProduct, updateProduct } from '../firebase/config';
import { toast } from 'react-toastify';

function AdminProductForm({ product, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    originalPrice: product?.originalPrice || '',
    discount: product?.discount || 0,
    category: product?.category || 'electronics',
    stock: product?.stock || '',
    brand: product?.brand || '',
    image: product?.image || '',
    isActive: product?.isActive !== undefined ? product.isActive : true,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'isActive' ? checked : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.price) newErrors.price = 'Price is required';
    else if (isNaN(formData.price) || formData.price <= 0) newErrors.price = 'Price must be a positive number';
    if (!formData.stock) newErrors.stock = 'Stock is required';
    else if (isNaN(formData.stock) || formData.stock < 0) newErrors.stock = 'Stock must be a non-negative number';
    if (formData.originalPrice && (isNaN(formData.originalPrice) || formData.originalPrice < 0)) {
      newErrors.originalPrice = 'Original price must be a positive number';
    }
    if (formData.discount && (isNaN(formData.discount) || formData.discount < 0 || formData.discount > 100)) {
      newErrors.discount = 'Discount must be between 0 and 100';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
      discount: parseInt(formData.discount) || 0,
      stock: parseInt(formData.stock),
    };

    let result;
    if (product) {
      // Update existing product
      result = await updateProduct(product.id, productData);
    } else {
      // Add new product
      result = await addProduct(productData);
    }

    setLoading(false);

    if (result.success) {
      toast.success(product ? 'Product updated successfully!' : 'Product added successfully!');
      onSubmit();
    } else {
      toast.error(result.error || 'Failed to save product');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
            multiline
            rows={3}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Price ($)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            error={!!errors.price}
            helperText={errors.price}
            required
            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Original Price ($) (Optional)"
            name="originalPrice"
            type="number"
            value={formData.originalPrice}
            onChange={handleChange}
            error={!!errors.originalPrice}
            helperText={errors.originalPrice}
            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Discount (%)"
            name="discount"
            type="number"
            value={formData.discount}
            onChange={handleChange}
            error={!!errors.discount}
            helperText={errors.discount}
            InputProps={{ inputProps: { min: 0, max: 100 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Stock Quantity"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            error={!!errors.stock}
            helperText={errors.stock}
            required
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              label="Category"
            >
              <MenuItem value="electronics">Electronics</MenuItem>
              <MenuItem value="fashion">Fashion</MenuItem>
              <MenuItem value="home">Home & Kitchen</MenuItem>
              <MenuItem value="beauty">Beauty</MenuItem>
              <MenuItem value="sports">Sports</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Brand (Optional)"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Image URL"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
          {formData.image && (
            <Box sx={{ mt: 1 }}>
              <Chip
                label="Image URL provided"
                color="success"
                size="small"
              />
            </Box>
          )}
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
            }
            label="Active Product"
          />
        </Grid>
        <Grid item xs={12}>
          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Please fix the errors above.
            </Alert>
          )}
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : (product ? 'Update Product' : 'Add Product')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
}

export default AdminProductForm;
