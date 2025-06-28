import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { base_url, max_depth = 2, use_js = false } = body;
    
    if (!base_url) {
      return NextResponse.json(
        { error: 'base_url is required' },
        { status: 400 }
      );
    }

    // Forward request to DocHarvester backend
    const backendUrl = process.env.DOCHARVESTER_BACKEND_URL || 'http://docharvester-backend:5000';
    
    const response = await fetch(`${backendUrl}/discover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base_url,
        max_depth,
        use_js
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DocHarvester backend error:', response.status, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('DocHarvester discovery error:', error);
    return NextResponse.json(
      { error: 'Failed to discover URLs' },
      { status: 500 }
    );
  }
}
