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
  CardActions,
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
import { motion, AnimatePresence } from 'framer-motion';
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
        setBanners(result.banners || []);
        if (result.banners.length === 0) {
          console.log('No banners found');
        }
      } else {
        // Don't show error for empty collection
        if (result.error?.includes('not found')) {
          setBanners([]);
        } else {
          toast.error('Failed to load banners');
        }
      }
    } catch (error) {
      console.error('Error loading banners:', error);
      // Don't show error for first time
      setBanners([]);
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
        // Set order to be last if not specified
        const order = formData.order || banners.length + 1;
        result = await addBanner({ ...formData, order });
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
        await loadBanners(); // Refresh the list
      } else {
        toast.error(result.error || 'Failed to save banner');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
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
          await loadBanners();
        } else {
          toast.error('Failed to delete banner');
        }
      } catch (error) {
        console.error('Error deleting banner:', error);
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

  const toggleBannerStatus = async (banner) => {
    try {
      const updated = { ...banner, isActive: !banner.isActive };
      const result = await updateBanner(banner.id, updated);
      if (result.success) {
        toast.success(`Banner ${updated.isActive ? 'activated' : 'deactivated'}`);
        await loadBanners();
      } else {
        toast.error('Failed to update banner status');
      }
    } catch (error) {
      console.error('Error toggling banner status:', error);
      toast.error('Error updating banner status');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
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
          <AnimatePresence>
            {banners.length > 0 ? (
              banners.map((banner, index) => (
                <Grid item xs={12} sm={6} md={4} key={banner.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card sx={{ height: '100%', position: 'relative', borderRadius: 3, overflow: 'hidden' }}>
                      <Box sx={{ position: 'relative', height: 160 }}>
                        <CardMedia
                          component="img"
                          height="160"
                          image={banner.image}
                          alt={banner.title}
                          sx={{ objectFit: 'cover' }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            display: 'flex',
                            gap: 0.5,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(banner)}
                            sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' } }}
                          >
                            <Edit fontSize="small" color="primary" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setBannerToDelete(banner);
                              setDeleteDialogOpen(true);
                            }}
                            sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' } }}
                          >
                            <Delete fontSize="small" color="error" />
                          </IconButton>
                        </Box>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                          }}
                        >
                          <Chip
                            label={banner.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={banner.isActive ? 'success' : 'error'}
                            onClick={() => toggleBannerStatus(banner)}
                            sx={{ cursor: 'pointer' }}
                          />
                        </Box>
                      </Box>
                      <CardContent>
                        <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
                          {banner.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {banner.subtitle || 'No subtitle'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Chip
                            label={`Order: ${banner.order || 1}`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={banner.link || '/'}
                            size="small"
                            variant="outlined"
                            icon={<LinkIcon fontSize="small" />}
                          />
                        </Box>
                      </CardContent>
                      <CardActions sx={{ px: 2, pb: 2 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => handleEdit(banner)}
                          fullWidth
                        >
                          Edit
                        </Button>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <Image sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No banners yet</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Click "Add Banner" to create your first banner
                    </Typography>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setFormOpen(true)} sx={{ mt: 2 }}>
                      Add Banner
                    </Button>
                  </Paper>
                </motion.div>
              </Grid>
            )}
          </AnimatePresence>
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
                  placeholder="Brief description of the banner"
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
                  placeholder="https://example.com/banner.jpg"
                />
                {formData.image && (
                  <Box sx={{ mt: 1, borderRadius: 2, overflow: 'hidden', border: '1px solid #eee' }}>
                    <img
                      src={formData.image}
                      alt="Banner preview"
                      style={{ width: '100%', maxHeight: 150, objectFit: 'cover' }}
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
                  placeholder="/products"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Button Text"
                  name="buttonText"
                  value={formData.buttonText}
                  onChange={handleFormChange}
                  placeholder="Shop Now"
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
                  helperText="Lower numbers appear first"
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
          <Typography>
            Are you sure you want to delete <strong>"{bannerToDelete?.title}"</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" startIcon={<Delete />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AdminBanners;
