import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  LocalShipping,
  CheckCircle,
  Pending,
  Cancel,
  Receipt,
  Print,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

function AdminOrderDetails({ order, loading }) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No order details available
        </Typography>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      delivered: 'success',
      processing: 'info',
      shipped: 'primary',
      pending: 'warning',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle />;
      case 'processing': return <Pending />;
      case 'shipped': return <LocalShipping />;
      case 'cancelled': return <Cancel />;
      default: return <Pending />;
    }
  };

  // Format date from Firestore timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const handlePrint = () => {
    toast.info('Printing invoice...', {
      position: 'bottom-right',
    });
  };

  const handleTrackOrder = () => {
    toast.info(`Tracking order #${order.id?.slice(-6) || 'N/A'}`, {
      position: 'bottom-right',
    });
  };

  return (
    <Box>
      {/* Status and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Status:
          </Typography>
          <Chip
            icon={getStatusIcon(order.orderStatus)}
            label={order.orderStatus ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1) : 'Pending'}
            color={getStatusColor(order.orderStatus)}
          />
        </Box>
        <Box>
          <Button
            size="small"
            startIcon={<TrackChanges />}
            onClick={handleTrackOrder}
            sx={{ mr: 1 }}
          >
            Track
          </Button>
          <Button
            size="small"
            startIcon={<Print />}
            onClick={handlePrint}
          >
            Print
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Order Info */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Typography variant="caption" color="text.secondary">
            Order ID
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            #{order.id?.slice(-8) || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="caption" color="text.secondary">
            Date
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {formatDate(order.createdAt)}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="caption" color="text.secondary">
            Payment Method
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {order.paymentMethod || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="caption" color="text.secondary">
            Payment Status
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            <Chip
              label={order.paymentStatus || 'Pending'}
              size="small"
              color={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'failed' ? 'error' : 'warning'}
            />
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="caption" color="text.secondary">
            Total Amount
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
            ${order.totalAmount?.toFixed(2) || '0.00'}
          </Typography>
        </Grid>
        {order.trackingNumber && (
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary">
              Tracking Number
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {order.trackingNumber}
            </Typography>
          </Grid>
        )}
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Customer Info */}
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Customer Information
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="caption" color="text.secondary">
            User ID
          </Typography>
          <Typography variant="body2">{order.userId || 'N/A'}</Typography>
        </Grid>
        {order.shippingAddress && (
          <>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Shipping Address
              </Typography>
              <Typography variant="body2">
                {order.shippingAddress.fullName || order.shippingAddress.name || 'N/A'}<br />
                {order.shippingAddress.addressLine1 || 'N/A'}<br />
                {order.shippingAddress.city && order.shippingAddress.state && (
                  `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode || ''}`
                )}
                <br />
                {order.shippingAddress.country || 'N/A'}
              </Typography>
            </Grid>
          </>
        )}
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Order Items */}
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
        Order Items
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {item.image && (
                        <Box
                          component="img"
                          src={item.image}
                          alt={item.name}
                          sx={{
                            width: 40,
                            height: 40,
                            objectFit: 'cover',
                            borderRadius: 1,
                          }}
                        />
                      )}
                      <Typography variant="body2">{item.name || 'Unnamed Product'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">{item.quantity || 0}</TableCell>
                  <TableCell align="right">${item.price?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No items in this order
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={3} align="right" sx={{ fontWeight: 600 }}>
                Subtotal
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                ${order.totalAmount?.toFixed(2) || '0.00'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Notes */}
      {order.notes && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Order Notes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {order.notes}
          </Typography>
        </>
      )}

      {/* Order Actions */}
      <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<LocalShipping />}
          onClick={handleTrackOrder}
        >
          Track Order
        </Button>
        {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<Cancel />}
            onClick={() => toast.info('Cancelling order...')}
          >
            Cancel Order
          </Button>
        )}
        <Button
          size="small"
          variant="outlined"
          startIcon={<Receipt />}
          onClick={handlePrint}
        >
          Download Invoice
        </Button>
      </Box>
    </Box>
  );
}

export default AdminOrderDetails;
