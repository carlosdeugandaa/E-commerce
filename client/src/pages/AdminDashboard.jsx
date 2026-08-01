import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ShoppingBag,
  AttachMoney,
  People,
  Store,
  Add,
  Dashboard,
  Inventory,
  ShoppingCart,
  Person,
  Settings,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getProducts, getAllOrders, getAllUsers } from '../firebase/config';

function AdminDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(false);
      try {
        const [productsResult, ordersResult, usersResult] = await Promise.all([
          getProducts(),
          getAllOrders(),
          getAllUsers(),
        ]);

        const products = productsResult.success ? productsResult.products : [];
        const orders = ordersResult.success ? ordersResult.orders : [];
        const users = usersResult.success ? usersResult.users : [];

        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        setStats({
          revenue: totalRevenue,
          orders: orders.length,
          customers: users.length,
          products: products.length,
        });

        setRecentOrders(orders.slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statCards = [
    { title: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: <AttachMoney />, color: '#4CAF50' },
    { title: 'Orders', value: stats.orders, icon: <ShoppingBag />, color: '#2196F3' },
    { title: 'Customers', value: stats.customers, icon: <People />, color: '#FF9800' },
    { title: 'Products', value: stats.products, icon: <Store />, color: '#9C27B0' },
  ];

  // Quick action cards for admin
  const quickActions = [
    { title: 'Add Product', icon: <Add />, path: '/admin/products', color: '#4CAF50' },
    { title: 'Manage Products', icon: <Inventory />, path: '/admin/products', color: '#2196F3' },
    { title: 'View Orders', icon: <ShoppingCart />, path: '/admin/orders', color: '#FF9800' },
    { title: 'Manage Users', icon: <Person />, path: '/admin/users', color: '#9C27B0' },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Unable to load dashboard data
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
                Admin Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Welcome back! Here's what's happening with your store.
              </Typography>
            </Box>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                            {stat.title}
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                            {stat.value}
                          </Typography>
                        </Box>
                        <Box sx={{ bgcolor: stat.color, color: 'white', p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {stat.icon}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Quick Actions - One Click Admin Access */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1a237e' }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {quickActions.map((action, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Button
                  component={Link}
                  to={action.path}
                  variant="contained"
                  startIcon={action.icon}
                  sx={{
                    width: '100%',
                    py: 2,
                    borderRadius: 3,
                    bgcolor: action.color,
                    '&:hover': { bgcolor: action.color, opacity: 0.8 },
                  }}
                >
                  {action.title}
                </Button>
              </Grid>
            ))}
          </Grid>

          {/* Recent Orders */}
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
                Recent Orders
              </Typography>
              <Button size="small" component={Link} to="/admin/orders" sx={{ color: '#2196F3' }}>
                View All
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Order</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            #{order.id?.slice(-6) || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{order.userId || 'N/A'}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            ${order.totalAmount?.toFixed(2) || '0.00'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={order.orderStatus || 'pending'}
                            size="small"
                            color={order.orderStatus === 'delivered' ? 'success' : order.orderStatus === 'cancelled' ? 'error' : 'warning'}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary">No orders yet</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

export default AdminDashboard;
