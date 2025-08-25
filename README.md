# Deloitte Digital - Shopify Admin Assistant

An AI-powered Shopify app that helps manage products, collections, and customers using Gemini AI and Model Context Protocol (MCP) tools.

## Features

- 🤖 **AI-Powered Admin Tasks**: Use natural language to manage your Shopify store
- 🔧 **MCP Integration**: Leverages Shopify Dev MCP for accurate GraphQL generation
- 🎯 **Smart Intent Recognition**: Automatically determines the right API calls
- 🔐 **OAuth Authentication**: Secure installation via Shopify Partner Dashboard
- 📱 **Embedded App**: Works seamlessly within Shopify Admin
- ✨ **Polaris UI**: Native Shopify design system

## Quick Start

### Prerequisites

- Node.js 18+
- Shopify Partner Account
- Google Gemini API Key

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repo-url>
cd shopify-admin-agent/web
npm install
```

2. **Set up environment variables:**
```bash
cp .env.local.example .env.local
# Edit .env.local with your keys
```

3. **Create Shopify App:**
```bash
# Install Shopify CLI
npm install -g @shopify/cli @shopify/theme

# Create app in Partner Dashboard or use CLI
shopify app init
```

4. **Configure the app:**
   - Update `shopify.app.toml` with your app details
   - Set redirect URLs to include your domain
   - Configure required scopes

5. **Run development server:**
```bash
npm run dev
```

## Environment Variables

### Required for Shopify App

```env
SHOPIFY_API_KEY=your_shopify_app_api_key
SHOPIFY_API_SECRET=your_shopify_app_secret
SHOPIFY_APP_URL=https://your-app-domain.com
NEXT_PUBLIC_SHOPIFY_API_KEY=your_shopify_app_api_key
```

### Required for AI Features

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

### Optional

```env
SHOPIFY_APP_DB_PATH=./database.sqlite
SHOPIFY_API_VERSION=2024-10
```

## Getting API Keys

### Shopify App Keys

1. Go to [Shopify Partner Dashboard](https://partners.shopify.com/)
2. Create a new app or use existing
3. Copy API key and API secret key
4. Set up redirect URLs (add `/api/auth/callback`)
5. Configure scopes: `read_products,write_products,read_customers,read_orders`

### Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Create new project or use existing
3. Enable Generative Language API
4. Create API key and copy

## Deployment

### Option 1: Vercel (Recommended)

1. **Connect repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Update redirect URLs** to include your Vercel domain
4. **Deploy**

### Option 2: Railway/Render/Other

1. **Build the app:**
```bash
npm run build
```

2. **Set environment variables**
3. **Update redirect URLs**
4. **Deploy**

### Option 3: Self-hosted

1. **Build and start:**
```bash
npm run build
npm start
```

2. **Set up reverse proxy** (nginx/apache)
3. **Configure SSL certificate**
4. **Update app URLs**

## App Installation

### For Development

1. Start dev server: `npm run dev`
2. Use ngrok or similar for HTTPS: `ngrok http 3000`
3. Update app URL in Partner Dashboard
4. Install on development store

### For Production

1. Deploy app to hosting platform
2. Update app URL in Partner Dashboard
3. Submit for review (if distributing)
4. Install on merchant stores

## Usage

### Basic Commands

- "List the latest 10 products"
- "Update product 123456 title to 'New Product Name'"
- "Create a collection called 'Summer Sale'"
- "Add product 456789 to collection 123"
- "Show customer information"

### Advanced Features

- **GraphQL Generation**: Uses Shopify Dev MCP to create accurate queries
- **Intent Recognition**: Automatically determines the right action
- **Error Handling**: Provides friendly error messages
- **Session Management**: Secure OAuth-based authentication

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Shopify       │    │  Next.js App     │    │  Gemini AI      │
│   Admin         │◄──►│  (Embedded)      │◄──►│  + MCP Tools    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Shopify Admin   │
                       │  GraphQL API     │
                       └──────────────────┘
```

## Development

### File Structure

```
web/
├── src/
│   ├── app/
│   │   ├── api/auth/          # OAuth endpoints
│   │   ├── api/agent/         # AI agent endpoint
│   │   ├── install/           # App installation page
│   │   └── providers.tsx      # App Bridge provider
│   ├── components/
│   │   ├── AgentChat.tsx      # Main chat interface
│   │   └── ProductCard.tsx    # Product display
│   └── lib/
│       ├── shopify.ts         # Shopify API helpers
│       ├── shopify-app.ts     # App configuration
│       └── intents.ts         # Intent schemas
├── mcp/
│   └── shopify-server.mjs     # Custom MCP server
├── shopify.app.toml           # App configuration
└── package.json
```

### Adding New Features

1. **Add intent schema** in `lib/intents.ts`
2. **Add API helper** in `lib/shopify.ts`
3. **Update agent logic** in `api/agent/route.ts`
4. **Test with development store**

## Troubleshooting

### Common Issues

**"App not loading in Shopify Admin"**
- Check app URL and redirect URLs
- Verify HTTPS is enabled
- Check browser console for errors

**"Authentication failed"**
- Verify API keys are correct
- Check redirect URL configuration
- Ensure app is active in Partner Dashboard

**"AI agent not responding"**
- Verify Gemini API key
- Check MCP server logs
- Ensure network access to external APIs

### Logs

Development logs are available in:
- Browser console (client-side)
- Terminal output (server-side)
- Vercel/hosting platform logs (production)

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create GitHub issue
- Check Shopify App development docs
- Review MCP documentation
