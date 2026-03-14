// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, totalAmount } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // ในระบบจริง userId ควรมาจากระบบ Login (เช่น NextAuth)
    // แต่ตอนนี้เราจะดึงพนักงานคนแรกในระบบมาใช้เป็นคนทำรายการไปก่อน
    const defaultStaff = await prisma.user.findFirst();

    if (!defaultStaff) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลพนักงาน กรุณาสร้าง User ใน Prisma Studio ก่อน" },
        { status: 400 },
      );
    }

    // บันทึก Order และ OrderItem ลงฐานข้อมูล
    const order = await prisma.order.create({
      data: {
        userId: defaultStaff.id,
        totalAmount: totalAmount,
        status: "COMPLETED", // กำหนดสถานะเป็นทำรายการเสร็จสิ้น
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            brewMethod: item.brewMethod || null,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { error: "ไม่สามารถบันทึกคำสั่งซื้อได้" },
      { status: 500 },
    );
  }
}
