import { Lock } from 'lucide-react';

interface StocktakeAccessDeniedProps {
  title?: string;
}

export function StocktakeAccessDenied({ title = 'ليس لديك صلاحية عرض جلسات الجرد' }: StocktakeAccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card py-16 text-center">
      <Lock className="size-10 text-muted-foreground" aria-hidden="true" />
      <p className="text-base font-semibold text-foreground">
        {title}
      </p>
      <p className="text-sm text-muted-foreground">
        تواصل مع مسؤول الحساب لمنحك الصلاحية
      </p>
    </div>
  );
}
