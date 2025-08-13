import { z } from "zod";

export const ListProductsIntent = z.object({
  name: z.literal("list_products"),
  params: z.object({ limit: z.number().int().min(1).max(250).optional() }).default({}),
});

export const UpdateProductIntent = z.object({
  name: z.literal("update_product"),
  params: z.object({ id: z.number().int(), title: z.string().optional(), price: z.string().optional() }),
});

export const CreateCustomCollectionIntent = z.object({
  name: z.literal("create_custom_collection"),
  params: z.object({ title: z.string(), body_html: z.string().optional() }),
});

export const AddProductToCollectionIntent = z.object({
  name: z.literal("add_product_to_collection"),
  params: z.object({ collection_id: z.number().int(), product_id: z.number().int() }),
});

export const RemoveProductFromCollectionIntent = z.object({
  name: z.literal("remove_product_from_collection"),
  params: z.object({ collection_id: z.number().int(), product_id: z.number().int() }),
});

export const ListCustomersIntent = z.object({
  name: z.literal("list_customers"),
  params: z.object({ limit: z.number().int().min(1).max(250).optional() }).default({}),
});

export const AgentIntent = z.discriminatedUnion("name", [
  ListProductsIntent,
  UpdateProductIntent,
  CreateCustomCollectionIntent,
  AddProductToCollectionIntent,
  RemoveProductFromCollectionIntent,
  ListCustomersIntent,
]);

export type AgentIntent = z.infer<typeof AgentIntent>;

export const INTENT_JSON_GUIDE = `
Return ONLY JSON matching this TypeScript union type, no prose:

{
  "name": "list_products",
  "params": { "limit"?: number }
} | {
  "name": "update_product",
  "params": { "id": number, "title"?: string, "price"?: string }
} | {
  "name": "create_custom_collection",
  "params": { "title": string, "body_html"?: string }
} | {
  "name": "add_product_to_collection",
  "params": { "collection_id": number, "product_id": number }
} | {
  "name": "remove_product_from_collection",
  "params": { "collection_id": number, "product_id": number }
} | {
  "name": "list_customers",
  "params": { "limit"?: number }
}`; 