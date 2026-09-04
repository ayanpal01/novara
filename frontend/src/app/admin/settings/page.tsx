'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';;
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { getToken } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = await getToken();
        const { data } = await api.get('/admin/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSettings(data);
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [getToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setSettings({ ...settings, [e.target.name]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = await getToken();
      await api.put('/admin/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Settings updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-muted-foreground">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground mt-1">Manage global store configurations and delivery rules.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* General Store Details */}
        <div className="bg-white p-6 border rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">General Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Store Name</label>
              <input name="storeName" value={settings?.storeName || ''} onChange={handleChange} className="w-full rounded-md border bg-muted/20 px-3 py-2 text-sm outline-none focus:border-black transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Store Email</label>
              <input type="email" name="storeEmail" value={settings?.storeEmail || ''} onChange={handleChange} className="w-full rounded-md border bg-muted/20 px-3 py-2 text-sm outline-none focus:border-black transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Store Phone</label>
              <input name="storePhone" value={settings?.storePhone || ''} onChange={handleChange} className="w-full rounded-md border bg-muted/20 px-3 py-2 text-sm outline-none focus:border-black transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Currency</label>
              <input name="currency" value={settings?.currency || ''} onChange={handleChange} className="w-full rounded-md border bg-muted/20 px-3 py-2 text-sm outline-none focus:border-black transition-all" />
            </div>
          </div>
        </div>

        {/* Delivery & Logistics */}
        <div className="bg-white p-6 border rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Delivery & Logistics</h2>
          <div className="bg-primary/5 p-4 rounded-lg mb-6 border border-primary/20">
            <h4 className="font-semibold text-primary mb-1">Geographic Delivery Rules</h4>
            <p className="text-sm text-primary/80">
              Orders will be strictly blocked if the customer's distance from the Shop Coordinates exceeds the Maximum Delivery Distance using the Haversine formula.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Shop Latitude (Store Location)</label>
              <input type="number" step="any" name="shopLatitude" value={settings?.shopLatitude || ''} onChange={handleChange} className="w-full rounded-md border bg-muted/20 px-3 py-2 text-sm outline-none focus:border-black transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Shop Longitude (Store Location)</label>
              <input type="number" step="any" name="shopLongitude" value={settings?.shopLongitude || ''} onChange={handleChange} className="w-full rounded-md border bg-muted/20 px-3 py-2 text-sm outline-none focus:border-black transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Max Delivery Distance (KM)</label>
              <input type="number" name="maxDeliveryDistance" value={settings?.maxDeliveryDistance || ''} onChange={handleChange} className="w-full rounded-md border bg-muted/20 px-3 py-2 text-sm outline-none focus:border-black transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Max Delivery Time (Days)</label>
              <input type="number" name="maxDeliveryDays" value={settings?.maxDeliveryDays || ''} onChange={handleChange} className="w-full rounded-md border bg-muted/20 px-3 py-2 text-sm outline-none focus:border-black transition-all" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
