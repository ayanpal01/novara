'use client';

import { useUser } from '@/contexts/AuthContext';
import { useEffect, useRef } from 'react';
import api from '@/lib/axios';

export default function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && user && !syncedRef.current) {
      // Sync user with our backend
      const syncUser = async () => {
        try {
          await api.post('/auth/sync', {
            firebaseUid: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName,
            avatar: user.imageUrl,
          });
          syncedRef.current = true;
        } catch (error) {
          console.error('Failed to sync user with backend:', error);
        }
      };

      syncUser();
    }
  }, [isLoaded, isSignedIn, user]);

  return <>{children}</>;
}
