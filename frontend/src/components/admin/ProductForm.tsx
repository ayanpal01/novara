'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, X, Upload, Trash2, RefreshCw, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';;

interface Category {
  _id: string;
  name: string;
}

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

interface OptionValue {
  label: string;
  value: string;
  hex?: string;
}

interface ProductOption {
  name: string;
  values: OptionValue[];
}

interface ProductVariant {
  attributes: Record<string, string>;
  sku: string;
  barcode: string;
  price: number | '';
  compareAtPrice: number | '';
  costPrice: number | '';
  inventory: {
    quantity: number;
    reserved: number;
    lowStockThreshold: number;
    trackInventory: boolean;
  };
  isActive: boolean;
}

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State - Basic Info
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [categoryId, setCategoryId] = useState(initialData?.category?._id || initialData?.category || '');
  const [subCategory, setSubCategory] = useState(initialData?.subCategory || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [gender, setGender] = useState(initialData?.gender || '');

  // Pricing
  const [price, setPrice] = useState<number | ''>(initialData?.price || '');
  const [compareAtPrice, setCompareAtPrice] = useState<number | ''>(initialData?.compareAtPrice || '');
  const [costPrice, setCostPrice] = useState<number | ''>(initialData?.costPrice || '');

  // Options & Variants
  const [options, setOptions] = useState<ProductOption[]>(initialData?.options || []);
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants?.map((v: any) => ({
      ...v,
      attributes: v.attributes || {}
    })) || []
  );

  // Images
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
  const [newImages, setNewImages] = useState<File[]>([]);

  // Status Sidebar
  const [status, setStatus] = useState(initialData?.status || 'active');
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [isNewArrival, setIsNewArrival] = useState(initialData?.isNewArrival || false);
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');

  // Derived stock
  const totalStock = variants.reduce((acc, v) => acc + (v.isActive ? Number(v.inventory?.quantity || 0) : 0), 0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (error) {
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Auto-generate slug from name if empty
  useEffect(() => {
    if (!isEdit && name && !slug) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  }, [name, isEdit]);

  // Option Handlers
  const addOption = () => {
    setOptions([...options, { name: '', values: [] }]);
  };

  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const updateOptionName = (index: number, name: string) => {
    const newOptions = [...options];
    newOptions[index].name = name;
    setOptions(newOptions);
  };

  const addOptionValue = (optIndex: number) => {
    const newOptions = [...options];
    newOptions[optIndex].values.push({ label: '', value: '' });
    setOptions(newOptions);
  };

  const removeOptionValue = (optIndex: number, valIndex: number) => {
    const newOptions = [...options];
    newOptions[optIndex].values.splice(valIndex, 1);
    setOptions(newOptions);
  };

  const updateOptionValue = (optIndex: number, valIndex: number, field: string, val: string) => {
    const newOptions = [...options];
    const optionVal = newOptions[optIndex].values[valIndex];
    if (field === 'label') {
      optionVal.label = val;
      optionVal.value = val.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    } else if (field === 'hex') {
      optionVal.hex = val;
    }
    setOptions(newOptions);
  };

  // Generate Variants
  const generateVariants = () => {
    // Basic validation
    const validOptions = options.filter(o => o.name && o.values.some(v => v.label));
    if (validOptions.length === 0) {
       // If no options, clear variants
       if (variants.length > 0) {
         if (!window.confirm("This will clear all variants. Proceed?")) return;
         setVariants([]);
       }
       return;
    }

    // Create cartesian product of option values
    const combinations = validOptions.reduce((acc, option) => {
      const optionValues = option.values.filter(v => v.label);
      if (acc.length === 0) {
        return optionValues.map(v => ({ [option.name]: v.value }));
      }
      const newAcc: Record<string, string>[] = [];
      acc.forEach(existing => {
        optionValues.forEach(v => {
          newAcc.push({ ...existing, [option.name]: v.value });
        });
      });
      return newAcc;
    }, [] as Record<string, string>[]);

    // Merge with existing variants to preserve data
    const newVariants = combinations.map(combo => {
      // Find matching existing variant
      const existing = variants.find(v => {
        const vAttrs = v.attributes || {};
        const keys = Object.keys(combo);
        if (keys.length !== Object.keys(vAttrs).length) return false;
        return keys.every(k => vAttrs[k] === combo[k]);
      });

      if (existing) return existing;

      // Create new variant
      return {
        attributes: combo,
        sku: '',
        barcode: '',
        price: '',
        compareAtPrice: '',
        costPrice: '',
        inventory: {
          quantity: 0,
          reserved: 0,
          lowStockThreshold: 5,
          trackInventory: true
        },
        isActive: true
      } as ProductVariant;
    });

    setVariants(newVariants);
    toast.success(`Generated ${newVariants.length} variants`);
  };

  const updateVariant = (index: number, field: string, val: any) => {
    const newVariants = [...variants];
    const v = newVariants[index];
    if (field.startsWith('inventory.')) {
      const invField = field.split('.')[1] as keyof typeof v.inventory;
      (v.inventory as any)[invField] = val;
    } else {
      (v as any)[field] = val;
    }
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  // Image Handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (existingImages.length + newImages.length + filesArray.length > 5) {
        toast.error('Maximum 5 images allowed');
        return;
      }
      setNewImages([...newImages, ...filesArray]);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price) {
      toast.error('Base price is required');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('slug', slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      formData.append('description', description);
      formData.append('shortDescription', shortDescription);
      formData.append('price', price.toString());
      if (compareAtPrice) formData.append('compareAtPrice', compareAtPrice.toString());
      if (costPrice) formData.append('costPrice', costPrice.toString());
      formData.append('category', categoryId);
      formData.append('subCategory', subCategory);
      formData.append('brand', brand);
      formData.append('gender', gender);
      
      formData.append('isFeatured', isFeatured.toString());
      formData.append('isNewArrival', isNewArrival.toString());
      formData.append('status', status);
      formData.append('seoTitle', seoTitle);
      formData.append('seoDescription', seoDescription);
      formData.append('tags', tags.split(',').map((t: string) => t.trim()).filter(Boolean).join(','));
      
      formData.append('options', JSON.stringify(options));
      formData.append('variants', JSON.stringify(variants));

      // Append existing images that weren't deleted
      // We'll just pass the array. Note: backend update controller needs to handle this.
      // Wait, our backend currently expects `images` to be files, and just appends them to existing!
      // If we want to support removing existing, we should pass `existingImages` array.
      formData.append('existingImages', JSON.stringify(existingImages));

      newImages.forEach(file => {
        formData.append('images', file);
      });

      const token = await getToken();

      if (isEdit && initialData?._id) {
        await api.put(`/products/${initialData._id}`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}` 
          }
        });
        toast.success('Product updated');
      } else {
        await api.post('/products', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}` 
          }
        });
        toast.success('Product created');
      }
      
      router.push('/admin/products');
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Button type="button" variant="ghost" size="icon" onClick={() => router.push('/admin/products')}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit Product' : 'Create Product'}</h1>
          <p className="text-muted-foreground text-sm">Fill in the product details below.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section A - Basic Info */}
          <div className="bg-background p-6 rounded-xl border shadow-sm space-y-6">
            <h2 className="text-lg font-semibold border-b pb-3">Product Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name *</label>
                  <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Classic White T-Shirt" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug</label>
                  <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g., classic-white-tshirt" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <Textarea required value={description} onChange={e => setDescription(e.target.value)} rows={5} placeholder="Full product description..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Short Description</label>
                <Textarea value={shortDescription} onChange={e => setShortDescription(e.target.value)} rows={2} placeholder="Brief summary..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select 
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subcategory</label>
                  <Input value={subCategory} onChange={e => setSubCategory(e.target.value)} placeholder="e.g., T-Shirts" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Brand</label>
                  <Input value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g., Novara" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-background p-6 rounded-xl border shadow-sm space-y-6">
            <h2 className="text-lg font-semibold border-b pb-3">Pricing</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Base Price (₹) *</label>
                <Input type="number" required min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')} placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Compare At (₹)</label>
                <Input type="number" min="0" step="0.01" value={compareAtPrice} onChange={e => setCompareAtPrice(e.target.value ? Number(e.target.value) : '')} placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cost Price (₹)</label>
                <Input type="number" min="0" step="0.01" value={costPrice} onChange={e => setCostPrice(e.target.value ? Number(e.target.value) : '')} placeholder="0.00" />
              </div>
            </div>
          </div>

          {/* Options System */}
          <div className="bg-background p-6 rounded-xl border shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-semibold">Product Options</h2>
              <Button type="button" variant="outline" size="sm" onClick={addOption} className="gap-2">
                <Plus size={16} /> Add Option
              </Button>
            </div>
            
            {options.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No options added. Product will have no variants.</p>
            ) : (
              <div className="space-y-6">
                {options.map((opt, oIdx) => (
                  <div key={oIdx} className="p-4 border rounded-lg bg-muted/10 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="w-1/2">
                        <label className="block text-xs font-medium mb-1">Option Name</label>
                        <Input value={opt.name} onChange={e => updateOptionName(oIdx, e.target.value)} placeholder="e.g., Size, Color, Material" />
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeOption(oIdx)}>
                        <X size={16} />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-medium">Values</label>
                      {opt.values.map((val, vIdx) => (
                        <div key={vIdx} className="flex items-center gap-3">
                          <Input className="flex-1" value={val.label} onChange={e => updateOptionValue(oIdx, vIdx, 'label', e.target.value)} placeholder="e.g., Small, Red, Cotton" />
                          {opt.name.toLowerCase() === 'color' && (
                            <div className="flex items-center gap-2">
                              <Input type="color" className="w-10 h-10 p-1 cursor-pointer" value={val.hex || '#000000'} onChange={e => updateOptionValue(oIdx, vIdx, 'hex', e.target.value)} />
                            </div>
                          )}
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeOptionValue(oIdx, vIdx)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="ghost" size="sm" onClick={() => addOptionValue(oIdx)} className="text-xs mt-2">
                        + Add Value
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Variants Management */}
          {options.length > 0 && (
            <div className="bg-background p-6 rounded-xl border shadow-sm space-y-6 overflow-hidden">
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-lg font-semibold">Variants ({variants.length})</h2>
                <Button type="button" size="sm" onClick={generateVariants} className="gap-2">
                  <RefreshCw size={14} /> Generate Variants
                </Button>
              </div>

              {variants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                      <tr>
                        <th className="px-4 py-3">Variant</th>
                        <th className="px-4 py-3">SKU</th>
                        <th className="px-4 py-3">Price (₹)</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Active</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((variant, vIdx) => {
                        const variantName = Object.values(variant.attributes).join(' / ');
                        return (
                          <tr key={vIdx} className="border-b last:border-0 hover:bg-muted/10">
                            <td className="px-4 py-3 font-medium">{variantName}</td>
                            <td className="px-4 py-3">
                              <Input className="w-32 h-8 text-xs" value={variant.sku} onChange={e => updateVariant(vIdx, 'sku', e.target.value)} placeholder="SKU" />
                            </td>
                            <td className="px-4 py-3">
                              <Input className="w-24 h-8 text-xs" type="number" value={variant.price === '' ? '' : variant.price} onChange={e => updateVariant(vIdx, 'price', e.target.value ? Number(e.target.value) : '')} placeholder="Inherit" />
                            </td>
                            <td className="px-4 py-3">
                              <Input className="w-20 h-8 text-xs" type="number" min="0" value={variant.inventory.quantity} onChange={e => updateVariant(vIdx, 'inventory.quantity', Number(e.target.value))} />
                            </td>
                            <td className="px-4 py-3">
                              <input type="checkbox" checked={variant.isActive} onChange={e => updateVariant(vIdx, 'isActive', e.target.checked)} className="rounded" />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeVariant(vIdx)}>
                                <Trash2 size={14} />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Click "Generate Variants" to build combinations from your options.</p>
              )}
            </div>
          )}

          {/* Images */}
          <div className="bg-background p-6 rounded-xl border shadow-sm space-y-6">
            <h2 className="text-lg font-semibold border-b pb-3">Product Images (Max 5)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {existingImages.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
                  <img src={url} alt="Product" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs text-white font-medium">Existing</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveExistingImage(idx)} className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {newImages.map((file, idx) => (
                <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
                  <img src={URL.createObjectURL(file)} alt="New upload" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => handleRemoveNewImage(idx)} className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {(existingImages.length + newImages.length) < 5 && (
                <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer">
                  <Upload size={24} className="mb-2" />
                  <span className="text-xs font-medium">Upload Image</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          <div className="bg-background p-6 rounded-xl border shadow-sm space-y-6">
            <h2 className="text-lg font-semibold border-b pb-3">Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Status</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="featured" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="rounded border-gray-300" />
                <label htmlFor="featured" className="text-sm font-medium cursor-pointer">Featured Product</label>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="newArrival" checked={isNewArrival} onChange={e => setIsNewArrival(e.target.checked)} className="rounded border-gray-300" />
                <label htmlFor="newArrival" className="text-sm font-medium cursor-pointer">New Arrival</label>
              </div>
            </div>
          </div>

          {/* Inventory Summary */}
          <div className="bg-background p-6 rounded-xl border shadow-sm space-y-6">
            <h2 className="text-lg font-semibold border-b pb-3 flex items-center gap-2"><Settings2 size={18}/> Inventory Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Stock:</span>
                <span className="font-semibold">{variants.length > 0 ? totalStock : 'Based on variants'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Variants:</span>
                <span className="font-semibold">{variants.length}</span>
              </div>
              <div className="flex justify-between text-destructive">
                <span>Out of Stock:</span>
                <span className="font-semibold">{variants.filter(v => v.inventory?.quantity === 0).length}</span>
              </div>
            </div>
          </div>

          {/* Organization & SEO */}
          <div className="bg-background p-6 rounded-xl border shadow-sm space-y-6">
            <h2 className="text-lg font-semibold border-b pb-3">Organization & SEO</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="Summer, Casual, Sale" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SEO Title</label>
                <Input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Title for search engines" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SEO Description</label>
                <Textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} rows={3} placeholder="Description for search engines" />
              </div>
            </div>
          </div>

          <div className="pt-4 sticky top-6">
            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
            </Button>
            <Button type="button" variant="outline" className="w-full h-12 mt-3" onClick={() => router.push('/admin/products')}>
              Cancel
            </Button>
          </div>

        </div>
      </form>
    </div>
  );
}
