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
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ShoppingBag,
  AttachMoney,
  People,
  Store,
  ArrowUpward,
  ArrowDownward,
  Assessment,
  Download,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getProducts, getAllOrders, getAllUsers } from '../firebase/config';

function AdminDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('weekly');
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
        setStats({ revenue: 0, orders: 0, customers: 0, products: 0 });
        setRecentOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [timeframe]);

  const statCards = [
    { title: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: <AttachMoney />, color: 'primary.main' },
    { title: 'Orders', value: stats.orders, icon: <ShoppingBag />, color: 'secondary.main' },
    { title: 'Customers', value: stats.customers, icon: <People />, color: 'success.main' },
    { title: 'Products', value: stats.products, icon: <Store />, color: 'warning.main' },
  ];

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
            Unable to load dashboard data
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back! Here's what's happening with your store.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                label="Timeframe"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<Download />}>Export</Button>
            <Button variant="contained" startIcon={<Assessment />} component={Link} to="/admin/reports">Reports</Button>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
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

        {/* Recent Orders */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Orders</Typography>
                <Button size="small" component={Link} to="/admin/orders">View All</Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell><Typography variant="caption" sx={{ fontWeight: 600 }}>#{order.id?.slice(-6) || 'N/A'}</Typography></TableCell>
                          <TableCell><Typography variant="caption">{order.userId || 'N/A'}</Typography></TableCell>
                          <TableCell align="right"><Typography variant="caption" sx={{ fontWeight: 600 }}>${order.totalAmount?.toFixed(2) || '0.00'}</Typography></TableCell>
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
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
}

export default AdminDashboard;
