// Remove Clerk imports
// import { SignInButton, SignOutButton, useAuth } from '@clerk/nextjs';

import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function AuthButton() {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  
  if (!user) {
    return (
      <Button asChild>
        <a href="/auth/signin">Sign In</a>
      </Button>
    );
  }
  
  return (
    <Button variant="outline" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}