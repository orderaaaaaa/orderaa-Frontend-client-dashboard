"use client"

import { useEffect, useRef, useState, type ComponentType } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import localFont from "next/font/local"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Lock, Eye, EyeOff, Building2, Briefcase, ChevronsUpDown, Check, MapPin, Map
} from "lucide-react"
import { Cairo } from "next/font/google"
import sideImage from "@/public/premium_photo-1681488262364-8aeb1b6aac56.avif"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
})

// خط العنوان (لو عندك ملف Bold منفصل ضيفه لاحقًا)
const welcomeBack = localFont({
  src: "../fonts/WelcomeBack-Regular.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  fallback: ["Cairo", "system-ui", "sans-serif"],
})

type ComboProps = {
  value: string
  onChange: (v: string) => void
  options: string[]              // لو فيها "أخرى" هتفتح إدخال مخصص
  placeholder?: string
  icon?: ComponentType<{ className?: string }>
}

/** Combobox قابل للبحث + دعم "أخرى" بإدخال داخل القائمة + أيقونة قابلة للتغيير */
function ActivityCombobox({ value, onChange, options, placeholder = "اختر", icon: Icon = Briefcase }: ComboProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [customMode, setCustomMode] = useState(false)
  const [customText, setCustomText] = useState("")
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const customInputRef = useRef<HTMLInputElement | null>(null)

  const hasOther = options.includes("أخرى")
  const filtered = options
    .filter((o) => o !== "أخرى") // نخلي "أخرى" ثابتة تحت
    .filter((o) => o.toLowerCase().includes(query.toLowerCase()))

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setCustomMode(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  // Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        setCustomMode(false)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    if (customMode) setTimeout(() => customInputRef.current?.focus(), 0)
  }, [customMode])

  const commitCustom = () => {
    const v = customText.trim()
    if (!v) return
    onChange(v)
    setOpen(false)
    setCustomMode(false)
    setCustomText("")
    setQuery("")
  }

  return (
    <div className="relative" dir="rtl" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="relative w-full border rounded-lg py-2.5 pr-10 pl-10 text-right focus:outline-none focus:ring-2 focus:ring-purple-500"
        aria-haspopup="listbox" aria-expanded={open}
      >
        {/* أيقونة البداية (يمين) */}
        <Icon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        {/* النص */}
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value || (customMode ? "أخرى (اكتب هنا)" : placeholder)}
        </span>
        {/* أيقونة النهاية (يسار) */}
        <ChevronsUpDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border bg-white shadow-lg" role="listbox" aria-label="combobox">
          {!customMode && (
            <>
              <div className="p-2 border-b">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث..."
                  className="w-full border rounded-md py-2 px-3 text-right focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <ul className="max-h-60 overflow-auto py-1">
                {filtered.length === 0 && (
                  <li className="px-3 py-2 text-sm text-gray-500 text-right">لا توجد نتائج</li>
                )}

                {filtered.map((opt) => (
                  <li
                    key={opt}
                    role="option"
                    aria-selected={value === opt}
                    onClick={() => { onChange(opt); setOpen(false); setQuery(""); }}
                    className="px-3 py-2 text-right cursor-pointer hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Check className={`h-4 w-4 ${value === opt ? "opacity-100" : "opacity-0"}`} />
                    <span className="flex-1">{opt}</span>
                  </li>
                ))}

                {hasOther && (
                  <li
                    key="__other"
                    role="option"
                    aria-selected={false}
                    onClick={() => { setCustomMode(true); setQuery(""); }}
                    className="px-3 py-2 text-right cursor-pointer hover:bg-gray-50 flex items-center gap-2 border-t"
                  >
                    <Check className="h-4 w-4 opacity-0" />
                    <span className="flex-1">أخرى</span>
                  </li>
                )}
              </ul>
            </>
          )}

          {customMode && (
            <div className="p-3 space-y-2 bg-gray-50">
              <div className="relative">
                <Icon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={customInputRef}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitCustom() } }}
                  placeholder="اكتب هنا..."
                  className="w-full pr-10 pl-3 py-2.5 border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={commitCustom}
                  disabled={!customText.trim()}
                  className="px-3 py-2 rounded-md bg-[#5D24E1] text-white disabled:opacity-60"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => { setCustomMode(false); setCustomText("") }}
                  className="px-3 py-2 rounded-md border"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SignUpPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [activity, setActivity] = useState("")
  const [governorate, setGovernorate] = useState("")   // المحافظة
  const [area, setArea] = useState("")                 // المنطقة
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // النشاطات (مع "أخرى")
  const activities = [
    "مطعم",
    "ملابس",
    "إلكترونيات",
    "مستلزمات منزلية",
    "صيدلية",
    "سوبر ماركت",
    "أخرى",
  ]

  // المحافظات (مع "أخرى")
  const governorates = [
    "القاهرة","الجيزة","الإسكندرية","الشرقية","الدقهلية","المنيا","أسيوط","أسوان",
    "الغربية","القليوبية","الفيوم","السويس","بورسعيد","الإسماعيلية","الأقصر","سوهاج",
    "قنا","دمياط","البحيرة","بني سويف","مطروح","البحر الأحمر","الوادي الجديد",
    "جنوب سيناء","شمال سيناء",
    "أخرى",
  ]

  // مناطق لكل محافظة (أمثلة شائعة فقط)
  const areasByGovernorate: Record<string, string[]> = {
    "القاهرة": ["مدينة نصر","مصر الجديدة","المعادي","التجمع الخامس","حلوان","الزمالك","شبرا","أخرى"],
    "الجيزة": ["الدقي","المهندسين","الهرم","6 أكتوبر","الشيخ زايد","العجوزة","أخرى"],
    "الإسكندرية": ["سموحة","سيدي جابر","العجمي","محرم بك","المندرة","أخرى"],
  }

  // خيارات المنطقة حسب المحافظة المختارة
  const areaOptions =
    governorate
      ? (areasByGovernorate[governorate] ?? ["أخرى"]) // لو محافظة مش موجودة، نوفّر "أخرى" عشان يكتب بنفسه
      : []

  const handleGovernorateChange = (val: string) => {
    setGovernorate(val)
    setArea("") // إعادة تعيين المنطقة عند تغيير المحافظة
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) return setError("من فضلك أدخل اسم التاجر أو الشركة.")
    if (!activity.trim()) return setError("من فضلك اختر النشاط أو اكتب نشاطك.")
    if (!governorate.trim()) return setError("من فضلك اختر المحافظة أو اكتبها.")
    if (!area.trim()) return setError("من فضلك اختر المنطقة أو اكتبها.")
    if (password.length < 8) return setError("كلمة المرور يجب أن تكون 8 حروف/أرقام على الأقل.")
    if (password !== confirmPassword) return setError("كلمتا المرور غير متطابقتين.")

    setIsLoading(true)
    try {
      localStorage.setItem(
        "signup_info",
        JSON.stringify({
          name,
          activity,
          governorate,
          area,
          createdAt: new Date().toISOString(),
        })
      )
      router.push("/") // العودة لتسجيل الدخول
    } catch {
      setError("حدث خطأ أثناء إنشاء الحساب. برجاء المحاولة لاحقًا.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`${cairo.className} min-h-screen flex items-center justify-center bg-gray-50 p-6`}>
      <div className="w-full max-w-5xl bg-white border rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left: Image */}
        <div className="relative hidden md:block">
          <Image src={sideImage} alt="Welcome" fill className="object-left" priority />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Right: Form */}
        <div className="p-8 md:p-12 flex items-center">
          <form dir="rtl" onSubmit={handleSubmit} className="w-full max-w-lg space-y-5 mx-auto">
            <div className="space-y-3">
              <Image className="mx-auto" src="/ordera.svg" alt="Ordera" width={250} height={109} priority />
              <h1 className={`${welcomeBack.className} text-2xl font-extrabold text-center`}>إنشاء حساب جديد</h1>
              <p className="text-sm text-gray-500 text-center">سجّل بيانات متجرك والبدء مع Orderaa</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {/* الاسم */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">اسم التاجر أو الشركة</label>
                <div className="relative">
                  <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: شركة المستقبل للتجارة"
                    required
                    className="w-full pr-10 pl-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* النشاط */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">اختر النشاط</label>
                <ActivityCombobox
                  value={activity}
                  onChange={setActivity}
                  options={activities}
                  placeholder="اختر النشاط"
                  icon={Briefcase}
                />
              </div>

              {/* المحافظة + المنطقة في نفس الصف */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">المحافظة</label>
                  <ActivityCombobox
                    value={governorate}
                    onChange={handleGovernorateChange}
                    options={governorates}
                    placeholder="اختر المحافظة"
                    icon={MapPin}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">المنطقة</label>
                  <ActivityCombobox
                    value={area}
                    onChange={setArea}
                    options={areaOptions}
                    placeholder={governorate ? "اختر المنطقة" : "اختر المحافظة أولًا"}
                    icon={Map}
                  />
                </div>
              </div>

              {/* كلمة المرور + تأكيد كلمة المرور (صف واحد على md+) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">كلمة المرور</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </button>
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={8}
                      required
                      className="w-full pr-10 pl-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">8 حروف/أرقام على الأقل.</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      aria-label={showConfirmPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </button>
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={8}
                      required
                      className="w-full pr-10 pl-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-[#5D24E1] text-white py-2.5 rounded-lg transition disabled:opacity-60">
              {isLoading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}
            </button>

            <p className="text-center text-sm text-gray-500">
              لديك حساب بالفعل؟ <a href="/" className="text-[#5D24E1] hover:underline">سجّل الدخول</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
