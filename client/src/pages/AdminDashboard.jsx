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
  LinearProgress,
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
  const [chartData, setChartData] = useState([]);

  // Load real data from Firestore
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Get products
        const productsResult = await getProducts();
        const products = productsResult.success ? productsResult.products : [];
        
        // Get orders
        const ordersResult = await getAllOrders();
        const orders = ordersResult.success ? ordersResult.orders : [];
        
        // Get users
        const usersResult = await getAllUsers();
        const users = usersResult.success ? usersResult.users : [];

        // Calculate stats
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const totalOrders = orders.length;
        const totalCustomers = users.length;
        const totalProducts = products.length;

        setStats({
          revenue: totalRevenue,
          orders: totalOrders,
          customers: totalCustomers,
          products: totalProducts,
        });

        // Recent orders (last 5)
        setRecentOrders(orders.slice(0, 5));

        // Mock chart data (you can replace with real data later)
        setChartData([
          { day: 'Mon', revenue: 1200, orders: 15 },
          { day: 'Tue', revenue: 1800, orders: 22 },
          { day: 'Wed', revenue: 900, orders: 11 },
          { day: 'Thu', revenue: 2100, orders: 28 },
          { day: 'Fri', revenue: 1600, orders: 19 },
          { day: 'Sat', revenue: 2800, orders: 35 },
          { day: 'Sun', revenue: 1400, orders: 17 },
        ]);

      } catch (error) {
        console.error('Error loading dashboard:', error);
      }
      setLoading(false);
    };

    loadDashboardData();
  }, [timeframe]);

  const statCards = [
    { title: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: <AttachMoney />, color: 'primary.main', change: '+12.5%', trend: 'up' },
    { title: 'Orders', value: stats.orders, icon: <ShoppingBag />, color: 'secondary.main', change: '+8.2%', trend: 'up' },
    { title: 'Customers', value: stats.customers, icon: <People />, color: 'success.main', change: '+5.3%', trend: 'up' },
    { title: 'Products', value: stats.products, icon: <Store />, color: 'warning.main', change: '-2.1%', trend: 'down' },
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>Dashboard</Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Paper sx={{ p: 3 }}>
                <LinearProgress />
              </Paper>
            </Grid>
          ))}
        </Grid>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                          {stat.trend === 'up' ? (
                            <ArrowUpward sx={{ fontSize: 14, color: 'success.main' }} />
                          ) : (
                            <ArrowDownward sx={{ fontSize: 14, color: 'error.main' }} />
                          )}
                          <Typography variant="caption" color={stat.trend === 'up' ? 'success.main' : 'error.main'}>
                            {stat.change}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">vs last period</Typography>
                        </Box>
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
                          <TableCell><Typography variant="caption" sx={{ fontWeight: 600 }}>#{order.id.slice(-6)}</Typography></TableCell>
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
                        <TableCell colSpan={4} align="center">No orders yet</TableCell>
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
