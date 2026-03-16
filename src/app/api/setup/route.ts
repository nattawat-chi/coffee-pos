// src/app/api/setup/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // กำหนดรหัสผ่านเริ่มต้นคือ admin123
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // ใช้คำสั่ง upsert: ถ้ามีอีเมลนี้อยู่แล้วให้อัปเดต ถ้ายังไม่มีให้สร้างใหม่
    const admin = await prisma.user.upsert({
      where: { email: "admin@coffee.com" },
      update: { password: hashedPassword, role: "ADMIN" },
      create: {
        email: "admin@coffee.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    return NextResponse.json({
      message: "สร้างบัญชีแอดมินสำเร็จ!",
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
