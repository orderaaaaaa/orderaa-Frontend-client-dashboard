"use client";

import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/dashboard-layout";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, User, Phone, Package, Banknote, MapPin } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import GlassButton from "@/components/ui/glassBtn";
import Image from "next/image";

import Vector from "@/public/Icons/Vector.svg";
import Vector2 from "@/public/Icons/Vector2.svg";
import Vector3 from "@/public/Icons/Vector3.svg";
import Vector4 from "@/public/Icons/Vector4.svg";
import Vector5 from "@/public/Icons/Vector5.svg";
import Vector6 from "@/public/Icons/Vector6.svg";
import Vector7 from "@/public/Icons/Vector7.svg";
import Vector8 from "@/public/Icons/Vector8.svg";
import Vector9 from "@/public/Icons/Vector9.svg";
import Vector10 from "@/public/Icons/Vector10.svg";
import IdIcon from "@/public/Icons/id.svg";

interface Row {
  code: string;
  name: string;
  phone: string;
  product: string;
  price: string;
  status: string;
  city: string;
  notes: string;
}

export default function AllOrders() {
  const tabs: { label: string; icon: any }[] = [
    { label: "طلبات جديدة", icon: Vector3 },
    { label: "تم المحاولة", icon: Vector2 },
    { label: "في انتظار الدفع", icon: Vector2 },
    { label: "واتساب", icon: Vector4 },
    { label: "تأجيلات", icon: Vector },
    { label: "إعادة اتصال", icon: Vector5 },
    { label: "وقف التشغيل", icon: Vector },
    { label: "تم التأكيد", icon: Vector8 },
    { label: "تم التحضير", icon: Vector9 },
    { label: " في الشحن", icon: Vector7 },
    { label: "تقارير", icon: Vector6 },
    { label: "تم الالغاء", icon: Vector10 },
    { label: " طلبات غير مكتمله", icon: Vector10 },
    { label: " طلبات مستعجلة", icon: Vector10 },
    { label: "تم الالغاء", icon: Vector10 },
  ];

  // Helper: get icon for a given status label (fallback to Vector)
  const getStatusIcon = (status: string) => {
    return tabs.find((t) => t.label === status)?.icon ?? Vector;
  };

  const data: Row[] = [
    { code: "1001", name: "محمد بدر", phone: "01112223355", product: "لاب توب Dell", price: "200", status: "طلبات جديدة", city: "القاهرة", notes: "اتصل به غداً" },
    { code: "1002", name: "أحمد حسن", phone: "01099887766", product: "موبايل Samsung", price: "250", status: "طلبات جديدة", city: "الجيزة", notes: "انتظار تأكيد" },
    { code: "1003", name: "خالد علي", phone: "0123456789", product: "سماعات JBL", price: "300", status: "طلبات جديدة", city: "الإسكندرية", notes: "تم إرسال عرض" },
    { code: "2001", name: "محمود سامي", phone: "01544556677", product: "طابعة HP", price: "180", status: "تم المحاولة", city: "طنطا", notes: "مغلق" },
    { code: "2002", name: "فاطمة محمد", phone: "01033445566", product: "شاشة LG", price: "220", status: "تم المحاولة", city: "القاهرة", notes: "سيعاود الاتصال" },
    { code: "3001", name: "يوسف سعيد", phone: "01299887755", product: "ماوس Logitech", price: "150", status: "واتساب", city: "المنصورة", notes: "في انتظار الرد" },
    { code: "3002", name: "علي حسن", phone: "01011223344", product: "كيبورد ميكانيكي", price: "400", status: "واتساب", city: "الإسكندرية", notes: "اقترح تخفيض" },
    { code: "4001", name: "سارة أحمد", phone: "01177889900", product: "ساعة Apple Watch", price: "275", status: "إعادة اتصال", city: "الجيزة", notes: "اتصل بعد العصر" },
    { code: "4002", name: "مروان سمير", phone: "01522334455", product: "سماعة AirPods", price: "350", status: "إعادة اتصال", city: "القاهرة", notes: "لا يرد" },
    { code: "5001", name: "داليا عادل", phone: "01077889900", product: "كيس كمبيوتر", price: "210", status: "وقف التشغيل", city: "بورسعيد", notes: "رقم غير مستخدم" },
    { code: "5002", name: "كريم علي", phone: "01255443322", product: "بروجيكتور", price: "290", status: "وقف التشغيل", city: "القاهرة", notes: "مغلق نهائياً" },
    { code: "6001", name: "هدى محمود", phone: "01144556677", product: "هارد SSD", price: "310", status: "لم يتم المحاولة امس", city: "الفيوم", notes: "لم يتصل أحد" },
    { code: "6002", name: "ياسين محمد", phone: "01588997766", product: "كارت شاشة NVIDIA", price: "260", status: "لم يتم المحاولة امس", city: "الإسكندرية", notes: "مطلوب تواصل اليوم" },
    { code: "7001", name: "نادر حسن", phone: "01044556677", product: "لاب توب HP", price: "500", status: "طلبات  تم التأكيد", city: "القاهرة", notes: "تم الدفع" },
    { code: "7002", name: "مها عبد الله", phone: "01222334455", product: "تليفزيون Samsung", price: "430", status: "طلبات  تم التأكيد", city: "الجيزة", notes: "تسليم غداً" },
    { code: "8001", name: "رامي طارق", phone: "01199887755", product: "غسالة LG", price: "380", status: "طلبات تم التحضير", city: "المنوفية", notes: "جاهز للشحن" },
    { code: "8002", name: "نور محمود", phone: "01066554433", product: "ثلاجة Toshiba", price: "270", status: "طلبات تم التحضير", city: "القاهرة", notes: "بانتظار شركة الشحن" },
    { code: "9001", name: "سامي حسين", phone: "01533221100", product: "مكيف شارب", price: "600", status: "طلبات في الشحن", city: "الإسكندرية", notes: "في الطريق" },
    { code: "9002", name: "جنى علي", phone: "01055667788", product: "مروحة توشيبا", price: "720", status: "طلبات في الشحن", city: "القاهرة", notes: "سيصل خلال يومين" },
    { code: "9003", name: "إسراء مصطفى", phone: "01277889900", product: "دفاية كهرباء", price: "450", status: "طلبات في الشحن", city: "بورسعيد", notes: "تم تأكيد العنوان" },
  ];

  const [filters, setFilters] = useState({ product: "", code: "", phone: "", city: "", date: "" });
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [showFilters, setShowFilters] = useState(false);

  const filteredData = data.filter((row) => {
    return (
      (!activeTab || row.status === activeTab) &&
      (!filters.product || row.product === filters.product) &&
      (!filters.code || row.code === filters.code) &&
      (!filters.phone || row.phone === filters.phone) &&
      (!filters.city || row.city === filters.city) &&
      (!filters.date || row.notes.includes(filters.date))
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);
  const countForStatus = (status: string) => data.filter((row) => row.status === status).length;

  const toggleRow = (code: string) => {
    setSelectedRows((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="bg-white rounded-lg shadow p-6">
          <AnimatePresence>
            {open && (
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={{ duration: 0.5 }} className="w-full">
                {/* Tabs (filters with icons) */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <GlassButton
                    onClick={() => {
                      setActiveTab("");
                      setPage(1);
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Image src={Vector} className="group-hover:invert group-hover:brightness-0 group-hover:contrast-200 group-hover:saturate-0" alt="all-orders" width={16} height={16} />
                      <span className="inline-flex items-center gap-1">
                        <span className="px-1">جميع الطلبات</span>
                        <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-[#5D24E1] group-hover:bg-[#ffffff] group-hover:text-[#5D24E1] text-white text-[11px]">
                          {data.length}
                        </span>
                      </span>
                    </span>
                  </GlassButton>

                  {tabs.map((t) => (
                    <GlassButton
                      key={t.label}
                      onClick={() => {
                        setActiveTab(t.label);
                        setPage(1);
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Image src={t.icon} className="group-hover:invert group-hover:brightness-0 group-hover:contrast-200 group-hover:saturate-0" alt="status" width={16} height={16} />
                        <span className="inline-flex items-center gap-1">
                          <span className="px-1">{t.label}</span>
                          <span
                            className={`inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-[11px] ${
                              activeTab === t.label ? "bg-[#ffffff] text-[#5D24E1]" : "bg-[#5D24E1] text-white"
                            } group-hover:bg-[#ffffff] group-hover:text-[#5D24E1]`}
                          >
                            {countForStatus(t.label)}
                          </span>
                        </span>
                      </span>
                    </GlassButton>
                  ))}
                </div>

                {/* Filters Toggle */}
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setShowFilters((v) => !v)} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-dashed border-gray-300 hover:bg-gray-50 transition text-gray-800">
                    <span className="inline-flex items-center gap-1">
                      <MoreVertical className="w-4 h-4" />
                    </span>
                    <span className="font-medium">الفلاتر</span>
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-wrap gap-4 mb-6 overflow-hidden rounded-xl border border-white/50 bg-white/50 backdrop-blur-md shadow-sm p-4"
                    >
                      {/* ... filter inputs (unchanged) ... */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">بالمنتج</label>
                        <input type="text" value={filters.product} onChange={(e) => setFilters({ ...filters, product: e.target.value })} placeholder="اسم المنتج" className="w-44 px-3 py-2 rounded border border-gray-300 bg-white" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">بالكود</label>
                        <input type="text" value={filters.code} onChange={(e) => setFilters({ ...filters, code: e.target.value })} placeholder="كود المنتج" className="w-44 px-3 py-2 rounded border border-gray-300 bg-white" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">برقم العميل</label>
                        <input type="text" value={filters.phone} onChange={(e) => setFilters({ ...filters, phone: e.target.value })} placeholder="رقم الهاتف" className="w-52 px-3 py-2 rounded border border-gray-300 bg-white" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">بالعنوان</label>
                        <input type="text" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} placeholder="المدينة" className="w-44 px-3 py-2 rounded border border-gray-300 bg-white" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">بالتاريخ</label>
                        <input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} className="w-44 px-3 py-2 rounded border border-gray-300 bg-white" />
                      </div>
                      <button
                        onClick={() => setFilters({ product: "", code: "", phone: "", city: "", date: "" })}
                        className="px-4 py-2 h-10 self-end rounded-md border border-gray-400 text-gray-600 hover:bg-gray-100"
                      >
                        مسح الفلاتر
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Select all */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={paginatedData.length > 0 && paginatedData.every((row) => selectedRows.includes(row.code))}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedRows([...new Set([...selectedRows, ...paginatedData.map((r) => r.code)])]);
                        else setSelectedRows(selectedRows.filter((code) => !paginatedData.map((r) => r.code).includes(code)));
                      }}
                    />
                    <span className="text-sm text-gray-600">تحديد الكل في الصفحة</span>
                  </div>
                </div>

                {/* Cards */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {paginatedData.map((row, i) => {
                    const StatusIcon = getStatusIcon(row.status);
                    return (
                      <motion.div key={row.code} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                        <Card className="w-full bg-gradient-to-b from-[#FCFAFD] to-[#EADBFF] border rounded-[20px] border-[#5D24E147]/28 shadow-lg">
                          <CardContent className="text-sm">
                            

                            <div dir="rtl" className="space-y-2 h-full">
                              {/* Top row: time/checkbox + status GlassButton with same icon as filters */}
                            

                              {/* Full-width grid for all content */}
                              <div className="grid grid-cols-12 gap-2 w-full">
                                {/* الكود */}
                                <div className="col-span-12 md:col-span-6 flex items-center gap-1.5 ">
                                  <Image src={IdIcon} alt="ID" width={16} height={16} className="shrink-0" />
                                  <span className="text-gray-600">الكود</span>
                                  <span className="font-semibold">{row.code}</span>
                                </div>

                                {/* الميعاد (keeping as is, empty right now if needed) */}
                                <div className="col-span-12 md:col-span-6 flex items-center gap-1.5 justify-end">

                                <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-[12px] text-gray-600">منذ 3 أيام و 15 ساعة</span>
                                  <input type="checkbox" checked={selectedRows.includes(row.code)} onChange={() => toggleRow(row.code)} />
                                </div>
                                </div>
                                  
                                </div>

                                {/* الاسم */}
                                <div className="col-span-12 md:col-span-6 flex items-center gap-1.5 md:justify-start">
                                  <User className="w-4 h-4 text-black" />
                                  <span className="font-medium">{row.name}</span>
                                </div>

                                {/* الحالة */}
                                <div className="col-span-12 md:col-span-6 flex items-center gap-1.5 md:justify-start scale-90 ms-12">
                                  
                                <GlassButton>
                                  <span className="inline-flex items-center gap-2 ">
                                    <Image
                                      src={StatusIcon}
                                      alt="status"
                                      width={16}
                                      height={16}
                                      className="group-hover:invert group-hover:brightness-0 group-hover:contrast-200 group-hover:saturate-0"
                                    />
                                    <span className="px-1">{row.status}</span>
                                  </span>
                                </GlassButton>
                                </div>
                                {/* الهاتف (full width) */}
                                <div className="col-span-12 md:col-span-12 flex items-center gap-1.5">
                                  <Phone className="w-4 h-4 text-black" />
                                  <span className="font-medium ltr:text-left rtl:text-right">{row.phone}</span>
                                </div>

                                {/* المدينة */}
                                <div className="col-span-12 md:col-span-6 flex items-center gap-1.5 md:justify-start">
                                  <MapPin className="w-4 h-4 text-black" />
                                  <span className="font-medium">{row.city}</span>
                                </div>

                                {/* السعر */}
                                <div className="col-span-12 md:col-span-6 flex items-center gap-1.5">
                                  <Banknote className="w-4 h-4 text-black" />
                                  <span className="font-medium">{row.price}</span>
                                </div>

                                {/* المنتج */}
                                <div className="col-span-12 md:col-span-6 flex items-center gap-1.5 md:justify-start">
                                  <Package className="w-4 h-4 text-black" />
                                  <span className="font-medium">{row.product}</span>
                                </div>

                                {/* المحاولات */}
                                <div className="col-span-12 md:col-span-6 flex items-center gap-1.5">
                                  <Image src={Vector2} alt="tries" width={16} height={16} className="shrink-0 brightness-0" />
                                  <span className="font-medium">المحاولات : 15</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>

                          {/* <div className="flex justify-end px-4 ">
                            <Link
                              href={{
                                pathname: `/dashboard/orders/${row.code}`,
                                query: {
                                  name: row.name,
                                  phone: row.phone,
                                  product: row.product,
                                  price: row.price,
                                  status: row.status,
                                  city: row.city,
                                  notes: row.notes,
                                },
                              }}
                              className="inline-flex items-center rounded-full border border-purple-300 bg-white/70 px-3 py-1 text-xs font-medium text-purple-700 hover:bg-white/90"
                            >
                              تفاصيل
                            </Link>
                          </div> */}
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Pagination + selected counter */}
                <div className="flex justify-between items-center mt-6">
                  <div className="flex justify-center mt-4 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 py-1 border rounded ${p === page ? "bg-purple-600 text-white border-purple-600" : "border-gray-300 hover:bg-gray-100"}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {selectedRows.length > 0 && (
                    <>
                      <div className="flex justify-center gap-4 mt-6">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition">
                          مشاركة شيت اكسل
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 rounded-md border border-purple-600 text-purple-600 hover:bg-purple-100 transition">
                          مشاركة واتساب
                        </motion.button>
                      </div>

                      <div className="flex justify-end mt-4">
                        <span className="font-bold text-md text-gray-800">تم تحديد {selectedRows.length} منتج</span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
