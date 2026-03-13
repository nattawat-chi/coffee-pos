// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useCartStore, Product as StoreProduct } from "@/store/useCartStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// สร้าง Type มารับข้อมูลที่ได้จาก API
interface APIProduct extends StoreProduct {
  category: {
    id: string;
    name: string;
  };
}

export default function POSPage() {
  const { items, addItem, removeItem, getTotal, clearCart } = useCartStore();
  const [products, setProducts] = useState<APIProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลจาก API เมื่อเปิดหน้าเว็บ
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load menu", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      {/* ฝั่งซ้าย: โซนเลือกเมนู */}
      <div className="flex-1 p-6 flex flex-col h-full">
        <h1 className="text-2xl font-bold mb-6 text-zinc-800">Menu</h1>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-zinc-500">
              กำลังโหลดข้อมูลเมนู...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:border-zinc-400 transition-colors shadow-sm"
                  onClick={() =>
                    addItem(
                      product,
                      product.category.name === "Slow Bar"
                        ? "AeroPress"
                        : undefined,
                    )
                  }
                >
                  <CardContent className="p-4 flex flex-col h-full justify-between items-center text-center">
                    <div className="h-24 w-24 bg-zinc-200 rounded-md mb-4 flex items-center justify-center text-3xl">
                      {product.category.name === "Bakery" ? "🥐" : "☕"}
                    </div>
                    <h3 className="font-medium text-sm text-zinc-700">
                      {product.name}
                    </h3>
                    <p className="font-semibold text-zinc-900 mt-2">
                      ฿{product.price}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* ฝั่งขวา: โซนตะกร้าคิดเงิน */}
      <div className="w-100 bg-white border-l border-zinc-200 p-6 flex flex-col shadow-xl z-10">
        <h2 className="text-xl font-bold mb-6 text-zinc-800">Current Order</h2>
        <ScrollArea className="flex-1 pr-4 -mr-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400">
              <p>ยังไม่มีรายการสินค้า</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex justify-between items-start"
                >
                  <div>
                    <p className="font-medium text-zinc-800">{item.name}</p>
                    {item.brewMethod && (
                      <p className="text-xs text-zinc-500">
                        Method: {item.brewMethod}
                      </p>
                    )}
                    <p className="text-sm text-zinc-500">
                      ฿{item.price} x {item.quantity}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-semibold text-zinc-900">
                      ฿{item.price * item.quantity}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => removeItem(item.cartItemId)}
                    >
                      ลบ
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="pt-6 mt-6 border-t border-zinc-200">
          <div className="flex justify-between items-center mb-6">
            <span className="text-zinc-500 font-medium">Total</span>
            <span className="text-3xl font-bold text-zinc-900">
              ฿{getTotal()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full" onClick={clearCart}>
              ยกเลิก
            </Button>
            <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
              ชำระเงิน
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
