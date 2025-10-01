"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function OrderDetails({ params }: { params: { code: string } }) {
  const search = useSearchParams();
  const name = search.get("name") || "";
  const phone = search.get("phone") || "";
  const product = search.get("product") || "";
  const price = search.get("price") || "";
  const status = search.get("status") || "";
  const city = search.get("city") || "";
  const notes = search.get("notes") || "";

  const imageSrc = "/placeholder.jpg";

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <div className="relative w-full aspect-square overflow-hidden rounded-xl border">
                <Image src={imageSrc} alt={product} fill className="object-cover" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold mb-2">تفاصيل الطلب #{params.code}</h1>
              <div className="space-y-2 text-right">
                <div>اسم العميل: <span className="font-medium">{name}</span></div>
                <div>رقم الهاتف: <span className="font-medium">{phone}</span></div>
                <div>المنتج: <span className="font-medium">{product}</span></div>
                <div>السعر: <span className="font-medium">{price}</span></div>
                <div>الحالة: <span className="font-medium">{status}</span></div>
                <div>العنوان: <span className="font-medium">{city}</span></div>
                <div>الملاحظات: <span className="font-medium">{notes}</span></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}


