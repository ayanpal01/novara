'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';;
import api from '@/lib/axios';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users,
  ArrowUpRight,
  ArrowRight
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface Stats {
  revenue: number;
  orders: number;
  products: number;
  customers: number;
  statusDistribution: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  lowStockProducts: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: { firstName: string; lastName: string; email: string };
  pricing: { total: number };
  totalPrice: number;
  isPaid: boolean;
  orderStatus: string;
  createdAt: string;
}

// Generate mock data for the 30-day chart since backend doesn't aggregate by day yet
const generateMockChartData = () => {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    data.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      revenue: Math.floor(Math.random() * 500) + 100
    });
  }
  return data;
};

export default function AdminDashboardPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData] = useState(generateMockChartData());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = await getToken();
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/admin/dashboard', config),
          api.get('/admin/orders?limit=5', config)
        ]);
        
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.orders || []);
      } catch (error) {
        console.error('Failed to fetch admin data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [getToken]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <h1 className="text-3xl font-bold mb-6 text-transparent bg-muted rounded w-48">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </div>
        <div className="h-[400px] bg-muted rounded-xl w-full" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: `$${stats?.revenue.toFixed(2) || '0.00'}`, icon: DollarSign, trend: '+12.5%' },
    { title: 'Total Orders', value: stats?.orders || 0, icon: ShoppingBag, trend: '+5.2%' },
    { title: 'Products', value: stats?.products || 0, icon: Package, trend: '0%' },
    { title: 'Customers', value: stats?.customers || 0, icon: Users, trend: '+18.1%' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here is what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-background rounded-xl p-6 border shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Icon size={20} />
                </div>
                <span className="flex items-center text-xs font-medium text-green-600 bg-green-500/10 px-2 py-1 rounded-full">
                  {stat.trend} <ArrowUpRight size={14} className="ml-1" />
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Status Distribution & Low Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-yellow-50/50 border-yellow-200 border rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-yellow-800">Pending Orders</p>
          <h3 className="text-2xl font-bold mt-1 text-yellow-900">{stats?.statusDistribution.pending || 0}</h3>
        </div>
        <div className="bg-blue-50/50 border-blue-200 border rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-blue-800">Processing Orders</p>
          <h3 className="text-2xl font-bold mt-1 text-blue-900">{stats?.statusDistribution.processing || 0}</h3>
        </div>
        <div className="bg-purple-50/50 border-purple-200 border rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-purple-800">Shipped Orders</p>
          <h3 className="text-2xl font-bold mt-1 text-purple-900">{stats?.statusDistribution.shipped || 0}</h3>
        </div>
        <div className="bg-red-50/50 border-red-200 border rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-red-800">Low Stock Alerts</p>
          <h3 className="text-2xl font-bold mt-1 text-red-900">{stats?.lowStockProducts || 0} Products</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-background rounded-xl p-6 border shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Revenue Overview (Last 30 Days)</h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" opacity={0.2} vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-background rounded-xl p-6 border shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className={buttonVariants({ variant: "ghost", size: "sm", className: "text-primary" })}>
              View All
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No orders found.</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex flex-col gap-2 pb-4 border-b last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest'} <span className="text-muted-foreground ml-1">({order.orderNumber})</span></p>
                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="font-semibold text-sm">₹{order.pricing ? order.pricing.total.toFixed(2) : order.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.orderStatus === 'shipped' ? 'bg-purple-100 text-purple-700' :
                        order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.orderStatus}
                      </span>
                      {order.isPaid && <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">Paid</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
