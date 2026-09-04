'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';;
import api from '@/lib/axios';
import { Search, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminCustomersPage() {
  const { getToken } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const queryParams = new URLSearchParams();
        if (searchTerm) queryParams.append('search', searchTerm);
        
        const { data } = await api.get(`/admin/customers?${queryParams.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomers(data?.customers || []);
      } catch (error) {
        console.error('Failed to fetch customers', error);
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchCustomers();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [getToken, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage and view registered customer accounts.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative w-full max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by Name or Email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/20 border rounded-lg text-sm focus:outline-none focus:border-black transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No customers found.</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                          {(customer.name?.[0] || customer.email?.[0] || 'U').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-base">
                            {customer.name || customer.email?.split('@')[0] || 'Unknown User'}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">{customer.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail size={14} /> <span>{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone size={14} /> <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {customer.addresses && customer.addresses.length > 0 ? (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin size={14} className="mt-0.5 shrink-0" /> 
                          <span className="line-clamp-2">{customer.addresses[0].city}, {customer.addresses[0].state}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">No address provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
