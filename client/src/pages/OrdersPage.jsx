import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search,
  ShoppingBag,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import OrderCard from '../components/profile/OrderCard';
import { getOrders } from '../firebase/config';

function OrdersPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const result = await getOrders(user.uid);
      if (result.success) {
        setOrders(result.orders);
      }
      setLoading(false);
    };
    loadOrders();
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
  };

  // Filter orders based on tab and search
  const filteredOrders = orders.filter(order => {
    if (tabValue === 1) {
      return order.orderStatus === 'processing' || order.orderStatus === 'shipped';
    } else if (tabValue === 2) {
      return order.orderStatus === 'delivered';
    } else if (tabValue === 3) {
      return order.orderStatus === 'cancelled';
    }
    return true;
  });

  const itemsPerPage = 3;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const displayedOrders = filteredOrders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography>Loading orders...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          My Orders
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ width: isMobile ? '100%' : 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant={isMobile ? 'fullWidth' : 'standard'}
        sx={{ mb: 3 }}
      >
        <Tab label="All" />
        <Tab label="Processing" />
        <Tab label="Delivered" />
        <Tab label="Cancelled" />
      </Tabs>

      {/* Orders List */}
      {displayedOrders.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {displayedOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <OrderCard order={order} />
            </motion.div>
          ))}

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
        </motion.div>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ShoppingBag sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No orders yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your filters'
              : 'Start shopping to see your orders here'}
          </Typography>
          {(searchTerm || statusFilter !== 'all') && (
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              sx={{ mt: 2 }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

export default OrdersPage;
