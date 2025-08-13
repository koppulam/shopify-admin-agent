#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const apiVersion = process.env.SHOPIFY_API_VERSION || "2024-10";

function getEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function shopifyGraphQL(query, variables) {
  const storeDomain = getEnv("SHOPIFY_STORE_DOMAIN");
  const token = getEnv("SHOPIFY_ADMIN_API_ACCESS_TOKEN");
  const url = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`GraphQL error: ${JSON.stringify(json.errors || json)}`);
  return json.data;
}

const PRODUCTS_QUERY = `#graphql
  query Products($first: Int!) {
    products(first: $first, sortKey: UPDATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          featuredImage { url altText }
          images(first: 1) { edges { node { url altText } } }
          variants(first: 1) { edges { node { id price { amount currencyCode } } } }
        }
      }
    }
  }
`;

async function main() {
  const transport = new StdioServerTransport();
  const server = new Server({ name: "shopify-admin-mcp", version: "0.2.0" }, { capabilities: { tools: {} } });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "shopify_products_graphql",
        description: "List products via Admin GraphQL API",
        inputSchema: {
          type: "object",
          properties: { first: { type: "integer", minimum: 1, maximum: 250, default: 10 } },
          additionalProperties: false,
        },
      },
      {
        name: "shopify_graphql_raw",
        description: "Run a raw Admin GraphQL operation with variables",
        inputSchema: {
          type: "object",
          properties: { query: { type: "string" }, variables: { type: "object" } },
          required: ["query"],
          additionalProperties: true,
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    if (req.params.name === "shopify_products_graphql") {
      const first = req.params.arguments?.first ?? 10;
      const data = await shopifyGraphQL(PRODUCTS_QUERY, { first });
      return { content: [{ type: "json", json: data }] };
    }
    if (req.params.name === "shopify_graphql_raw") {
      const { query, variables } = req.params.arguments ?? {};
      const data = await shopifyGraphQL(query, variables);
      return { content: [{ type: "json", json: data }] };
    }
    throw new Error(`Unknown tool: ${req.params.name}`);
  });

  await server.connect(transport);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}); 