import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, FunctionCallingConfigMode, mcpToTool } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  listProducts,
  updateProduct,
  createCustomCollection,
  addProductToCustomCollection,
  removeProductFromCustomCollection,
  listCustomers,
  shopifyGraphQL,
} from "@/lib/shopify";
import { AgentIntent, AgentIntent as AgentIntentType, INTENT_JSON_GUIDE } from "@/lib/intents";

export const dynamic = "force-dynamic";

const SYSTEM_GUIDE = `You are Shopify Dev Assistant, an AI agent that helps developers work with Shopify APIs through MCP (Model Context Protocol) tools.

CORE CAPABILITIES:
- Search Shopify documentation
- Generate GraphQL queries for Shopify Admin API
- Provide code examples and best practices
- Help with product management, orders, customers, and store operations

MCP TOOL USAGE RULES:
1. Always use native JSON for tool calls, never string-encoded
2. Use one tool per response, then wait for results
3. Available tools typically include:
   - search_dev_docs - Search shopify.dev documentation
   - introspect_admin_schema - Inspect Admin GraphQL schema
   - fetch_docs_by_path - Fetch specific documentation
   - get_started - Access getting started guides
   - shopify_admin_graphql - Generate Admin API GraphQL queries

RESPONSE FORMAT:
- Provide clear, executable GraphQL queries
- Include necessary variables and parameters
- Format responses in Markdown
- Always explain the query purpose and expected results

SHOPIFY API FOCUS:
- Admin API for store management
- Storefront API for customer-facing operations
- REST API when GraphQL isn't suitable
- Webhook configurations when relevant

When generating GraphQL queries, ensure they're production-ready with proper error handling and field selection.`;

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

type GraphQLAction = { type: "graphql"; query: string; variables?: Record<string, any> };

type IntentAction = { type: "intent"; intent: AgentIntentType };

type AgentAction = GraphQLAction | IntentAction;

async function inferAction(prompt: string): Promise<AgentAction> {
  console.log("API KEY ", getEnv("GOOGLE_GENERATIVE_AI_API_KEY"));
  const ai = new GoogleGenAI({ apiKey: getEnv("GOOGLE_GENERATIVE_AI_API_KEY") });

  // Connect to Shopify Dev MCP over stdio via npx
  console.debug("[agent] Connecting to Shopify Dev MCP via npx...");
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "@shopify/dev-mcp@latest"],
    env: { OPT_OUT_INSTRUMENTATION: "true" },
  });
  const client = new Client({ name: "shopify-dev-mcp-client", version: "0.1.0" });
  await client.connect(transport);
  console.debug("[agent] MCP connected.");

  try {
    console.debug("[agent] Calling Gemini with MCP tools enabled to infer action...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${SYSTEM_GUIDE}\n\nUse MCP tools when needed to determine the correct Admin GraphQL.\n
      Return ONLY JSON of one of the following shapes:\n
      {"type":"graphql","query":"...","variables":{}} OR {"type":"intent","intent": <AgentIntent JSON>}\n
      AgentIntent JSON must follow this union:\n
      ${INTENT_JSON_GUIDE}\n
      \n
      User prompt: ${prompt}`,
      config: {
        tools: [mcpToTool(client)],
      },
    });
    const text = String((response as any).text || "");

    console.debug("[agent] Model raw response text length:", text.length);
    console.log("Response: ", text);
    let json: any;
    try {
      json = JSON.parse(text);
      console.debug("[agent] Parsed JSON directly from model response.");
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error(`Model did not return valid JSON: ${text}`);
      json = JSON.parse(match[0]);
      console.debug("[agent] Extracted and parsed JSON from response snippet.");
    }

    if (json?.type === "graphql" && typeof json.query === "string") {
      console.debug("[agent] Action determined: GraphQL", {
        queryPreview: json.query.slice(0, 120),
        hasVariables: Boolean(json.variables),
      });
      return { type: "graphql", query: json.query, variables: json.variables || {} };
    }

    const parsed = AgentIntent.safeParse(json?.intent ? json.intent : json);
    if (parsed.success) {
      console.debug("[agent] Action determined: Intent", { name: parsed.data.name, params: parsed.data.params });
      return { type: "intent", intent: parsed.data };
    }

    console.warn("[agent] Unable to determine action from model response.");
    throw new Error("Could not determine action from model response");
  } finally {
    await client.close();
    console.debug("[agent] MCP connection closed.");
  }
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const { prompt } = await req.json();
    console.debug("[agent] POST /api/agent", {
      startedAtISO: new Date(startedAt).toISOString(),
      promptType: typeof prompt,
      promptPreview: typeof prompt === "string" ? String(prompt).slice(0, 200) : undefined,
    });

    // Quick path removed by user to force MCP-assisted reasoning

    console.debug("[agent] Inferring action from prompt...");
    const action = await inferAction(String(prompt ?? ""));
    console.debug("[agent] Inferred action type:", action.type);

    if (action.type === "graphql") {
      const execStart = Date.now();
      console.debug("[agent] Executing Admin GraphQL", {
        queryPreview: action.query.slice(0, 200),
        variablesKeys: action.variables ? Object.keys(action.variables) : [],
      });
      const data = await shopifyGraphQL(action.query, action.variables);
      console.debug("[agent] GraphQL execution complete", { ms: Date.now() - execStart });
      return NextResponse.json({ success: true, type: "graphql_result", message: "Operation completed successfully.", data });
    } else {
      const intent = (action as IntentAction).intent;
      console.debug("[agent] Dispatching intent:", intent.name, intent.params);
      switch (intent.name) {
        case "list_products": {
          const data = await listProducts(intent.params.limit ?? 24);
          console.debug("[agent] list_products completed", { count: Array.isArray((data as any)?.products) ? (data as any).products.length : undefined });
          return NextResponse.json({ success: true, type: "products", message: "Fetched products successfully.", data });
        }
        case "update_product": {
          const data = await updateProduct(intent.params);
          console.debug("[agent] update_product completed");
          return NextResponse.json({ success: true, type: "update_product", message: "Product updated successfully.", data });
        }
        case "create_custom_collection": {
          const data = await createCustomCollection(intent.params);
          console.debug("[agent] create_custom_collection completed");
          return NextResponse.json({ success: true, type: "create_custom_collection", message: "Collection created successfully.", data });
        }
        case "add_product_to_collection": {
          const data = await addProductToCustomCollection(intent.params);
          console.debug("[agent] add_product_to_collection completed");
          return NextResponse.json({ success: true, type: "add_product_to_collection", message: "Product added to collection.", data });
        }
        case "remove_product_from_collection": {
          const data = await removeProductFromCustomCollection(intent.params);
          console.debug("[agent] remove_product_from_collection completed");
          return NextResponse.json({ success: true, type: "remove_product_from_collection", message: "Product removed from collection.", data });
        }
        case "list_customers": {
          const data = await listCustomers(intent.params.limit ?? 24);
          console.debug("[agent] list_customers completed");
          return NextResponse.json({ success: true, type: "customers", message: "Fetched customers successfully.", data });
        }
        default:
          console.warn("[agent] Unsupported intent encountered");
          // Fallback polite admin support message, max 2 sentences
          return NextResponse.json({ success: false, type: "text", message: "I couldn’t safely perform that request right now. Please rephrase or include the exact product ID and fields to update." });
      }
    }
  } catch (error) {
    console.error("[agent] Error handling request:", (error as any)?.message, (error as any)?.stack);
    // Fallback polite admin support message, max 2 sentences
    return NextResponse.json({ success: false, type: "text", message: `I couldn’t safely complete that request. ${(error as any)?.message}` }, { status: 200 });
  } finally {
    console.debug("[agent] Completed /api/agent", { totalMs: Date.now() - startedAt });
  }
} 