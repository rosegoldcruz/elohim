import { NextRequest, NextResponse } from "next/server";
// import { env } from "@/env.mjs";

interface APIKeyStatus {
  name: string;
  configured: boolean;
  valid?: boolean;
  error?: string;
}

export async function GET() {
  try {
    console.log('🔑 API key validation temporarily disabled during build optimization');

    // TODO: Restore API key validation after deployment
    return NextResponse.json({
      success: false,
      message: 'API key validation temporarily disabled during build optimization',
      keys: [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API key validation error:', error);

    return NextResponse.json(
      {
        error: 'API key validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

