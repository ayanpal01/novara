'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Plus, Search, Edit, Trash2, Image as ImageIcon, Package, Tag, Layers, AlertCircle, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  category: { _id: string; name: string };
  gender?: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  status: 'draft' | 'active' | 'archived';
  images: string[];
  variants?: any[];
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products?limit=10&page=${page}&search=${searchTerm}`);
      setProducts(data.products);
      setTotalPages(data.pages);
      setTotalProducts(data.total);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => {
    if (activeTab === 'all') return true;
    const status = p.status || 'active';
    return status === activeTab;
  });

  const activeCount = products.filter(p => (p.status || 'active') === 'active').length;
  const draftCount = products.filter(p => p.status === 'draft').length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Catalog</h1>
          <p className="text-muted-foreground mt-1">Manage variants, stock, and pricing across your store.</p>
        </div>
        <Button type="button" className="gap-2 h-10 px-4" onClick={() => router.push('/admin/products/new')}>
          <Plus size={16} /> New Product
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Package size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Database</p>
            <h3 className="text-2xl font-bold">{totalProducts}</h3>
          </div>
        </div>
        <div className="bg-background border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
            <Tag size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active (Page)</p>
            <h3 className="text-2xl font-bold">{activeCount}</h3>
          </div>
        </div>
        <div className="bg-background border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-gray-500/10 flex items-center justify-center text-gray-600">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Drafts (Page)</p>
            <h3 className="text-2xl font-bold">{draftCount}</h3>
          </div>
        </div>
        <div className="bg-background border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
            <h3 className="text-2xl font-bold">{outOfStockCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-background border rounded-xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar & Tabs */}
        <div className="border-b px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20">
          <div className="flex gap-1 bg-background p-1 rounded-lg border">
            {['all', 'active', 'draft', 'archived'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                  activeTab === tab ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text"
              placeholder="Search catalog..."
              className="w-full pl-9 pr-4 h-9 bg-background border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Product</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Price</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Inventory</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse bg-background">
                    <td className="px-6 py-4"><div className="h-12 bg-muted rounded w-64" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-8 bg-muted rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-muted rounded-full w-20" /></td>
                    <td className="px-6 py-4"><div className="h-8 bg-muted rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted text-muted-foreground mb-4">
                      <Search size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">No products found</h3>
                    <p className="text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = product.status || 'active';
                  const variantsCount = product.variants?.length || 0;
                  
                  return (
                    <tr key={product._id} className="hover:bg-muted/20 transition-colors bg-background group">
                      {/* Product Cell */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-lg overflow-hidden border bg-muted flex items-center justify-center shrink-0 shadow-sm">
                            {product.images && product.images.length > 0 ? (
                              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                            ) : (
                              <ImageIcon size={20} className="text-muted-foreground/50" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground truncate max-w-[250px] block">{product.name}</span>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>{product.category?.name || 'Uncategorized'}</span>
                              {product.gender && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                  <span>{product.gender}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Price Cell */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">₹{product.price.toFixed(2)}</span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
                              ₹{product.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* Inventory Cell */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              product.stock <= 0 ? 'bg-destructive' : 
                              product.stock <= 5 ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                            <span className={`font-medium ${product.stock <= 0 ? 'text-destructive' : ''}`}>
                              {product.stock} in stock
                            </span>
                          </div>
                          {variantsCount > 0 && (
                            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-md inline-block w-max">
                              {variantsCount} variants
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* Status Cell */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                            status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500' :
                            status === 'draft' ? 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500'
                          }`}>
                            {status}
                          </span>
                          <div className="flex gap-1">
                            {product.isFeatured && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">★ FEATURED</span>
                            )}
                            {product.isNewArrival && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">NEW</span>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      {/* Actions Cell */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => router.push(`/admin/products/${product._id}/edit`)}>
                            <Edit size={16} />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product._id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t bg-muted/10 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing page <span className="font-medium text-foreground">{page}</span> of <span className="font-medium text-foreground">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 px-4" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-4" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
