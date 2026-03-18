// src/app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { format, startOfDay, startOfMonth, startOfYear } from "date-fns";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: { status: "COMPLETED" },
      orderBy: { createdAt: "asc" },
    });

    // ฟังก์ชันจัดกลุ่มข้อมูล
    const groupBy = (formatStr: string) => {
      const stats: Record<string, number> = {};
      orders.forEach((order) => {
        const dateKey = format(new Date(order.createdAt), formatStr);
        stats[dateKey] = (stats[dateKey] || 0) + order.totalAmount;
      });
      return Object.keys(stats).map((key) => ({
        label: key,
        amount: stats[key],
      }));
    };

    // สรุปยอดขายตามช่วงเวลา
    const dailySales = groupBy("dd/MM"); // รายวัน (ในเดือนนี้)
    const monthlySales = groupBy("MMM yy"); // รายเดือน (ในรอบปี)
    const yearlySales = groupBy("yyyy"); // รายปี

    // คำนวณยอดสรุปด้านบน
    const today = new Date().toDateString();
    const salesToday = orders
      .filter((o) => new Date(o.createdAt).toDateString() === today)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return NextResponse.json({
      salesToday,
      dailySales,
      monthlySales,
      yearlySales,
      totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard" },
      { status: 500 },
    );
  }
}
