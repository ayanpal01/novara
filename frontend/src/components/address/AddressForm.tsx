'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';

const addressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^(?:\+91|91)?[6-9]\d{9}$/, 'Valid 10-digit mobile number required'),
  alternatePhone: z.string().optional().refine(val => !val || /^(?:\+91|91)?[6-9]\d{9}$/.test(val), {
    message: 'Valid 10-digit mobile number required'
  }),
  address: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  pincode: z.string().length(6, 'Valid 6-digit pincode required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().default('India'),
  label: z.enum(['Home', 'Work', 'Other']),
  isDefault: z.boolean().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

export type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  initialData?: Partial<AddressFormValues>;
  onSubmit: (data: AddressFormValues) => Promise<void>;
  onCancel: () => void;
  isFirstAddress?: boolean;
}

export default function AddressForm({ initialData, onSubmit, onCancel, isFirstAddress }: AddressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('');

  const { register, handleSubmit, formState: { errors } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      alternatePhone: initialData?.alternatePhone || '',
      address: initialData?.address || '',
      addressLine2: initialData?.addressLine2 || '',
      landmark: initialData?.landmark || '',
      pincode: initialData?.pincode || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      country: initialData?.country || 'India',
      label: initialData?.label || 'Home',
      isDefault: initialData?.isDefault || isFirstAddress || false,
      latitude: initialData?.latitude,
      longitude: initialData?.longitude
    }
  });

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser');
      return;
    }
    setLocationStatus('Locating...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        register('latitude').onChange({ target: { name: 'latitude', value: position.coords.latitude } });
        register('longitude').onChange({ target: { name: 'longitude', value: position.coords.longitude } });
        setLocationStatus('Location captured! ✓');
      },
      () => {
        setLocationStatus('Unable to retrieve your location');
      }
    );
  };

  const handleFormSubmit: SubmitHandler<AddressFormValues> = async (data) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 border rounded-xl shadow-sm">
      <h3 className="font-semibold text-lg mb-6">{initialData ? 'Edit Address' : 'Add a New Address'}</h3>
      
      <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-6">
        {/* Contact Details */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Contact Details</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Full Name *</label>
              <input {...register('name')} className={`w-full rounded-md border bg-muted/20 px-3 py-2.5 text-sm outline-none focus:border-black transition-all ${errors.name ? 'border-destructive' : ''}`} />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Mobile Number *</label>
                <input {...register('phone')} className={`w-full rounded-md border bg-muted/20 px-3 py-2.5 text-sm outline-none focus:border-black transition-all ${errors.phone ? 'border-destructive' : ''}`} />
                {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Alternate Phone (Optional)</label>
                <input {...register('alternatePhone')} className={`w-full rounded-md border bg-muted/20 px-3 py-2.5 text-sm outline-none focus:border-black transition-all ${errors.alternatePhone ? 'border-destructive' : ''}`} />
                {errors.alternatePhone && <p className="text-destructive text-xs mt-1">{errors.alternatePhone.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 pt-2 border-t">Address</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">House No., Building, Street, Area *</label>
              <input {...register('address')} className={`w-full rounded-md border bg-muted/20 px-3 py-2.5 text-sm outline-none focus:border-black transition-all ${errors.address ? 'border-destructive' : ''}`} />
              {errors.address && <p className="text-destructive text-xs mt-1">{errors.address.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Apartment, Floor, Unit (Optional)</label>
                <input {...register('addressLine2')} className="w-full rounded-md border bg-muted/20 px-3 py-2.5 text-sm outline-none focus:border-black transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Landmark (Optional)</label>
                <input {...register('landmark')} className="w-full rounded-md border bg-muted/20 px-3 py-2.5 text-sm outline-none focus:border-black transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 pt-2 border-t">Location</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Pincode *</label>
                <input {...register('pincode')} maxLength={6} className={`w-full rounded-md border bg-muted/20 px-3 py-2.5 text-sm outline-none focus:border-black transition-all ${errors.pincode ? 'border-destructive' : ''}`} />
                {errors.pincode && <p className="text-destructive text-xs mt-1">{errors.pincode.message}</p>}
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">City *</label>
                <input {...register('city')} className={`w-full rounded-md border bg-muted/20 px-3 py-2.5 text-sm outline-none focus:border-black transition-all ${errors.city ? 'border-destructive' : ''}`} />
                {errors.city && <p className="text-destructive text-xs mt-1">{errors.city.message}</p>}
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">State *</label>
                <input {...register('state')} className={`w-full rounded-md border bg-muted/20 px-3 py-2.5 text-sm outline-none focus:border-black transition-all ${errors.state ? 'border-destructive' : ''}`} />
                {errors.state && <p className="text-destructive text-xs mt-1">{errors.state.message}</p>}
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Country</label>
                <input {...register('country')} readOnly className="w-full rounded-md border bg-muted/10 text-muted-foreground px-3 py-2.5 text-sm outline-none cursor-not-allowed" />
              </div>
            </div>
            
            <div className="bg-muted/10 p-4 rounded-lg border flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Delivery Coordinates (Required for distance check)</p>
                <p className="text-xs text-muted-foreground">{locationStatus || 'We need your location to confirm delivery availability.'}</p>
                <input type="hidden" {...register('latitude')} />
                <input type="hidden" {...register('longitude')} />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={getLocation}>
                Get My Location
              </Button>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 pt-2 border-t">Address Type</h4>
          <div className="space-y-4">
            <div className="flex gap-4">
              {['Home', 'Work', 'Other'].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value={type} {...register('label')} className="accent-black w-4 h-4" />
                  <span className="text-sm font-medium">{type}</span>
                </label>
              ))}
            </div>

            {!isFirstAddress && (
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input type="checkbox" {...register('isDefault')} className="accent-black w-4 h-4 rounded" />
                <span className="text-sm font-medium">Make this my default address</span>
              </label>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? 'Saving...' : 'Save Address'}
          </Button>
        </div>
      </form>
    </div>
  );
}
