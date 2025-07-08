import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

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

    // Check if user already exists in Clerk
    try {
      const existingUsers = await clerkClient.users.getUserList({
        emailAddress: [email]
      });

      if (existingUsers.data.length > 0) {
        return NextResponse.json({
          message: "Account already exists. Please sign in instead."
        }, { status: 409 });
      }
    } catch (error) {
      // If user doesn't exist, continue with signup
    }

    // Create invitation for the user
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/studio`,
      publicMetadata: {
        trial: trial || false,
        signup: true
      }
    });

    console.log(`New signup invitation sent: ${email} | Trial: ${trial}`);

    return NextResponse.json({
      message: "Signup success - invitation sent",
      email
    });

  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json({
      message: "Internal server error"
    }, { status: 500 });
  }
}
