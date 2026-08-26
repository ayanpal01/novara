'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Mail, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/nextjs';

interface Customer {
  _id: string;
  name: string;
  email: string;
  clerkId: string;
  role: string;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const { getToken } = useAuth();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = await getToken();
        const { data } = await api.get('/admin/customers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomers(data);
        setFilteredCustomers(data);
      } catch (error) {
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [getToken]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredCustomers(
        customers.filter(c => 
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          c.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">View registered customers and their accounts.</p>
        </div>
      </div>

      <div className="bg-background border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Registered Date</th>
                <th className="px-6 py-4 font-medium">Platform ID</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-48" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4">
                      <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-primary hover:underline">
                        <Mail size={14} /> {customer.email}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        customer.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {customer.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                      {customer.clerkId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a href={`/admin/orders?user=${customer._id}`} className="text-xs font-semibold text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-full inline-block transition-colors">
                        View Orders
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t text-xs text-muted-foreground bg-muted/20">
          Showing {filteredCustomers.length} of {customers.length} total customers.
        </div>
      </div>
    </div>
  );
}
