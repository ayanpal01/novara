'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import api from '@/lib/axios';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import AddressCard, { Address } from '@/components/address/AddressCard';
import AddressForm, { AddressFormValues } from '@/components/address/AddressForm';
import DeleteAddressDialog from '@/components/address/DeleteAddressDialog';

export default function MyAddressesPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // States for forms and modals
  const [isAdding, setIsAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  const fetchAddresses = async () => {
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      const res = await api.get('/users/addresses', { headers: { Authorization: `Bearer ${token}` } });
      setAddresses(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [isSignedIn, getToken]);

  const handleAddSubmit = async (data: AddressFormValues) => {
    const token = await getToken();
    const res = await api.post('/users/addresses', data, { headers: { Authorization: `Bearer ${token}` } });
    setAddresses(res.data);
    setIsAdding(false);
    toast.success('Address saved successfully');
  };

  const handleEditSubmit = async (data: AddressFormValues) => {
    if (!editingAddress) return;
    const token = await getToken();
    const res = await api.put(`/users/addresses/${editingAddress._id}`, data, { headers: { Authorization: `Bearer ${token}` } });
    setAddresses(res.data);
    setEditingAddress(null);
    toast.success('Address updated successfully');
  };

  const confirmDelete = async (addressId: string) => {
    const token = await getToken();
    const res = await api.delete(`/users/addresses/${addressId}`, { headers: { Authorization: `Bearer ${token}` } });
    setAddresses(res.data);
    toast.success('Address deleted successfully');
  };

  const setAsDefault = async (address: Address) => {
    if (address.isDefault) return;
    try {
      const token = await getToken();
      const res = await api.patch(`/users/addresses/${address._id}/default`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setAddresses(res.data);
      toast.success('Default address updated');
    } catch (err) {
      toast.error('Failed to update default address');
    }
  };

  if (!isLoaded || !isSignedIn) return null;

  // Order addresses: default first
  const sortedAddresses = [...addresses].sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">My Addresses</h2>
          <p className="text-sm text-muted-foreground">Manage your saved delivery addresses.</p>
        </div>
        {!isAdding && !editingAddress && (
          <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
            <Plus size={16} className="mr-2" /> Add New Address
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-xl border" />
          ))}
        </div>
      ) : isAdding ? (
        <AddressForm 
          isFirstAddress={addresses.length === 0}
          onSubmit={handleAddSubmit}
          onCancel={() => setIsAdding(false)}
        />
      ) : editingAddress ? (
        <AddressForm 
          initialData={editingAddress}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingAddress(null)}
        />
      ) : addresses.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <MapPin className="mx-auto text-muted-foreground opacity-30 mb-4" size={48} />
          <h3 className="font-semibold text-lg mb-2">No addresses saved</h3>
          <p className="text-muted-foreground mb-6">Add a new delivery address to speed up checkout.</p>
          <Button onClick={() => setIsAdding(true)}>
            <Plus size={16} className="mr-2" /> Add New Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedAddresses.map((addr) => (
            <AddressCard 
              key={addr._id} 
              address={addr} 
              onEdit={(address) => setEditingAddress(address)}
              onDelete={(address) => {
                setAddressToDelete(address);
                setIsDeleteDialogOpen(true);
              }}
              onSelect={(address) => setAsDefault(address)}
              isSelected={addr.isDefault}
            />
          ))}
        </div>
      )}

      <DeleteAddressDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        address={addressToDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
