import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { email, trial } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    const supabase = createClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ 
        message: "Account already exists. Please sign in instead." 
      }, { status: 409 });
    }

    // Send magic link for signup
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/studio`,
        data: {
          trial: trial || false,
          signup: true
        }
      }
    });

    if (error) {
      console.error('Signup error:', error);
      return NextResponse.json({ 
        message: "Failed to send signup email. Please try again." 
      }, { status: 500 });
    }

    console.log(`New signup: ${email} | Trial: ${trial}`);

    return NextResponse.json({ 
      message: "Signup success",
      email 
    });

  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json({ 
      message: "Internal server error" 
    }, { status: 500 });
  }
}
