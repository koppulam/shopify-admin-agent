export type ShopifyProduct = {
  id: number;
  title: string;
  body_html?: string;
  image?: { src: string } | null;
  images?: { src: string }[];
  variants?: Array<{ id: number; price: string; title: string; sku?: string }>;
};

const apiVersion = process.env.SHOPIFY_API_VERSION || "2024-10";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

// For standalone usage (when not using Shopify App sessions)
export async function shopifyRequest<TResponse = unknown>(
  path: string,
  init?: RequestInit
): Promise<TResponse> {
  const storeDomain = getEnv("SHOPIFY_STORE_DOMAIN");
  const accessToken = getEnv("SHOPIFY_ADMIN_API_ACCESS_TOKEN");

  const url = `https://${storeDomain}/admin/api/${apiVersion}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify API error ${response.status}: ${text}`);
  }

  return (await response.json()) as TResponse;
}

// For Shopify App usage (with session)
export async function shopifyRequestWithSession<TResponse = unknown>(
  session: { shop: string; accessToken: string },
  path: string,
  init?: RequestInit
): Promise<TResponse> {
  const url = `https://${session.shop}/admin/api/${apiVersion}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": session.accessToken,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify API error ${response.status}: ${text}`);
  }

  return (await response.json()) as TResponse;
}

export async function listProducts(limit = 24) {
  return shopifyRequest<{ products: ShopifyProduct[] }>(`/products.json?limit=${limit}`);
}

export async function updateProduct(product: { id: number; title?: string; price?: string }) {
  const payload: any = { product: { id: product.id } };
  if (product.title !== undefined) payload.product.title = product.title;
  // Update price via variants[0] for simplicity
  if (product.price !== undefined) payload.product.variants = [{ price: product.price }];
  return shopifyRequest(`/products/${product.id}.json`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function createCustomCollection(params: { title: string; body_html?: string }) {
  return shopifyRequest(`/custom_collections.json`, {
    method: "POST",
    body: JSON.stringify({ custom_collection: params }),
  });
}

export async function addProductToCustomCollection(params: { collection_id: number; product_id: number }) {
  return shopifyRequest(`/collects.json`, {
    method: "POST",
    body: JSON.stringify({ collect: params }),
  });
}

export async function removeProductFromCustomCollection(params: { collection_id: number; product_id: number }) {
  // Need to find the collect id first
  const collects = await shopifyRequest<{ collects: Array<{ id: number; product_id: number; collection_id: number }> }>(
    `/collects.json?product_id=${params.product_id}&collection_id=${params.collection_id}`
  );
  const collectId = collects.collects?.[0]?.id;
  if (!collectId) throw new Error("Collect relation not found");
  return shopifyRequest(`/collects/${collectId}.json`, { method: "DELETE" });
}

export async function listCustomers(limit = 24) {
  return shopifyRequest(`/customers.json?limit=${limit}`);
}

// Admin GraphQL helpers
export async function shopifyGraphQL<TData = unknown>(query: string, variables?: Record<string, any>): Promise<TData> {
  const storeDomain = getEnv("SHOPIFY_STORE_DOMAIN");
  const accessToken = getEnv("SHOPIFY_ADMIN_API_ACCESS_TOKEN");
  const url = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = await response.json();
  if (!response.ok || json.errors) {
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors || json)}`);
  }
  return json.data as TData;
}

export async function shopifyGraphQLWithSession<TData = unknown>(
  session: { shop: string; accessToken: string },
  query: string, 
  variables?: Record<string, any>
): Promise<TData> {
  const url = `https://${session.shop}/admin/api/${apiVersion}/graphql.json`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": session.accessToken,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = await response.json();
  if (!response.ok || json.errors) {
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors || json)}`);
  }
  return json.data as TData;
}

export async function listProductsGraphQL(first = 10) {
  const query = `#graphql
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
  return shopifyGraphQL(query, { first });
} 