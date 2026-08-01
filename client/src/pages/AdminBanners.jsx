import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Close,
  Image,
  Link as LinkIcon,
  DragIndicator,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getBanners, addBanner, updateBanner, deleteBanner } from '../firebase/config';

function AdminBanners() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '/products',
    buttonText: 'Shop Now',
    order: 1,
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const result = await getBanners();
      if (result.success) {
        setBanners(result.banners);
      } else {
        toast.error('Failed to load banners');
      }
    } catch (error) {
      toast.error('Error loading banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'isActive' ? checked : value,
    });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title) errors.title = 'Title is required';
    if (!formData.image) errors.image = 'Image URL is required';
    if (!formData.link) errors.link = 'Link is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      let result;
      if (editingBanner) {
        result = await updateBanner(editingBanner.id, formData);
      } else {
        result = await addBanner(formData);
      }

      if (result.success) {
        toast.success(editingBanner ? 'Banner updated!' : 'Banner added!');
        setFormOpen(false);
        setEditingBanner(null);
        setFormData({
          title: '',
          subtitle: '',
          image: '',
          link: '/products',
          buttonText: 'Shop Now',
          order: banners.length + 1,
          isActive: true,
        });
        loadBanners();
      } else {
        toast.error(result.error || 'Failed to save banner');
      }
    } catch (error) {
      toast.error('Error saving banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      link: banner.link || '/products',
      buttonText: banner.buttonText || 'Shop Now',
      order: banner.order || 1,
      isActive: banner.isActive !== false,
    });
    setFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (bannerToDelete) {
      try {
        const result = await deleteBanner(bannerToDelete.id);
        if (result.success) {
          toast.success('Banner deleted!');
          setDeleteDialogOpen(false);
          setBannerToDelete(null);
          loadBanners();
        } else {
          toast.error('Failed to delete banner');
        }
      } catch (error) {
        toast.error('Error deleting banner');
      }
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      link: '/products',
      buttonText: 'Shop Now',
      order: banners.length + 1,
      isActive: true,
    });
    setFormErrors({});
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Manage Banners</Typography>
            <Typography variant="body2" color="text.secondary">
              {banners.length} banners in your store
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => setFormOpen(true)}>
            Add Banner
          </Button>
        </Box>

        {/* Banners Grid */}
        <Grid container spacing={3}>
          {banners.map((banner, index) => (
            <Grid item xs={12} sm={6} md={4} key={banner.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card sx={{ height: '100%', position: 'relative', borderRadius: 3 }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={banner.image}
                    alt={banner.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography variant="h6" noWrap>{banner.title}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {banner.subtitle}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Chip
                        label={banner.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={banner.isActive ? 'success' : 'error'}
                      />
                      <Chip label={`Order: ${banner.order}`} size="small" variant="outlined" />
                    </Box>
                  </CardContent>
                  <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleEdit(banner)} color="primary">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setBannerToDelete(banner);
                        setDeleteDialogOpen(true);
                      }}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
          {banners.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">No banners yet</Typography>
                <Typography variant="body2" color="text.secondary">
                  Click "Add Banner" to create your first banner
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </motion.div>

      {/* Add/Edit Banner Dialog */}
      <Dialog
        open={formOpen}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {editingBanner ? 'Edit Banner' : 'Add New Banner'}
            </Typography>
            <IconButton onClick={handleCloseForm}><Close /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL"
                  name="image"
                  value={formData.image}
                  onChange={handleFormChange}
                  error={!!formErrors.image}
                  helperText={formErrors.image}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Image /></InputAdornment>,
                  }}
                />
                {formData.image && (
                  <Box sx={{ mt: 1 }}>
                    <img
                      src={formData.image}
                      alt="Banner preview"
                      style={{ width: '100%', maxHeight: 100, objectFit: 'cover', borderRadius: 8 }}
                    />
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Link (URL)"
                  name="link"
                  value={formData.link}
                  onChange={handleFormChange}
                  error={!!formErrors.link}
                  helperText={formErrors.link}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LinkIcon /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Button Text"
                  name="buttonText"
                  value={formData.buttonText}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Order"
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={handleFormChange}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                    />
                  }
                  label="Active"
                />
              </Grid>
              {Object.keys(formErrors).length > 0 && (
                <Grid item xs={12}>
                  <Alert severity="error">Please fix the errors above.</Alert>
                </Grid>
              )}
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : (editingBanner ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Banner</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this banner?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}

export default AdminBanners;
