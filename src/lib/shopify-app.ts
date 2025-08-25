// Simple Shopify App configuration for Next.js
export const shopifyConfig = {
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecret: process.env.SHOPIFY_API_SECRET!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  scopes: ['read_products', 'write_products', 'read_customers', 'read_orders'],
  isEmbeddedApp: true,
};

export default shopifyConfig; 