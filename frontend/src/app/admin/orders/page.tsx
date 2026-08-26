'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/nextjs';

interface Order {
  _id: string;
  user: { name: string; email: string };
  totalPrice: number;
  isPaid: boolean;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  orderNumber: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // To allow linking from customers page
  const [userIdFilter, setUserIdFilter] = useState('');

  useEffect(() => {
    // Read from URL query param
    const params = new URLSearchParams(window.location.search);
    const user = params.get('user');
    if (user) {
      setUserIdFilter(user);
    }
  }, []);

  const { getToken } = useAuth();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const query = `?limit=15&page=${page}${statusFilter ? `&status=${statusFilter}` : ''}${userIdFilter ? `&user=${userIdFilter}` : ''}`;
      const { data } = await api.get(`/orders${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(data.orders);
      setTotalPages(data.pages);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, userIdFilter, getToken]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            {userIdFilter ? 'Viewing orders for specific customer.' : 'Manage and fulfill customer orders.'}
          </p>
        </div>
        {userIdFilter && (
          <Button variant="outline" onClick={() => {
            setUserIdFilter('');
            window.history.replaceState({}, '', '/admin/orders');
          }}>
            Clear Customer Filter
          </Button>
        )}
      </div>

      <div className="bg-background border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b flex gap-4 items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Filter size={16} /> Filter by Status:
          </div>
          <select 
            className="flex h-9 w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-muted rounded-full w-16" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-muted rounded-full w-20" /></td>
                    <td className="px-6 py-4"><div className="h-8 bg-muted rounded w-10 ml-auto" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-muted-foreground">
                      #{order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{order.user?.name || 'Guest'}</p>
                      <p className="text-xs text-muted-foreground">{order.user?.email || ''}</p>
                    </td>
                    <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">₹{order.totalPrice.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {order.paymentStatus === 'paid' ? (
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Paid</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">{order.paymentStatus || 'Unpaid'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.orderStatus === 'shipped' ? 'bg-purple-100 text-purple-700' :
                        order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-700' :
                        order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/orders/${order._id}`}>
                          <Eye size={16} />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
