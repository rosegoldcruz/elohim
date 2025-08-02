"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowRight, Mail, Network } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import { syncClerkUserToSupabase } from '@/lib/auth/clerk-supabase-sync';

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (mode === 'signup' && (!firstName || !lastName || !birthday)) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (mode === 'signup' && !agreeToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!signUpLoaded) return;

        const result = await signUp.create({
          emailAddress: email,
          password,
          firstName,
          lastName,
        });

        if (result.status === 'complete' && result.createdUserId) {
          // Sync user data to Supabase
          try {
            await syncClerkUserToSupabase({
              id: result.createdUserId,
              emailAddresses: [{ emailAddress: email }],
              firstName,
              lastName,
              imageUrl: '',
            } as any);
          } catch (syncError) {
            console.error('Failed to sync user to Supabase:', syncError);
            // Don't fail the signup if Supabase sync fails
          }
          
          toast.success('Account created! Please check your email to verify your account.');
        } else {
          toast.error('Something went wrong during sign up');
        }
      } else {
        if (!signInLoaded) return;

        const result = await signIn.create({
          identifier: email,
          password,
        });

        if (result.status === 'complete') {
          toast.success('Welcome back!');
          window.location.href = '/dashboard';
        } else {
          toast.error('Invalid email or password');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      if (mode === 'signup') {
        await signUp?.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: '/auth/callback',
          redirectUrlComplete: '/dashboard',
        });
      } else {
        await signIn?.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: '/auth/callback',
          redirectUrlComplete: '/dashboard',
        });
      }
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast.error('Google authentication failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Network className="h-8 w-8 text-purple-400" />
              <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-lg"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-400">
            {mode === 'signup' 
              ? 'Join AEON and start creating amazing videos' 
              : 'Sign in to your AEON account'
            }
          </p>
        </div>

        {/* Google Sign In */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full h-12 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 mb-6"
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </Button>

        <Separator className="my-6 bg-gray-700" />

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#ccc] mb-2">
                    First Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-12 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 text-white placeholder:text-[#666] focus:border-[#4a4a4a] focus:ring-0 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#ccc] mb-2">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-12 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 text-white placeholder:text-[#666] focus:border-[#4a4a4a] focus:ring-0 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#ccc] mb-2">
                  Birthday
                </label>
                <Input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full h-12 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 text-white placeholder:text-[#666] focus:border-[#4a4a4a] focus:ring-0 focus:outline-none"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-[#ccc] mb-2">
              Email address
            </label>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 text-white placeholder:text-[#666] focus:border-[#4a4a4a] focus:ring-0 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#ccc] mb-2">
              Password
            </label>
            <Input
              type="password"
              placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 text-white placeholder:text-[#666] focus:border-[#4a4a4a] focus:ring-0 focus:outline-none"
              required
              minLength={6}
            />
          </div>

          {mode === 'signup' && (
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-[#ccc] leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="text-white hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-white hover:underline">
                  Privacy Policy
                </Link>
                . I consent to receiving marketing emails and promotional content.
              </label>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              <>
                {mode === 'signup' ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Link 
              href={mode === 'signup' ? '/sign-in' : '/sign-up'} 
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              {mode === 'signup' ? 'Sign In' : 'Sign Up'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
