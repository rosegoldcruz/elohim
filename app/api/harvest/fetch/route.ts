import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, use_js = false } = body;
    
    if (!url) {
      return NextResponse.json(
        { error: 'url is required' },
        { status: 400 }
      );
    }

    // Forward request to DocHarvester backend
    const backendUrl = process.env.DOCHARVESTER_BACKEND_URL || 'http://docharvester-backend:5000';
    
    const response = await fetch(`${backendUrl}/fetch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
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
    console.error('DocHarvester fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
