// src/app/admin/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ManageProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State สำหรับจัดการฟอร์ม
  const [editingId, setEditingId] = useState<string | null>(null); // เก็บ ID ของเมนูที่กำลังแก้ไข
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const fetchData = async () => {
    const [resProducts, resCategories] = await Promise.all([
      fetch("/api/products").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
    ]);
    setProducts(resProducts);
    setCategories(resCategories);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ฟังก์ชันเปิด Popup แบบ "เพิ่มเมนูใหม่" (เคลียร์ช่องกรอกให้ว่าง)
  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    if (categories.length > 0) setCategoryId(categories[0].id);
    setIsDialogOpen(true);
  };

  // ฟังก์ชันเปิด Popup แบบ "แก้ไขเมนูเดิม" (ดึงข้อมูลเก่ามาใส่ช่องกรอก)
  const handleOpenEdit = (product: any) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setCategoryId(product.categoryId);
    setIsDialogOpen(true);
  };

  // ฟังก์ชันกดบันทึก (ระบบจะเช็คเองว่าต้องสร้างใหม่หรืออัปเดตของเดิม)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) return alert("กรุณากรอกข้อมูลให้ครบ");

    // สลับ URL และ Method ตามสถานะ
    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, categoryId }),
    });

    if (res.ok) {
      alert(editingId ? "แก้ไขเมนูสำเร็จ!" : "เพิ่มเมนูสำเร็จ!");
      setIsDialogOpen(false);
      fetchData(); // รีเฟรชตาราง
    } else {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเมนู "${name}"?`)) return;

    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("ลบเมนูสำเร็จ");
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-zinc-800">จัดการเมนูสินค้า</h1>

        <Button
          onClick={handleOpenCreate}
          className="bg-zinc-900 text-white hover:bg-zinc-800"
        >
          + เพิ่มเมนูใหม่
        </Button>

        {/* Popup ฟอร์ม (ใช้ตัวเดียวคุ้มๆ ทั้งเพิ่มและแก้ไข) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "แก้ไขเมนูสินค้า" : "เพิ่มเมนูใหม่"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>ชื่อเมนู</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น Iced Latte"
                />
              </div>
              <div className="space-y-2">
                <Label>ราคา (บาท)</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="เช่น 65"
                />
              </div>
              <div className="space-y-2">
                <Label>หมวดหมู่</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full mt-4">
                {editingId ? "บันทึกการแก้ไข" : "บันทึกข้อมูล"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ตารางแสดงสินค้า */}
      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-100 text-zinc-600 font-medium border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3">ชื่อเมนู</th>
              <th className="px-6 py-3">หมวดหมู่</th>
              <th className="px-6 py-3 text-right">ราคา</th>
              <th className="px-6 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50"
              >
                <td className="px-6 py-4 font-medium">{product.name}</td>
                <td className="px-6 py-4 text-zinc-500">
                  {product.category?.name}
                </td>
                <td className="px-6 py-4 text-right">฿{product.price}</td>
                <td className="px-6 py-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2 cursor-pointer"
                    onClick={() => handleOpenEdit(product)}
                  >
                    แก้ไข
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => handleDelete(product.id, product.name)}
                  >
                    ลบ
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
