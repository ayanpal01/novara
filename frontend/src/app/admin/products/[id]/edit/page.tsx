'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/axios';
import ProductForm from '@/components/admin/ProductForm';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // We might only have getProductBySlug on backend, let's check.
        // Actually, the backend might have GET /products/:id for admin, or we can just fetch all products and find it.
        // Wait, the API for GET /api/products/:slug in product.routes.js is what we have.
        // The admin list gives us the _id. But we don't have a GET /api/products/:id endpoint.
        // Let's modify the backend product.routes.js to support GET /:id or we just fetch by slug if we pass slug.
        // For now, let's just fetch all products and filter, or add an endpoint if needed.
        // Let's assume we can fetch it. If the API fails, we'll see.
        // Wait, we have GET /api/products/:slug. Since slug is unique, we could pass slug in URL.
        // But the admin table passes _id. Let's fetch all products and find it for now to be safe, or just use GET /api/products then find.
        const { data } = await api.get('/products?limit=1000');
        const product = data.products.find((p: any) => p._id === id);
        
        if (product) {
          setInitialData(product);
        } else {
          setError('Product not found');
        }
      } catch (err: any) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center py-12 animate-pulse">Loading product data...</div>;
  if (error) return <div className="text-center py-12 text-destructive">{error}</div>;

  return <ProductForm initialData={initialData} isEdit />;
}
