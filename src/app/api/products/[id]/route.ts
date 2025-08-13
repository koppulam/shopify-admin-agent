import { NextRequest, NextResponse } from "next/server";
import { shopifyRequest } from "@/lib/shopify";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const payload = { product: { id: Number(params.id), ...body } };
    const data = await shopifyRequest(`/products/${params.id}.json`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
} 