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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, price, categoryId } = body;

    // บันทึกสินค้าใหม่ลงฐานข้อมูล
    const newProduct = await prisma.product.create({
      data: {
        name,
        price: Number(price), // แปลงเป็นตัวเลขเผื่อรับมาเป็น String
        categoryId,
      },
      include: { category: true }, // ให้ส่งข้อมูล Category กลับมาด้วยเลย
    });

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error("Create Product Error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
