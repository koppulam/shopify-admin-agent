import { NextRequest, NextResponse } from 'next/server';
import shopifyConfig from '@/lib/shopify-app';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const shop = url.searchParams.get('shop');
    const code = url.searchParams.get('code');
    const host = url.searchParams.get('host');

    if (!shop || !code) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Exchange code for access token
    const tokenUrl = `https://${shop}/admin/oauth/access_token`;
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: shopifyConfig.apiKey,
        client_secret: shopifyConfig.apiSecret,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Store the session (simplified - in production use a proper session store)
    console.log(`Access token received for shop: ${shop}`);
    
    // Redirect to the app with the shop parameter
    const redirectUrl = `/?shop=${shop}&host=${host || ''}`;
    return NextResponse.redirect(new URL(redirectUrl, url.origin));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json({ error: 'Authentication callback failed' }, { status: 500 });
  }
} 