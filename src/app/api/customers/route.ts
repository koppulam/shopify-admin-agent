import { NextResponse } from "next/server";
import { shopifyRequest } from "@/lib/shopify";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await shopifyRequest(`/customers.json?limit=50`);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
} 