import { Lock } from 'lucide-react';

export function StocktakeAccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card py-16 text-center">
      <Lock className="size-10 text-muted-foreground" aria-hidden="true" />
      <p className="text-base font-semibold text-foreground">
        ليس لديك صلاحية عرض جلسات الجرد
      </p>
      <p className="text-sm text-muted-foreground">
        تواصل مع مسؤول الحساب لمنحك الصلاحية
      </p>
    </div>
  );
}
