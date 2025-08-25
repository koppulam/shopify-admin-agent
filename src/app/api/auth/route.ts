import { NextRequest, NextResponse } from 'next/server';
import shopifyConfig from '@/lib/shopify-app';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const shop = url.searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  try {
    // Simple OAuth URL generation
    const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
    const scopes = shopifyConfig.scopes.join(',');
    const redirectUri = `${shopifyConfig.appUrl}/api/auth/callback`;
    const state = Math.random().toString(36).substring(7); // Simple state for CSRF protection
    
    const authUrl = `https://${shopDomain}/admin/oauth/authorize?` +
      `client_id=${shopifyConfig.apiKey}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}`;

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
} 