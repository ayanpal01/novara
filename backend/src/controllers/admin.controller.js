const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// GET /api/admin/stats
// Get overview statistics for the admin dashboard
exports.getStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'user' });
    
    // Calculate total revenue from all delivered or paid orders (for now just all orders for simplicity in test)
    const orders = await Order.find();
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    res.json({
      revenue: totalRevenue,
      orders: totalOrders,
      products: totalProducts,
      customers: totalCustomers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/customers
// Get a list of all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.find({}).select('-password -__v').sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/sales-report
// Get sales report (date-range revenue, top products)
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const orders = await Order.find(query);
    const revenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    // Calculate top products
    const productSales = {};
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (!productSales[item.product]) {
          productSales[item.product] = {
            name: item.name,
            qty: 0,
            revenue: 0
          };
        }
        productSales[item.product].qty += item.qty;
        productSales[item.product].revenue += (item.qty * item.price);
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // top 5

    res.json({
      revenue,
      orderCount: orders.length,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
