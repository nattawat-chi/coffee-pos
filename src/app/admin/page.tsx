// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AdminDashboard() {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    chartData: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      const res = await fetch("/api/dashboard").then((r) => r.json());
      if (res) setData(res);
      setIsLoading(false);
    };
    fetchDashboard();
  }, []);

  if (isLoading)
    return (
      <div className="text-center py-20 text-zinc-500">กำลังโหลดข้อมูล...</div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-zinc-800">
        📊 ภาพรวมยอดขาย (Dashboard)
      </h1>

      {/* กล่องสรุปตัวเลขด้านบน */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* กล่องรายได้รวม */}
        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm flex flex-col justify-center items-center">
          <p className="text-zinc-500 text-sm font-medium mb-1">
            รายได้รวมทั้งหมด
          </p>
          <p className="text-4xl font-bold text-emerald-600">
            ฿{data.totalRevenue.toLocaleString()}
          </p>
        </div>

        {/* กล่องจำนวนออเดอร์ */}
        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm flex flex-col justify-center items-center">
          <p className="text-zinc-500 text-sm font-medium mb-1">
            จำนวนออเดอร์ (บิล)
          </p>
          <p className="text-4xl font-bold text-blue-600">
            {data.totalOrders}{" "}
            <span className="text-xl font-normal text-zinc-400">รายการ</span>
          </p>
        </div>
      </div>

      {/* กราฟแท่งแสดงเมนูขายดี */}
      <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-800 mb-6">
          🏆 เมนูขายดี (จัดอันดับตามจำนวนแก้ว)
        </h2>

        {data.chartData.length > 0 ? (
          <div className="h-100 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e4e4e7"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a" }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a" }}
                />
                <Tooltip
                  cursor={{ fill: "#f4f4f5" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="sales"
                  name="จำนวน (แก้ว/ชิ้น)"
                  fill="#18181b"
                  radius={[4, 4, 0, 0]}
                  barSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-400">
            ยังไม่มีข้อมูลการขายในระบบ
          </div>
        )}
      </div>
    </div>
  );
}
