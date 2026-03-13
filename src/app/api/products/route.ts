// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // ดึงข้อมูล Product ทั้งหมด พร้อมกับดึงชื่อ Category ที่ผูกไว้มาด้วย
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
