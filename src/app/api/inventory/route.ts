// src/app/api/inventory/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 1. ดึงรายการวัตถุดิบทั้งหมด
export async function GET() {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { updatedAt: "desc" }, // เรียงลำดับอันที่เพิ่งอัปเดตล่าสุดขึ้นก่อน
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 },
    );
  }
}

// 2. สร้างวัตถุดิบใหม่ (เช่น ซื้อน้ำเชื่อมรสใหม่เข้ามา)
export async function POST(req: Request) {
  try {
    const { name, unit, quantity } = await req.json();
    const newItem = await prisma.inventoryItem.create({
      data: { name, unit, quantity: Number(quantity) },
    });
    return NextResponse.json(newItem);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 },
    );
  }
}

// 3. อัปเดตสต็อก (รองรับทั้งการ 'เติมของ' และ 'แก้ไขข้อมูลตรงๆ')
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, quantityToAdd, exactQuantity, name, unit } = body;

    // กรณีที่ 1: ถ้าส่ง quantityToAdd มา แปลว่ากดปุ่ม "+ เติมสต็อก" (ให้บวกเพิ่ม)
    if (quantityToAdd !== undefined) {
      const updatedItem = await prisma.inventoryItem.update({
        where: { id },
        data: { quantity: { increment: Number(quantityToAdd) } },
      });
      return NextResponse.json(updatedItem);
    }

    // กรณีที่ 2: ถ้าส่ง exactQuantity มา แปลว่ากดปุ่ม "✏️ แก้ไข" (ให้เขียนทับค่าใหม่ไปเลย)
    if (exactQuantity !== undefined) {
      const updatedItem = await prisma.inventoryItem.update({
        where: { id },
        data: {
          name: name,
          unit: unit,
          quantity: Number(exactQuantity), // เขียนทับตัวเลขเดิม
        },
      });
      return NextResponse.json(updatedItem);
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update stock" },
      { status: 500 },
    );
  }
}
