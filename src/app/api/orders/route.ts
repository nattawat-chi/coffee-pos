// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // ดึงออเดอร์ทั้งหมด เรียงจากใหม่ไปเก่า (ล่าสุดขึ้นก่อน)
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, name: true } }, // ดึงชื่อพนักงานที่ทำรายการ
        items: {
          include: { product: true }, // ดึงรายการสินค้าข้างในบิลด้วย
        },
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
