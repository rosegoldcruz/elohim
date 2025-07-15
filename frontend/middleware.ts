// Remove Clerk middleware
// import { authMiddleware } from '@clerk/nextjs';

import { createClient } from '@/utils/supabase/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const supabase = createClient(req);

  // Optional: Check session and handle auth
  const { data: { session } } = await supabase.auth.getSession();

  // Add your auth logic here
  // For now, just pass through all requests

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

// Remove Clerk export
// export default authMiddleware({...});
