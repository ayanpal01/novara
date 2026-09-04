'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';;
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Tags, Plus, Edit, Trash2, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const { getToken } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    parentCategory: '',
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        description: category.description || '',
        image: category.image || '',
        parentCategory: category.parentCategory?._id || category.parentCategory || '',
        isActive: category.isActive !== undefined ? category.isActive : true
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        parentCategory: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Category name is required");

    try {
      setSubmitting(true);
      const token = await getToken();
      
      const payload = {
        ...formData,
        parentCategory: formData.parentCategory || null
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Category updated");
      } else {
        await api.post('/categories', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Category created");
      }
      
      handleCloseModal();
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (category: any) => {
    setEditingCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      const token = await getToken();
      await api.delete(`/categories/${editingCategory._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Category deleted");
      setIsDeleteModalOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">Manage product categories and hierarchy.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus size={16} /> Add Category
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Parent</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No categories found.</td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden border">
                          {category.image ? (
                            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                          ) : (
                            <Tags size={16} className="text-muted-foreground" />
                          )}
                        </div>
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{category.slug}</td>
                    <td className="px-6 py-4">
                      {category.parentCategory ? (
                        <span className="bg-muted px-2 py-1 rounded text-xs border">{category.parentCategory.name}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Root</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {category.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(category)} className="h-8 w-8 text-muted-foreground hover:text-black">
                          <Edit size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(category)} className="h-8 w-8 text-muted-foreground hover:text-red-600">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-muted/20">
              <h3 className="font-semibold text-lg">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={handleCloseModal} className="text-muted-foreground hover:text-black transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">Name *</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:border-black transition-all" placeholder="e.g. Men's Clothing" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">Image URL</label>
                <input name="image" value={formData.image} onChange={handleChange} className="w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:border-black transition-all" placeholder="https://example.com/image.jpg" />
                {formData.image && (
                  <div className="mt-2 w-16 h-16 rounded border overflow-hidden">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">Parent Category</label>
                <select name="parentCategory" value={formData.parentCategory} onChange={handleChange} className="w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:border-black transition-all">
                  <option value="">None (Root Category)</option>
                  {categories.filter(c => c._id !== editingCategory?._id).map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:border-black transition-all min-h-[80px]" placeholder="Optional description..." />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">Visible to customers</label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="font-bold text-lg">Delete Category?</h3>
              <p className="text-muted-foreground text-sm">
                Are you sure you want to delete <strong>{editingCategory?.name}</strong>? This action cannot be undone. 
                Categories with active children cannot be deleted.
              </p>
            </div>
            <div className="p-4 bg-muted/20 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                {submitting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
