import { NextRequest, NextResponse } from "next/server";
import { shopifyRequest } from "@/lib/shopify";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await shopifyRequest(`/custom_collections.json?limit=50`);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = { custom_collection: body };
    const data = await shopifyRequest(`/custom_collections.json`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
} 