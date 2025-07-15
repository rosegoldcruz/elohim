"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowRight, Mail, Network } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

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
  const supabase = createClient();

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
        // Sign up with email and password
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`,
              birthday: birthday,
              marketing_consent: agreeToTerms,
            },
            emailRedirectTo: `${window.location.origin}/studio`,
          },
        });

        // If signup successful, also update the users table with additional data
        if (data.user && !error) {
          const { error: profileError } = await supabase
            .from('users')
            .upsert({
              id: data.user.id,
              email: email,
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`,
              birthday: birthday,
              marketing_consent: agreeToTerms,
            });

          if (profileError) {
            console.error('Profile update error:', profileError);
          }
        }

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success('Account created! Please check your email to verify your account.');
      } else {
        // Sign in with email and password
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        // Update login stats
        if (data.user) {
          await supabase.rpc('update_user_login_stats', { user_id: data.user.id });
        }

        toast.success('Welcome back!');
        window.location.href = '/studio';
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/studio`,
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        {/* Main Card */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link
              href="/"
              className="flex items-center gap-3 text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 hover:scale-105 transition-transform duration-300"
            >
              <div className="relative">
                <Network className="h-8 w-8 text-purple-400" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-lg"></div>
              </div>
              AEON
            </Link>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2">
              {mode === 'signin' ? 'Sign in to elohim' : 'Join the AEON community'}
            </h1>
            <p className="text-[#888] text-sm">
              {mode === 'signin'
                ? 'Welcome back! Please sign in to continue'
                : 'Create your account and start generating amazing videos'
              }
            </p>
          </div>

          {/* Google Sign In */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            variant="outline"
            className="w-full h-12 bg-[#2a2a2a] border border-[#3a3a3a] text-white hover:bg-[#3a3a3a] mb-4"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <Separator className="flex-1 bg-[#3a3a3a]" />
            <span className="px-4 text-[#888] text-sm">or</span>
            <Separator className="flex-1 bg-[#3a3a3a]" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#ccc] mb-2">
                      First name
                    </label>
                    <Input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full h-12 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 text-white placeholder:text-[#666] focus:border-[#4a4a4a] focus:ring-0 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#ccc] mb-2">
                      Last name
                    </label>
                    <Input
                      type="text"
                      placeholder="Last name"
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
            <p className="text-[#888] text-sm">
              {mode === 'signin' ? (
                <>
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-white hover:underline">
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link href="/login" className="text-white hover:underline">
                    Sign in
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Secured by */}
        <div className="text-center mt-6">
          <p className="text-[#666] text-xs flex items-center justify-center gap-1">
            Secured by 
            <span className="text-white font-medium">supabase</span>
          </p>
        </div>
      </div>
    </div>
  );
}
