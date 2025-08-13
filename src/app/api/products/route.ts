import { NextResponse } from "next/server";
import { listProducts } from "@/lib/shopify";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await listProducts(24);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
} 