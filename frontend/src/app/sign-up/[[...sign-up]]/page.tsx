'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function SignUpPage() {
  const { signInWithGoogle, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-xl shadow-sm border border-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{' '}
            <Link href="/sign-in" className="font-medium text-primary hover:text-primary/80">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-6">
          <Button 
            onClick={handleGoogleSignUp} 
            disabled={loading}
            className="w-full flex justify-center py-6 border border-border bg-white text-black hover:bg-gray-50"
          >
            {loading ? 'Signing up...' : 'Continue with Google'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!name || !email || !password) {
              setError('Please fill in all fields');
              return;
            }
            try {
              setLoading(true);
              setError('');
              await signUpWithEmail(email, password, name);
              router.push('/');
            } catch (err: any) {
              setError(err.message || 'Failed to sign up with email');
            } finally {
              setLoading(false);
            }
          }} className="space-y-4">
            <div>
              <Input 
                type="text" 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <Input 
                type="email" 
                placeholder="Email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <Input 
                type="password" 
                placeholder="Password (min. 6 characters)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
            >
              Sign Up
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
