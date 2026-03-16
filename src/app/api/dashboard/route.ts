// src/app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. ดึงออเดอร์ที่ "ชำระเงินแล้ว (COMPLETED)" ทั้งหมด พร้อมรายการสินค้าข้างใน
    const completedOrders = await prisma.order.findMany({
      where: { status: "COMPLETED" },
      include: { items: { include: { product: true } } },
    });

    // 2. คำนวณรายได้รวม และ จำนวนบิลทั้งหมด
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const totalOrders = completedOrders.length;

    // 3. คำนวณยอดขายแยกตามเมนู (เพื่อเอาไปทำกราฟ)
    const productSales: Record<string, number> = {};
    completedOrders.forEach((order) => {
      order.items.forEach((item) => {
        const name = item.product.name;
        // เอาจำนวนแก้วที่ขายได้ มาบวกสะสมในชื่อเมนูนั้นๆ
        productSales[name] = (productSales[name] || 0) + item.quantity;
      });
    });

    // 4. แปลงข้อมูลให้อยู่ในรูปแบบที่กราฟ Recharts ต้องการ: [{ name: 'Latte', sales: 10 }, ...]
    const chartData = Object.keys(productSales)
      .map((name) => ({
        name,
        sales: productSales[name],
      }))
      .sort((a, b) => b.sales - a.sales); // เรียงจากขายดีสุดไปน้อยสุด

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      chartData,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
