'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Address } from './AddressCard';

interface DeleteAddressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  address: Address | null;
  onConfirm: (addressId: string) => Promise<void>;
}

export default function DeleteAddressDialog({ isOpen, onOpenChange, address, onConfirm }: DeleteAddressDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!address) return;
    try {
      setIsDeleting(true);
      await onConfirm(address._id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle size={20} /> Delete Address?
          </DialogTitle>
          <DialogDescription className="pt-3">
            Are you sure you want to delete this address?
            {address?.isDefault && (
              <span className="block mt-2 font-medium text-black">
                Note: This is your default address. If you delete it, another address will automatically become your new default.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {address && (
          <div className="bg-muted/30 p-4 rounded-lg text-sm border my-2 text-muted-foreground line-clamp-2">
            {address.address}, {address.city}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Address'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
