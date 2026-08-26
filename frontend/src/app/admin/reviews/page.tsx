'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  user: { name: string; email: string };
  product: { _id: string; name: string; images: string[] };
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const { data } = await api.get(`/reviews${query}`);
      setReviews(data);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.put(`/reviews/${id}/status`, { status });
      toast.success(`Review ${status}`);
      // Optimistic update
      setReviews(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    } catch (error) {
      toast.error('Failed to update review status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Moderation</h1>
          <p className="text-muted-foreground mt-1">
            Approve or reject customer reviews before they appear on the storefront.
          </p>
        </div>
      </div>

      <div className="bg-background border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b flex gap-4 items-center bg-muted/30">
          <div className="flex gap-2">
            {['pending', 'approved', 'rejected', 'all'].map(status => (
              <Button 
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                className="capitalize"
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Comment</th>
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
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No {statusFilter !== 'all' ? statusFilter : ''} reviews found.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded overflow-hidden shrink-0">
                          {review.product?.images?.[0] && (
                            <img src={review.product.images[0]} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <p className="font-medium line-clamp-2 max-w-[200px]">{review.product?.name || 'Unknown'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{review.user?.name || 'Guest'}</p>
                      <p className="text-xs text-muted-foreground">{review.user?.email || ''}</p>
                      {review.isVerifiedPurchase && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded uppercase font-bold">Verified Buyer</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i >= review.rating ? 'text-muted' : ''} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm line-clamp-3 max-w-xs">{review.comment}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize flex items-center gap-1 w-max
                        ${review.status === 'approved' ? 'bg-green-100 text-green-700' :
                          review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'}`}
                      >
                        {review.status === 'approved' && <CheckCircle size={12} />}
                        {review.status === 'rejected' && <XCircle size={12} />}
                        {review.status === 'pending' && <Clock size={12} />}
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {review.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleUpdateStatus(review._id, 'approved')}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleUpdateStatus(review._id, 'rejected')}>
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(review._id, review.status === 'approved' ? 'rejected' : 'approved')}>
                          Mark {review.status === 'approved' ? 'Rejected' : 'Approved'}
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
