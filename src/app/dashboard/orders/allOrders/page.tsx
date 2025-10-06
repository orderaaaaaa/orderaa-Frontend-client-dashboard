'use client';

import { AuthGuard } from '@/components/auth-guard';
import { DashboardLayout } from '@/components/dashboard-layout';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Package, Banknote, MapPin, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import GlassButton from '@/components/ui/glassBtn';
import Image from 'next/image';

import Vector from '@/../public/Icons/Vector.svg';
import Vector2 from '@/../public/Icons/Vector2.svg';
import Vector3 from '@/../public/Icons/Vector3.svg';
import Vector4 from '@/../public/Icons/Vector4.svg';
import Vector5 from '@/../public/Icons/Vector5.svg';
import Vector6 from '@/../public/Icons/Vector6.svg';
import Vector7 from '@/../public/Icons/Vector7.svg';
import Vector8 from '@/../public/Icons/Vector8.svg';
import Vector9 from '@/../public/Icons/Vector9.svg';
import Vector10 from '@/../public/Icons/Vector10.svg';
import IdIcon from '@/../public/Icons/id.svg';
import filterIcon from '@/../public/Icons/filterIcon.svg';

/* ================================
   SearchableSelect (robust dropdown)
   ================================ */
function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'ابحث...',
  widthClass = 'w-56',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  widthClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = React.useMemo(
    () => options.filter((o) => o.toLowerCase().includes(q.toLowerCase())),
    [options, q]
  );

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === 'Escape') {
        setOpen(false);
        setActiveIdx(-1);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setActiveIdx(-1);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const commitSelect = (val: string) => {
    onChange(val);
    setQ('');
    setOpen(false);
    setActiveIdx(-1);
  };

  return (
    <div className={`flex flex-col gap-1 relative ${widthClass}`} ref={ref}>
      <label className="text-xs text-gray-600">{label}</label>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-2 rounded border border-gray-300 bg-white truncate flex items-center justify-between"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className={`text-right ${value ? 'text-gray-900' : 'text-gray-500'}`}
        >
          {value || `اختر ${label}`}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.084l3.71-3.854a.75.75 0 1 1 1.08 1.04l-4.24 4.4a.75.75 0 0 1-1.08 0l-4.24-4.4a.75.75 0 0 1 .02-1.06z" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className={`absolute z-20 mt-1 ${widthClass} rounded-lg border bg-white shadow-lg`}
          >
            <div className="p-2 border-b">
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActiveIdx(-1);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActiveIdx((i) =>
                      Math.min(i + 1, Math.max(filtered.length - 1, 0))
                    );
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveIdx((i) => Math.max(i - 1, -1));
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (activeIdx >= 0 && filtered[activeIdx]) {
                      commitSelect(filtered[activeIdx]);
                    } else if (filtered.length === 1) {
                      commitSelect(filtered[0]);
                    }
                  }
                }}
                placeholder={placeholder}
                className="w-full px-2 py-1 rounded border border-gray-200 outline-none"
              />
            </div>

            <div role="listbox" className="max-h-56 overflow-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  لا توجد نتائج
                </div>
              ) : (
                filtered.map((opt, idx) => {
                  const active = idx === activeIdx;
                  const selected = opt === value;
                  return (
                    <div
                      key={opt}
                      role="option"
                      aria-selected={selected}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onMouseLeave={() => setActiveIdx(-1)}
                      onClick={() => commitSelect(opt)}
                      className={`px-3 py-2 cursor-pointer ${
                        active ? 'bg-gray-100' : selected ? 'bg-gray-50' : ''
                      } hover:bg-gray-100`}
                    >
                      {opt}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================
   Types
   ================================ */
interface OrderProduct {
  name: string;
  price: number; // math-friendly
  qty?: number;
}

interface Row {
  code: string;
  name: string;
  phone: string;
  products: OrderProduct[];
  status: string;
  city: string;
  area: string;
  notes: string;
}

/* ================================
   Simple Modal (no libs)
   ================================ */
function SimpleModal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-xl',
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={(e) => {
          // close only if backdrop clicked
          if (e.target === e.currentTarget) onClose();
        }}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative z-[101] w-[92vw] ${maxWidth} rounded-2xl bg-white shadow-xl p-4`}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm border hover:bg-gray-50"
          >
            إغلاق
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ================================
   Component
   ================================ */
export default function AllOrders() {
  const tabs: { label: string; icon: any }[] = [
    { label: 'طلبات جديدة', icon: Vector3 },
    { label: 'تم المحاولة', icon: Vector2 },
    { label: 'في انتظار الدفع', icon: Vector2 },
    { label: 'واتساب', icon: Vector4 },
    { label: 'تأجيلات', icon: Vector },
    { label: 'إعادة اتصال', icon: Vector5 },
    { label: 'وقف التشغيل', icon: Vector },
    { label: 'تم التأكيد', icon: Vector8 },
    { label: 'تم التحضير', icon: Vector9 },
    { label: ' في الشحن', icon: Vector7 },
    { label: 'تقارير', icon: Vector6 },
    { label: ' طلبات غير مكتمله', icon: Vector10 },
    { label: ' طلبات مستعجلة', icon: Vector10 },
    { label: 'تم الالغاء', icon: Vector10 },
  ];

  const getStatusIcon = (status: string) =>
    tabs.find((t) => t.label === status)?.icon ?? Vector;

  /* ================================
     Sample data with products[]
     ================================ */
  const data: Row[] = [
    {
      code: '1001',
      name: 'محمد بدر',
      phone: '01112223355',
      products: [
        { name: 'لاب توب Dell', price: 200 },
        { name: 'ماوس Logitech', price: 25 },
        { name: 'كيبورد ميكانيكي', price: 175 },
      ],
      status: 'طلبات جديدة',
      city: 'القاهرة',
      area: 'مدينة نصر',
      notes: 'اتصل به غداً',
    },
    {
      code: '1002',
      name: 'أحمد حسن',
      phone: '01099887766',
      products: [
        { name: 'موبايل Samsung', price: 250 },
        { name: 'سماعات JBL', price: 30 },
      ],
      status: 'طلبات جديدة',
      city: 'الجيزة',
      area: 'مدينة نصر',
      notes: 'انتظار تأكيد',
    },
    {
      code: '1003',
      name: 'خالد علي',
      phone: '0123456789',
      products: [{ name: 'سماعات JBL', price: 300 }],
      status: 'طلبات جديدة',
      city: 'الإسكندرية',
      area: 'مدينة نصر',
      notes: 'تم إرسال عرض',
    },
    {
      code: '2001',
      name: 'محمود سامي',
      phone: '01544556677',
      products: [{ name: 'طابعة HP', price: 180 }],
      status: 'تم المحاولة',
      city: 'طنطا',
      area: 'مدينة نصر',
      notes: 'مغلق',
    },
    {
      code: '2002',
      name: 'فاطمة محمد',
      phone: '01033445566',
      products: [{ name: 'شاشة LG', price: 220 }],
      status: 'تم المحاولة',
      city: 'القاهرة',
      area: 'مدينة نصر',
      notes: 'سيعاود الاتصال',
    },
    {
      code: '3001',
      name: 'يوسف سعيد',
      phone: '01299887755',
      products: [{ name: 'ماوس Logitech', price: 150 }],
      status: 'واتساب',
      city: 'المنصورة',
      area: 'مدينة نصر',
      notes: 'في انتظار الرد',
    },
    {
      code: '3002',
      name: 'علي حسن',
      phone: '01011223344',
      products: [{ name: 'كيبورد ميكانيكي', price: 400 }],
      status: 'واتساب',
      city: 'الإسكندرية',
      area: 'مدينة نصر',
      notes: 'اقترح تخفيض',
    },
    {
      code: '4001',
      name: 'سارة أحمد',
      phone: '01177889900',
      products: [{ name: 'ساعة Apple Watch', price: 275 }],
      status: 'إعادة اتصال',
      city: 'الجيزة',
      area: 'مدينة نصر',
      notes: 'اتصل بعد العصر',
    },
    {
      code: '4002',
      name: 'مروان سمير',
      phone: '01522334455',
      products: [{ name: 'سماعة AirPods', price: 350 }],
      status: 'إعادة اتصال',
      city: 'القاهرة',
      area: 'مدينة نصر',
      notes: 'لا يرد',
    },
    {
      code: '5001',
      name: 'داليا عادل',
      phone: '01077889900',
      products: [{ name: 'كيس كمبيوتر', price: 210 }],
      status: 'وقف التشغيل',
      city: 'بورسعيد',
      area: 'مدينة نصر',
      notes: 'رقم غير مستخدم',
    },
    {
      code: '5002',
      name: 'كريم علي',
      phone: '01255443322',
      products: [{ name: 'بروجيكتور', price: 290 }],
      status: 'وقف التشغيل',
      city: 'القاهرة',
      area: 'مدينة نصر',
      notes: 'مغلق نهائياً',
    },
    {
      code: '6001',
      name: 'هدى محمود',
      phone: '01144556677',
      products: [{ name: 'هارد SSD', price: 310 }],
      status: 'لم يتم المحاولة امس',
      city: 'الفيوم',
      area: 'مدينة نصر',
      notes: 'لم يتصل أحد',
    },
    {
      code: '6002',
      name: 'ياسين محمد',
      phone: '01588997766',
      products: [{ name: 'كارت شاشة NVIDIA', price: 260 }],
      status: 'لم يتم المحاولة امس',
      city: 'الإسكندرية',
      area: 'مدينة نصر',
      notes: 'مطلوب تواصل اليوم',
    },
    {
      code: '7001',
      name: 'نادر حسن',
      phone: '01044556677',
      products: [{ name: 'لاب توب HP', price: 500 }],
      status: 'طلبات  تم التأكيد',
      city: 'القاهرة',
      area: 'مدينة نصر',
      notes: 'تم الدفع',
    },
    {
      code: '7002',
      name: 'مها عبد الله',
      phone: '01222334455',
      products: [{ name: 'تليفزيون Samsung', price: 430 }],
      status: 'طلبات  تم التأكيد',
      city: 'الجيزة',
      area: 'مدينة نصر',
      notes: 'تسليم غداً',
    },
    {
      code: '8001',
      name: 'رامي طارق',
      phone: '01199887755',
      products: [{ name: 'غسالة LG', price: 380 }],
      status: 'طلبات تم التحضير',
      city: 'المنوفية',
      area: 'مدينة نصر',
      notes: 'جاهز للشحن',
    },
    {
      code: '8002',
      name: 'نور محمود',
      phone: '01066554433',
      products: [{ name: 'ثلاجة Toshiba', price: 270 }],
      status: 'طلبات تم التحضير',
      city: 'القاهرة',
      area: 'مدينة نصر',
      notes: 'بانتظار شركة الشحن',
    },
    {
      code: '9001',
      name: 'سامي حسين',
      phone: '01533221100',
      products: [{ name: 'مكيف شارب', price: 600 }],
      status: 'طلبات في الشحن',
      city: 'الإسكندرية',
      area: 'مدينة نصر',
      notes: 'في الطريق',
    },
    {
      code: '9002',
      name: 'جنى علي',
      phone: '01055667788',
      products: [{ name: 'مروحة توشيبا', price: 720 }],
      status: 'طلبات في الشحن',
      city: 'القاهرة',
      area: 'مدينة نصر',
      notes: 'سيصل خلال يومين',
    },
    {
      code: '9003',
      name: 'إسراء مصطفى',
      phone: '01277889900',
      products: [{ name: 'دفاية كهرباء', price: 450 }],
      status: 'طلبات في الشحن',
      city: 'بورسعيد',
      area: 'مدينة نصر',
      notes: 'تم تأكيد العنوان',
    },
  ];

  /* ================================
     Options
     ================================ */
  const productOptions = Array.from(
    new Set(data.flatMap((d) => d.products.map((p) => p.name)))
  ).sort();
  const governorateOptions = Array.from(
    new Set(data.map((d) => d.city))
  ).sort();
  const sizeColorOptions = ['صغير - أسود', 'متوسط - أبيض', 'كبير - أزرق']; // placeholder
  const areaOptions = ['مدينة نصر', 'المعادي', 'الدقي', 'الزقازيق', 'طنطا']; // sample

  /* ================================
     Filters / State
     ================================ */
  const [filters, setFilters] = useState({
    productName: '',
    sizeColor: '',
    governorate: '',
    area: '',
    shipmentCode: '',
    customerName: '',
    phone: '',
    address: '',
  });

  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [showFilters, setShowFilters] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOrder, setDialogOrder] = useState<Row | null>(null);
  const openOrderDialog = (order: Row) => {
    setDialogOrder(order);
    setDialogOpen(true);
  };

  /* ================================
     Filtering
     ================================ */
  const filteredData = data.filter((row) => {
    const matchStatusTab = !activeTab || row.status === activeTab;

    const matchProduct =
      !filters.productName ||
      row.products.some((p) => p.name === filters.productName);

    const matchGov = !filters.governorate || row.city === filters.governorate;
    const matchSizeColor = !filters.sizeColor || true; // placeholder
    const matchArea = !filters.area || row.area === filters.area;

    const matchShipment =
      !filters.shipmentCode || row.code.includes(filters.shipmentCode);

    const matchCustomer =
      !filters.customerName || row.name.includes(filters.customerName);

    const matchPhone = !filters.phone || row.phone.includes(filters.phone);

    const matchAddress =
      !filters.address ||
      row.notes.includes(filters.address) ||
      row.city.includes(filters.address) ||
      row.area.includes(filters.address);

    return (
      matchStatusTab &&
      matchProduct &&
      matchGov &&
      matchSizeColor &&
      matchArea &&
      matchShipment &&
      matchCustomer &&
      matchPhone &&
      matchAddress
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const countForStatus = (status: string) =>
    data.filter((row) => row.status === status).length;

  const toggleRow = (code: string) => {
    setSelectedRows((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const formatCurrency = (n: number) => n.toLocaleString();

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="bg-white rounded-lg shadow p-6 ">
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
                  <GlassButton
                    onClick={() => {
                      setActiveTab('');
                      setPage(1);
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Image
                        src={Vector}
                        className="group-hover:invert group-hover:brightness-0 group-hover:contrast-200 group-hover:saturate-0"
                        alt="all-orders"
                        width={16}
                        height={16}
                      />
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
                        <Image
                          src={t.icon}
                          className="group-hover:invert group-hover:brightness-0 group-hover:contrast-200 group-hover:saturate-0"
                          alt="status"
                          width={16}
                          height={16}
                        />
                        <span className="inline-flex items-center gap-1">
                          <span className="px-1">{t.label}</span>
                          <span
                            className={`inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-[11px] ${
                              activeTab === t.label
                                ? 'bg-[#ffffff] text-[#5D24E1]'
                                : 'bg-[#5D24E1] text-white'
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
                  <button
                    onClick={() => setShowFilters((v) => !v)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-50 transition text-gray-800"
                  >
                    <span className="inline-flex items-center gap-1">
                      <Image
                        src={filterIcon}
                        className="group-hover:invert group-hover:brightness-0 group-hover:contrast-200 group-hover:saturate-0"
                        alt="status"
                        width={16}
                        height={16}
                      />
                    </span>
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-wrap gap-4 mb-6 rounded-xl border border-white/50 bg-white/50 backdrop-blur-md shadow-sm p-4"
                    >
                      {/* 4 searchable dropdowns */}
                      <SearchableSelect
                        label="اسم المنتج"
                        value={filters.productName}
                        onChange={(v) =>
                          setFilters({ ...filters, productName: v })
                        }
                        options={productOptions}
                        placeholder="ابحث عن منتج"
                        widthClass="w-56"
                      />

                      <SearchableSelect
                        label="المقاس و اللون"
                        value={filters.sizeColor}
                        onChange={(v) =>
                          setFilters({ ...filters, sizeColor: v })
                        }
                        options={sizeColorOptions}
                        placeholder="ابحث عن مقاس/لون"
                        widthClass="w-56"
                      />

                      <SearchableSelect
                        label="المحافظة"
                        value={filters.governorate}
                        onChange={(v) =>
                          setFilters({ ...filters, governorate: v })
                        }
                        options={governorateOptions}
                        placeholder="ابحث عن محافظة"
                        widthClass="w-56"
                      />

                      <SearchableSelect
                        label="المنطقة"
                        value={filters.area}
                        onChange={(v) => setFilters({ ...filters, area: v })}
                        options={areaOptions}
                        placeholder="ابحث عن منطقة"
                        widthClass="w-56"
                      />

                      {/* باقي الفلاتر */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">
                          كود الشحنه
                        </label>
                        <input
                          type="text"
                          value={filters.shipmentCode}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              shipmentCode: e.target.value,
                            })
                          }
                          placeholder="أدخل كود الشحنة"
                          className="w-56 px-3 py-2 rounded border border-gray-300 bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">
                          اسم العميل
                        </label>
                        <input
                          type="text"
                          value={filters.customerName}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              customerName: e.target.value,
                            })
                          }
                          placeholder="اكتب اسم العميل"
                          className="w-56 px-3 py-2 rounded border border-gray-300 bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">
                          رقم التليفون
                        </label>
                        <input
                          type="text"
                          value={filters.phone}
                          onChange={(e) =>
                            setFilters({ ...filters, phone: e.target.value })
                          }
                          placeholder="اكتب رقم الهاتف"
                          className="w-56 px-3 py-2 rounded border border-gray-300 bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">العنوان</label>
                        <input
                          type="text"
                          value={filters.address}
                          onChange={(e) =>
                            setFilters({ ...filters, address: e.target.value })
                          }
                          placeholder="اكتب العنوان"
                          className="w-64 px-3 py-2 rounded border border-gray-300 bg-white"
                        />
                      </div>

                      {/* Clear Filters */}
                      <button
                        onClick={() =>
                          setFilters({
                            productName: '',
                            sizeColor: '',
                            governorate: '',
                            area: '',
                            shipmentCode: '',
                            customerName: '',
                            phone: '',
                            address: '',
                          })
                        }
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
                      className="accent-[#5D24E1]"
                      checked={
                        paginatedData.length > 0 &&
                        paginatedData.every((r) =>
                          selectedRows.includes(r.code)
                        )
                      }
                      onChange={(e) => {
                        if (e.target.checked)
                          setSelectedRows([
                            ...new Set([
                              ...selectedRows,
                              ...paginatedData.map((r) => r.code),
                            ]),
                          ]);
                        else
                          setSelectedRows(
                            selectedRows.filter(
                              (code) =>
                                !paginatedData.map((r) => r.code).includes(code)
                            )
                          );
                      }}
                    />
                    <span className="text-sm text-gray-600">
                      تحديد الكل في الصفحة
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
                >
                  {paginatedData.map((row, i) => {
                    const StatusIcon = getStatusIcon(row.status);
                    const first = row.products[0];
                    const second = row.products[1];
                    const extraCount = Math.max(0, row.products.length - 2);
                    const total = row.products.reduce(
                      (s, p) => s + p.price * (p.qty ?? 1),
                      0
                    );

                    return (
                      <motion.div
                        key={row.code}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <div className="origin-top-right scale-[0.9] w-[111.111%] font-bold">
                          <Card
                            className="w-full bg-gradient-to-b from-[#FCFAFD] to-[#EADBFF] rounded-[20px] shadow-lg"
                            style={{
                              border: '1px solid rgba(93, 36, 225, 0.28)',
                            }}
                          >
                            <CardContent className="text-sm leading-[1.1]">
                              <div dir="rtl" className="space-y-2 h-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 w-full">
                                  {/* الكود */}
                                  <div className="flex items-center gap-1.5">
                                    <Image
                                      src={IdIcon}
                                      alt="ID"
                                      width={16}
                                      height={16}
                                      className="shrink-0 self-center"
                                    />
                                    <span className="text-gray-600 leading-none">
                                      الكود
                                    </span>
                                    <span className="font-semibold leading-none">
                                      {row.code}
                                    </span>
                                  </div>

                                  {/* الميعاد + checkbox */}
                                  <div className="flex items-center gap-1.5 justify-center md:justify-center">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[12px] text-gray-600 leading-none">
                                        منذ 3 أيام و 15 ساعة
                                      </span>
                                      <input
                                        type="checkbox"
                                        checked={selectedRows.includes(
                                          row.code
                                        )}
                                        onChange={() => toggleRow(row.code)}
                                        className="accent-[#5D24E1]"
                                      />
                                    </div>
                                  </div>

                                  {/* الاسم */}
                                  <div className="flex items-center gap-1.5">
                                    <User className="w-4 h-4 text-black self-center" />
                                    <span className="font-medium leading-none">
                                      {row.name}
                                    </span>
                                  </div>

                                  {/* الحالة */}
                                  <div className="flex items-center gap-1.5 justify-center">
                                    <button
                                      type="button"
                                      style={{
                                        background:
                                          'linear-gradient(114.13deg, #FFFFFF 8.63%, #DCD1F5 54.17%, #FFFFFF 99.72%)',
                                      }}
                                      className="w-[132px] h-[30px] inline-flex items-center justify-center gap-1 rounded-[999px] border border-[#5D24E147] text-xs font-medium"
                                    >
                                      <Image
                                        src={StatusIcon}
                                        alt="status"
                                        width={16}
                                        height={16}
                                        className="shrink-0 self-center"
                                      />
                                      <span className="text-[#5D24E1] leading-none">
                                        {row.status}
                                      </span>
                                    </button>
                                  </div>

                                  {/* الهاتف */}
                                  <div className="flex items-center gap-1.5 md:col-span-2">
                                    <Phone className="w-4 h-4 text-black self-center" />
                                    <span className="font-medium leading-none ltr:text-left rtl:text-right">
                                      {row.phone}
                                    </span>
                                  </div>

                                  {/* المدينة + المنطقة */}
                                  <div className="flex items-center gap-1.5 md:col-span-2">
                                    <MapPin className="w-4 h-4 text-black self-center" />
                                    <span className="font-medium leading-none">
                                      {row.city} - {row.area}
                                    </span>
                                  </div>

                                  {/* المنتج الأول */}
                                  {first && (
                                    <div className="flex items-center gap-1.5">
                                      <Package className="w-4 h-4 text-black self-center" />
                                      <span className="font-medium leading-none">
                                        {first.name}
                                      </span>
                                      <span className="font-medium leading-none ltr:ml-auto rtl:mr-auto">
                                        {formatCurrency(first.price)}
                                      </span>
                                    </div>
                                  )}

                                  {/* المنتج الثاني + +N */}
                                  {second && (
                                    <div className="flex items-center gap-1.5">
                                      <Package className="w-4 h-4 text-black self-center" />
                                      <span className="font-medium leading-none">
                                        {second.name}
                                      </span>
                                      <span className="font-medium leading-none ltr:ml-auto rtl:mr-auto">
                                        {formatCurrency(second.price)}
                                      </span>

                                      {extraCount > 0 && (
                                        <button
                                          onClick={() => openOrderDialog(row)}
                                          className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border border-[#5D24E1] text-[#5D24E1] hover:bg-[#5D24E1] hover:text-white transition"
                                          title="عرض باقي المنتجات"
                                          type="button"
                                        >
                                          <Plus className="w-3 h-3" />+
                                          {extraCount}
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  {/* الإجمالي */}
                                  <div className="flex items-center gap-1.5 md:col-span-2 justify-center">
                                    <Banknote className="w-4 h-4 text-black self-baseline-last" />
                                    <span className="font-medium leading-none">
                                      الإجمالي: {formatCurrency(total)}
                                    </span>
                                  </div>

                                  {/* المحاولات */}
                                  <div className="flex items-center gap-1.5 justify-center md:col-span-2">
                                    <Image
                                      src={Vector2}
                                      alt="tries"
                                      width={16}
                                      height={16}
                                      className="shrink-0 brightness-0 self-center"
                                    />
                                    <span className="font-medium leading-none">
                                      المحاولات : 15
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Pagination + selected counter */}
                <div className="flex justify-between items-center mt-6">
                  <div className="flex justify-center mt-4 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-3 py-1 border rounded ${
                            p === page
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>

                  {selectedRows.length > 0 && (
                    <>
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

                      <div className="flex justify-end mt-4">
                        <span className="font-bold text-md text-gray-800">
                          تم تحديد {selectedRows.length} منتج
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Simple Modal: all order products */}
        <SimpleModal
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={<>تفاصيل الطلب #{dialogOrder?.code}</>}
          maxWidth="max-w-2xl"
        >
          {dialogOrder && (
            <div dir="rtl" className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">الاسم:</span>{' '}
                  {dialogOrder.name}
                </div>
                <div>
                  <span className="text-gray-600">الهاتف:</span>{' '}
                  {dialogOrder.phone}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">العنوان:</span>{' '}
                  {dialogOrder.city} - {dialogOrder.area}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">الحالة:</span>{' '}
                  {dialogOrder.status}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 text-xs bg-gray-50 px-3 py-2 font-medium">
                  <div className="col-span-7">المنتج</div>
                  <div className="col-span-2 text-center">الكمية</div>
                  <div className="col-span-3 text-left">السعر</div>
                </div>
                <div className="divide-y">
                  {dialogOrder.products.map((p, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 px-3 py-2 text-sm"
                    >
                      <div className="col-span-7">{p.name}</div>
                      <div className="col-span-2 text-center">{p.qty ?? 1}</div>
                      <div className="col-span-3 text-left">
                        {formatCurrency(p.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm font-semibold">
                <span>الإجمالي</span>
                <span>
                  {formatCurrency(
                    dialogOrder.products.reduce(
                      (s, p) => s + p.price * (p.qty ?? 1),
                      0
                    )
                  )}
                </span>
              </div>
            </div>
          )}
        </SimpleModal>
      </DashboardLayout>
    </AuthGuard>
  );
}
