// src/app/admin/page.tsx
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  // 1. คิวรีหา "ยอดขายรวม" จากออเดอร์ที่สถานะ COMPLETED
  const aggregate = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: "COMPLETED" },
  });
  const totalRevenue = aggregate._sum.totalAmount || 0;

  // 2. ดึงประวัติ "ออเดอร์ล่าสุด 5 รายการ" พร้อมข้อมูลพนักงานที่ทำรายการ
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-zinc-800">Dashboard</h1>

      {/* โซนการ์ดสรุปยอด */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              ยอดขายรวม (Total Revenue)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-zinc-900">
              ฿{totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* โซนตารางออเดอร์ล่าสุด */}
      <h2 className="text-xl font-bold text-zinc-800 mt-8 mb-4">
        ออเดอร์ล่าสุด (Recent Orders)
      </h2>
      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-100 text-zinc-600 font-medium border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">พนักงานที่รับออเดอร์</th>
              <th className="px-6 py-3">เวลา</th>
              <th className="px-6 py-3 text-right">ยอดรวม</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                  ยังไม่มีข้อมูลการขาย
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50"
                >
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                    {order.id.slice(-8)} {/* โชว์แค่ 8 ตัวท้ายให้ดูง่าย */}
                  </td>
                  <td className="px-6 py-4">
                    {order.user?.email || "Unknown"}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(order.createdAt).toLocaleString("th-TH")}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    ฿{order.totalAmount.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
