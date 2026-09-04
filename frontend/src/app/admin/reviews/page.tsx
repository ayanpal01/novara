'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';;
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Check, X, Star, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminReviewsPage() {
  const { getToken } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [getToken, statusFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const queryParams = new URLSearchParams();
      if (statusFilter) queryParams.append('status', statusFilter);
      
      const { data } = await api.get(`/admin/reviews?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(data.reviews);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const token = await getToken();
      await api.put(`/admin/reviews/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Review ${status}`);
      fetchReviews(); // Refresh
    } catch (error) {
      toast.error('Failed to update review status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews Moderation</h1>
          <p className="text-muted-foreground mt-1">Approve or reject customer reviews before they appear publicly.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative min-w-[200px]">
          <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/20 border rounded-lg text-sm appearance-none focus:outline-none focus:border-black transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Review</th>
                <th className="px-6 py-4 font-medium">Author</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Loading reviews...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No reviews found.</td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
                          {review.product?.images?.[0] && <img src={review.product.images[0]} className="w-full h-full object-cover" />}
                        </div>
                        <p className="font-medium line-clamp-1 max-w-[150px]">{review.product?.name || 'Unknown'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{review.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-medium">{review.title}</p>
                      <p className="text-muted-foreground line-clamp-2 mt-0.5">{review.comment}</p>
                    </td>
                    <td className="px-6 py-4">
                      {review.user ? `${review.user.firstName} ${review.user.lastName}` : review.name || 'Guest'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${
                        review.status === 'approved' ? 'bg-green-100 text-green-700' : 
                        review.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {review.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {review.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleUpdateStatus(review._id, 'approved')}
                          >
                            <Check size={14} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleUpdateStatus(review._id, 'rejected')}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      )}
                      {review.status !== 'pending' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleUpdateStatus(review._id, review.status === 'approved' ? 'rejected' : 'approved')}
                        >
                          {review.status === 'approved' ? 'Reject' : 'Approve'}
                        </Button>
                      )}
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
