import { NextResponse } from 'next/server';

const BASE_URL = 'https://api.clickup.com/api/v2';

export async function POST(request: Request) {
  try {
    const { endpoint, method = 'GET', body, customToken } = await request.json();
    
    // Use the custom token from client if provided, otherwise fallback to server-side env var
    const token = customToken || process.env.CLICKUP_API_TOKEN;

    if (!token) {
      return NextResponse.json({ error: 'No ClickUp API token provided' }, { status: 401 });
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.err || 'ClickUp API error' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('ClickUp Proxy Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
