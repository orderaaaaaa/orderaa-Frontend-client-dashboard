"use client";

import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/dashboard-layout";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { ChevronDown } from "lucide-react";

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
  const tabs = [
    "طلبات جديدة",
    "تم المحاولة",
    "واتساب",
    "إعادة اتصال",
    "وقف التشغيل",
    "لم يتم المحاولة امس",
    "طلبات  تم التأكيد",
    "طلبات تم التحضير",
    "طلبات في الشحن",
  ];

  // بيانات وهمية - كل تاب فيه 3 أوردرات
  const data: Row[] = [
    // طلبات جديدة
    {
      code: "1001",
      name: "محمد بدر",
      phone: "01112223355",
      product: "لاب توب Dell",
      price: "200",
      status: "طلبات جديدة",
      city: "القاهرة",
      notes: "اتصل به غداً",
    },
    {
      code: "1002",
      name: "أحمد حسن",
      phone: "01099887766",
      product: "موبايل Samsung",
      price: "250",
      status: "طلبات جديدة",
      city: "الجيزة",
      notes: "انتظار تأكيد",
    },
    {
      code: "1003",
      name: "خالد علي",
      phone: "0123456789",
      product: "سماعات JBL",
      price: "300",
      status: "طلبات جديدة",
      city: "الإسكندرية",
      notes: "تم إرسال عرض",
    },

    // تم المحاولة
    {
      code: "2001",
      name: "محمود سامي",
      phone: "01544556677",
      product: "طابعة HP",
      price: "180",
      status: "تم المحاولة",
      city: "طنطا",
      notes: "مغلق",
    },
    {
      code: "2002",
      name: "فاطمة محمد",
      phone: "01033445566",
      product: "شاشة LG",
      price: "220",
      status: "تم المحاولة",
      city: "القاهرة",
      notes: "سيعاود الاتصال",
    },

    // واتساب
    {
      code: "3001",
      name: "يوسف سعيد",
      phone: "01299887755",
      product: "ماوس Logitech",
      price: "150",
      status: "واتساب",
      city: "المنصورة",
      notes: "في انتظار الرد",
    },
    {
      code: "3002",
      name: "علي حسن",
      phone: "01011223344",
      product: "كيبورد ميكانيكي",
      price: "400",
      status: "واتساب",
      city: "الإسكندرية",
      notes: "اقترح تخفيض",
    },

    // إعادة اتصال
    {
      code: "4001",
      name: "سارة أحمد",
      phone: "01177889900",
      product: "ساعة Apple Watch",
      price: "275",
      status: "إعادة اتصال",
      city: "الجيزة",
      notes: "اتصل بعد العصر",
    },
    {
      code: "4002",
      name: "مروان سمير",
      phone: "01522334455",
      product: "سماعة AirPods",
      price: "350",
      status: "إعادة اتصال",
      city: "القاهرة",
      notes: "لا يرد",
    },

    // وقف التشغيل
    {
      code: "5001",
      name: "داليا عادل",
      phone: "01077889900",
      product: "كيس كمبيوتر",
      price: "210",
      status: "وقف التشغيل",
      city: "بورسعيد",
      notes: "رقم غير مستخدم",
    },
    {
      code: "5002",
      name: "كريم علي",
      phone: "01255443322",
      product: "بروجيكتور",
      price: "290",
      status: "وقف التشغيل",
      city: "القاهرة",
      notes: "مغلق نهائياً",
    },

    // لم يتم المحاولة امس
    {
      code: "6001",
      name: "هدى محمود",
      phone: "01144556677",
      product: "هارد SSD",
      price: "310",
      status: "لم يتم المحاولة امس",
      city: "الفيوم",
      notes: "لم يتصل أحد",
    },
    {
      code: "6002",
      name: "ياسين محمد",
      phone: "01588997766",
      product: "كارت شاشة NVIDIA",
      price: "260",
      status: "لم يتم المحاولة امس",
      city: "الإسكندرية",
      notes: "مطلوب تواصل اليوم",
    },

    // طلبات تم التأكيد
    {
      code: "7001",
      name: "نادر حسن",
      phone: "01044556677",
      product: "لاب توب HP",
      price: "500",
      status: "طلبات  تم التأكيد",
      city: "القاهرة",
      notes: "تم الدفع",
    },
    {
      code: "7002",
      name: "مها عبد الله",
      phone: "01222334455",
      product: "تليفزيون Samsung",
      price: "430",
      status: "طلبات  تم التأكيد",
      city: "الجيزة",
      notes: "تسليم غداً",
    },

    // طلبات تم التحضير
    {
      code: "8001",
      name: "رامي طارق",
      phone: "01199887755",
      product: "غسالة LG",
      price: "380",
      status: "طلبات تم التحضير",
      city: "المنوفية",
      notes: "جاهز للشحن",
    },
    {
      code: "8002",
      name: "نور محمود",
      phone: "01066554433",
      product: "ثلاجة Toshiba",
      price: "270",
      status: "طلبات تم التحضير",
      city: "القاهرة",
      notes: "بانتظار شركة الشحن",
    },

    // طلبات في الشحن
    {
      code: "9001",
      name: "سامي حسين",
      phone: "01533221100",
      product: "مكيف شارب",
      price: "600",
      status: "طلبات في الشحن",
      city: "الإسكندرية",
      notes: "في الطريق",
    },
    {
      code: "9002",
      name: "جنى علي",
      phone: "01055667788",
      product: "مروحة توشيبا",
      price: "720",
      status: "طلبات في الشحن",
      city: "القاهرة",
      notes: "سيصل خلال يومين",
    },
    {
      code: "9003",
      name: "إسراء مصطفى",
      phone: "01277889900",
      product: "دفاية كهرباء",
      price: "450",
      status: "طلبات في الشحن",
      city: "بورسعيد",
      notes: "تم تأكيد العنوان",
    },
  ];

  // state
  const [filters, setFilters] = useState({
    product: "",
    code: "",
    phone: "",
    city: "",
    date: "",
  });

  // فلترة

  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // فلترة
  // فلترة (tabs + filters مع بعض)
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

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const toggleRow = (code: string) => {
    setSelectedRows((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="bg-white rounded-lg shadow p-6">
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setActiveTab("");
                      setPage(1);
                    }}
                    className="px-4 py-2 rounded-md border border-gray-400 text-gray-600 hover:bg-gray-100 transition"
                  >
                    الكل
                  </motion.button>
                  {tabs.map((t, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setActiveTab(t);
                        setPage(1);
                      }}
                      className={`px-4 py-2 rounded-md border transition ${
                        activeTab === t
                          ? "bg-purple-600 text-white border-purple-600"
                          : "border-purple-500 text-purple-600 hover:bg-purple-100"
                      }`}
                    >
                      {t}
                    </motion.button>
                  ))}
                </div>
                {/* ✅ Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {/* Product */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="flex items-center justify-between w-44 px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50">
                        {filters.product || " بالمنتج"}
                        <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content className="min-w-[180px] rounded-md border bg-white shadow-lg p-1">
                      {Array.from(new Set(data.map((r) => r.product))).map(
                        (p) => (
                          <DropdownMenu.Item
                            key={p}
                            onClick={() =>
                              setFilters({ ...filters, product: p })
                            }
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          >
                            {p}
                          </DropdownMenu.Item>
                        )
                      )}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>

                  {/* Code */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="flex items-center justify-between w-44 px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50">
                        {filters.code || " بالكود"}
                        <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content className="min-w-[180px] rounded-md border bg-white shadow-lg p-1">
                      {Array.from(new Set(data.map((r) => r.code))).map((c) => (
                        <DropdownMenu.Item
                          key={c}
                          onClick={() => setFilters({ ...filters, code: c })}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                        >
                          {c}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>

                  {/* Phone */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="flex items-center justify-between w-52 px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50">
                        {filters.phone || " برقم العميل"}
                        <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content className="min-w-[180px] rounded-md border bg-white shadow-lg p-1">
                      {Array.from(new Set(data.map((r) => r.phone))).map(
                        (ph) => (
                          <DropdownMenu.Item
                            key={ph}
                            onClick={() =>
                              setFilters({ ...filters, phone: ph })
                            }
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          >
                            {ph}
                          </DropdownMenu.Item>
                        )
                      )}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>

                  {/* City */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="flex items-center justify-between w-44 px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50">
                        {filters.city || " بالعنوان"}
                        <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content className="min-w-[180px] rounded-md border bg-white shadow-lg p-1">
                      {Array.from(new Set(data.map((r) => r.city))).map(
                        (city) => (
                          <DropdownMenu.Item
                            key={city}
                            onClick={() => setFilters({ ...filters, city })}
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          >
                            {city}
                          </DropdownMenu.Item>
                        )
                      )}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>

                  {/* Date */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="flex items-center justify-between w-44 px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50">
                        {filters.date || " بالتاريخ"}
                        <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content className="min-w-[180px] rounded-md border bg-white shadow-lg p-1">
                      {["2025-09-20", "2025-09-21", "2025-09-22"].map((d) => (
                        <DropdownMenu.Item
                          key={d}
                          onClick={() => setFilters({ ...filters, date: d })}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                        >
                          {d}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>

                  {/* Reset Filters */}
                  <button
                    onClick={() =>
                      setFilters({
                        product: "",
                        code: "",
                        phone: "",
                        city: "",
                        date: "",
                      })
                    }
                    className="px-4 py-2 rounded-md border border-gray-400 text-gray-600 hover:bg-gray-100"
                  >
                    مسح الفلاتر
                  </button>
                </div>

                {/* Table */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="overflow-x-auto shadow-md rounded-lg"
                >
                  <table className="w-full border text-center border-gray-200 rounded-md">
                    <thead className="bg-purple-200 text-purple-800">
                      <tr className="text-right">
                        <th className="px-3 py-2 border">
                          <input
                            type="checkbox"
                            checked={
                              paginatedData.length > 0 &&
                              paginatedData.every((row) =>
                                selectedRows.includes(row.code)
                              )
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRows([
                                  ...new Set([
                                    ...selectedRows,
                                    ...paginatedData.map((r) => r.code),
                                  ]),
                                ]);
                              } else {
                                setSelectedRows(
                                  selectedRows.filter(
                                    (code) =>
                                      !paginatedData
                                        .map((r) => r.code)
                                        .includes(code)
                                  )
                                );
                              }
                            }}
                          />
                        </th>
                        <th className="px-3 py-2 border">كود المنتج</th>
                        <th className="px-3 py-2 border">اسم العميل</th>
                        <th className="px-3 py-2 border">رقم العميل</th>
                        <th className="px-3 py-2 border">اسم المنتج</th>
                        <th className="px-3 py-2 border">السعر</th>
                        <th className="px-3 py-2 border">الحالة</th>
                        <th className="px-3 py-2 border">العنوان</th>
                        <th className="px-3 py-2 border">الملاحظات</th>
                        <th className="px-3 py-2 border" colSpan={2}>
                          
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedData.map((row, i) => (
                        <motion.tr
                          key={row.code}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-3 py-2 border text-center">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(row.code)}
                              onChange={() => toggleRow(row.code)}
                            />
                          </td>
                          <td className="px-3 py-2 border">{row.code}</td>
                          <td className="px-3 py-2 border">{row.name}</td>
                          <td className="px-3 py-2 border">{row.phone}</td>
                          <td className="px-3 py-2 border">{row.product}</td>
                          <td className="px-3 py-2 border">{row.price}</td>
                          <td className="px-3 py-2 border">{row.status}</td>
                          <td className="px-3 py-2 border">{row.city}</td>
                          <td className="px-3 py-2 border">{row.notes}</td>

                          {/* عمودين إضافيين للأكشن (تعديل / حذف مثلا) */}

                          {/* Two dropdowns in separate columns */}
                          {/* Dropdown 1 */}
                          <td className="px-3 py-2  text-center">
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild>
                                <button className="flex items-center justify-between w-28 px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50">
                                  اختيار 1
                                  <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
                                </button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Content
                                align="end"
                                sideOffset={5}
                                className="min-w-[100px] rounded-md border bg-white shadow-lg p-1"
                              >
                                <DropdownMenu.Item className="px-2 py-1 hover:bg-gray-100">
                                  1
                                </DropdownMenu.Item>
                                <DropdownMenu.Item className="px-2 py-1 hover:bg-gray-100">
                                  2
                                </DropdownMenu.Item>
                                <DropdownMenu.Item className="px-2 py-1 hover:bg-gray-100">
                                  3
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Root>
                          </td>

                          {/* Dropdown 2 */}
                          <td className="px-3 py-2  text-center">
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild>
                                <button className="flex items-center justify-between w-28 px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50">
                                  اختيار 2
                                  <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
                                </button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Content
                                align="end"
                                sideOffset={5}
                                className="min-w-[100px] rounded-md border bg-white shadow-lg p-1"
                              >
                                <DropdownMenu.Item className="px-2 py-1 hover:bg-gray-100">
                                  1
                                </DropdownMenu.Item>
                                <DropdownMenu.Item className="px-2 py-1 hover:bg-gray-100">
                                  2
                                </DropdownMenu.Item>
                                <DropdownMenu.Item className="px-2 py-1 hover:bg-gray-100">
                                  3
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Root>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
                <div className="flex justify-between items-center mt-6">
                  <div className="flex justify-center mt-4 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-3 py-1 border rounded ${
                            p === page
                              ? "bg-purple-600 text-white border-purple-600"
                              : "border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>

                  {/* Footer buttons (تظهر فقط لو في صفوف مختارة) */}
                  {selectedRows.length > 0 && (
                    <>
                      {/* Footer buttons */}
                      <div className="flex justify-center gap-4 mt-6">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition"
                        >
                          مشاركة شيت اكسل
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 rounded-md border border-purple-600 text-purple-600 hover:bg-purple-100 transition"
                        >
                          مشاركة واتساب
                        </motion.button>
                      </div>

                      {/* Counter on the left */}
                      <div className="flex justify-end mt-4">
                        <span className="font-bold text-md text-gray-800">
                          تم تحديد {selectedRows.length} منتج
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Pagination */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
