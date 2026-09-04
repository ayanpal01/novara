'use client';

import { useState, useMemo } from 'react';
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
  reviews?: Review[];
}

export default function ProductReviews({ productId, reviews: initialReviews }: ProductReviewsProps) {
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  const reviews = initialReviews || [];
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { average: 0, breakdown: [0, 0, 0, 0, 0], total: 0 };

    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    const average = (sum / total).toFixed(1);

    const counts = [0, 0, 0, 0, 0]; // 1 star to 5 star
    reviews.forEach(rev => {
      if (rev.rating >= 1 && rev.rating <= 5) {
        counts[rev.rating - 1]++;
      }
    });

    return { average, breakdown: counts, total };
  }, [reviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error('Please write a comment');
    
    setIsSubmitting(true);
    try {
      const token = await getToken();
      await api.post('/reviews', { 
        product: productId, 
        rating, 
        comment 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Review submitted! It will appear once approved.');
      setComment('');
      setRating(5);
      setIsModalOpen(false);
      
      // Reload to see the new data (simplest way in this context)
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-20 border-t border-muted">
      
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-16">
        
        {/* Left: Summary & Stats */}
        <div className="lg:w-[40%] shrink-0">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Customer Reviews</h2>
          
          {reviews.length > 0 ? (
            <div className="bg-muted/30 p-8 rounded-2xl">
              <div className="flex items-end gap-4 mb-8">
                <span className="text-6xl font-black tracking-tighter leading-none">{stats.average}</span>
                <div className="mb-1">
                  <div className="flex text-foreground mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={20} fill={star <= Number(stats.average) ? 'currentColor' : 'none'} className={star > Number(stats.average) ? 'text-muted-foreground/30' : ''} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Based on {stats.total} reviews</p>
                </div>
              </div>

              {/* Breakdown Bars */}
              <div className="space-y-3 mb-8">
                {[5, 4, 3, 2, 1].map((star, idx) => {
                  const count = stats.breakdown[star - 1];
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-sm font-medium">
                      <div className="w-10 flex items-center gap-1 text-muted-foreground">
                        {star} <Star size={12} fill="currentColor" />
                      </div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-foreground rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-8 text-right text-muted-foreground">{count}</div>
                    </div>
                  );
                })}
              </div>

              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <Button className="w-full h-12 font-bold uppercase tracking-widest text-xs" onClick={() => setIsModalOpen(true)}>
                  Write a Review
                </Button>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold uppercase tracking-widest">Write a Review</DialogTitle>
                  </DialogHeader>
                  <div className="pt-4">
                    {isSignedIn ? (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-muted-foreground">Overall Rating</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="transition-transform hover:scale-110 focus:outline-none"
                              >
                                <Star size={32} fill={star <= rating ? 'currentColor' : 'none'} className={star <= rating ? 'text-foreground' : 'text-muted'} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label htmlFor="comment" className="block text-xs font-bold uppercase tracking-widest mb-3 text-muted-foreground">Your Review</label>
                          <textarea
                            id="comment"
                            rows={5}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full rounded-md border bg-background px-4 py-3 text-sm text-foreground focus:ring-1 focus:ring-foreground outline-none transition-all resize-none placeholder:text-muted-foreground/50"
                            placeholder="What did you like or dislike about this product?"
                            required
                          />
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="w-full h-12 font-bold uppercase tracking-widest text-xs">
                          {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center py-10">
                        <MessageSquare size={48} className="mx-auto text-muted mb-4" strokeWidth={1} />
                        <p className="text-foreground font-semibold mb-2">Want to share your thoughts?</p>
                        <p className="text-sm text-muted-foreground">Please sign in to write a review.</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="bg-muted/30 p-10 rounded-2xl text-center flex flex-col items-center justify-center">
              <div className="flex text-muted-foreground/30 mb-6">
                {[1,2,3,4,5].map(i => <Star key={i} size={32} fill="currentColor" />)}
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight">No reviews yet</h3>
              <p className="text-muted-foreground mb-8">Be the first to share your experience with this product.</p>
              
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <Button variant="outline" className="font-bold uppercase tracking-widest text-xs h-12 px-8 border-input" onClick={() => setIsModalOpen(true)}>
                  Write a Review
                </Button>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold uppercase tracking-widest">Write a Review</DialogTitle>
                  </DialogHeader>
                  <div className="pt-4">
                    {isSignedIn ? (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-muted-foreground">Overall Rating</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="transition-transform hover:scale-110 focus:outline-none"
                              >
                                <Star size={32} fill={star <= rating ? 'currentColor' : 'none'} className={star <= rating ? 'text-foreground' : 'text-muted'} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label htmlFor="comment" className="block text-xs font-bold uppercase tracking-widest mb-3 text-muted-foreground">Your Review</label>
                          <textarea
                            id="comment"
                            rows={5}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full rounded-md border bg-background px-4 py-3 text-sm text-foreground focus:ring-1 focus:ring-foreground outline-none transition-all resize-none placeholder:text-muted-foreground/50"
                            placeholder="What did you like or dislike about this product?"
                            required
                          />
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="w-full h-12 font-bold uppercase tracking-widest text-xs">
                          {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center py-10">
                        <MessageSquare size={48} className="mx-auto text-muted mb-4" strokeWidth={1} />
                        <p className="text-foreground font-semibold mb-2">Want to share your thoughts?</p>
                        <p className="text-sm text-muted-foreground">Please sign in to write a review.</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Right: Review List */}
        <div className="flex-1">
          {reviews.length > 0 && (
            <div className="space-y-8">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-muted pb-8 last:border-0">
                  <div className="flex text-foreground mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i >= review.rating ? 'text-muted' : ''} />
                    ))}
                  </div>
                  <h4 className="font-bold mb-2 tracking-tight">{review.rating >= 4 ? 'Excellent' : review.rating === 3 ? 'Good' : 'Could be better'}</h4>
                  <p className="text-muted-foreground leading-relaxed mb-4 text-sm sm:text-base">{review.comment}</p>
                  
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span className="text-foreground font-bold">{review.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-500">
                      <CheckCircle2 size={12} /> Verified Buyer
                    </span>
                    <span>•</span>
                    <span>{new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              ))}
              
              {/* Pagination Placeholder if we had more than visible */}
              {reviews.length > 5 && (
                <div className="pt-4 text-center">
                  <Button variant="outline" className="font-bold uppercase tracking-widest text-xs h-12 px-8">
                    Load More Reviews
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
