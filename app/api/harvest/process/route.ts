import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documents } = body;
    
    if (!documents || !Array.isArray(documents)) {
      return NextResponse.json(
        { error: 'documents array is required' },
        { status: 400 }
      );
    }

    // Forward request to DocHarvester backend
    const backendUrl = process.env.DOCHARVESTER_BACKEND_URL || 'http://docharvester-backend:5000';
    
    const response = await fetch(`${backendUrl}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documents
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
    console.error('DocHarvester process error:', error);
    return NextResponse.json(
      { error: 'Failed to process documents' },
      { status: 500 }
    );
  }
}
