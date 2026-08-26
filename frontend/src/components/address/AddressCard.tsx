'use client';

import { CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Address {
  _id: string;
  label: string;
  name: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
}

interface AddressCardProps {
  address: Address;
  onEdit?: (address: Address) => void;
  onDelete?: (address: Address) => void;
  onSelect?: (address: Address) => void;
  isSelected?: boolean;
  selectable?: boolean;
  compact?: boolean;
}

export default function AddressCard({ 
  address, 
  onEdit, 
  onDelete, 
  onSelect, 
  isSelected, 
  selectable,
  compact = false
}: AddressCardProps) {
  
  return (
    <div 
      onClick={selectable && onSelect ? () => onSelect(address) : undefined}
      className={`relative p-5 rounded-xl border-2 transition-all bg-white ${
        selectable ? 'cursor-pointer' : ''
      } ${
        isSelected 
          ? 'border-black shadow-md ring-1 ring-black/5' 
          : 'border-border hover:border-black/30'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider bg-muted/50 px-2.5 py-1 rounded-md text-muted-foreground">
            {address.label}
          </span>
          {address.isDefault && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1">
              <CheckCircle2 size={12} /> Default
            </span>
          )}
        </div>
        
        {isSelected && (
          <div className="text-black">
            <CheckCircle2 size={22} fill="currentColor" className="text-white" />
          </div>
        )}
      </div>
      
      <h4 className="font-bold text-base mb-1">{address.name}</h4>
      <p className="text-sm font-medium mb-3">{address.phone}</p>
      
      <div className="text-sm text-muted-foreground space-y-0.5 line-clamp-3 leading-relaxed">
        <p>{address.address}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        {address.landmark && <p>Landmark: {address.landmark}</p>}
        <p>{address.city}, {address.state} {address.pincode}</p>
        <p>{address.country}</p>
      </div>

      {!compact && (onEdit || onDelete) && (
        <div className="flex gap-3 pt-5 mt-5 border-t border-dashed">
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 bg-white hover:bg-muted/30" 
              onClick={(e) => { e.stopPropagation(); onEdit(address); }}
            >
              <Edit2 size={14} className="mr-2" /> Edit
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30" 
              onClick={(e) => { e.stopPropagation(); onDelete(address); }}
            >
              <Trash2 size={14} className="mr-2" /> Delete
            </Button>
          )}
        </div>
      )}
      
      {selectable && onSelect && !isSelected && (
        <div className="mt-5 pt-4 border-t">
          <Button 
            className="w-full text-sm h-10" 
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onSelect(address); }}
          >
            Deliver Here
          </Button>
        </div>
      )}
    </div>
  );
}
