'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  LOCATION_OPTION_ERROR_CODES,
  locationOptionErrorCodeOf,
  locationOptionsErrorTextOf,
} from '@/types/locationOptions';

export const CANONICAL_GOVERNORATES_HREF = '/dashboard/canonical-names/governorates';

export function GovernorateCanonicalLink() {
  return (
    <div className="flex flex-col items-start gap-1">
      <Button asChild variant="outline" size="sm">
        <Link href={CANONICAL_GOVERNORATES_HREF} target="_blank" rel="noopener">
          افتح صفحة المحافظات الموحدة
        </Link>
      </Button>
      <p className="text-xs text-muted-foreground">
        تفتح في نافذة جديدة. بياناتك في هذا النموذج لن تتغير.
      </p>
    </div>
  );
}

interface GovernorateSourceEmptyProps {
  canRead: boolean;
}

export function GovernorateSourceEmpty({ canRead }: GovernorateSourceEmptyProps) {
  return (
    <div className="flex flex-col gap-2 text-xs text-muted-foreground">
      <p>لا توجد قائمة محافظات لهذه الشركة بعد.</p>
      {canRead ? (
        <>
          <p>
            تُحدَّث القائمة تلقائيا مرة يوميا. إن كانت لديك صلاحية، افتح صفحة المحافظات
            الموحدة للتحقق منها.
          </p>
          <GovernorateCanonicalLink />
        </>
      ) : (
        <p>اطلب من مسؤول الحساب التحقق من قائمة المحافظات لهذه الشركة.</p>
      )}
    </div>
  );
}

interface GovernorateListErrorProps {
  error: unknown;
  onRetry: () => void;
}

export function GovernorateListError({ error, onRetry }: GovernorateListErrorProps) {
  const canRetry = locationOptionErrorCodeOf(error) !== LOCATION_OPTION_ERROR_CODES.PROVIDER_NOT_SUPPORTED;
  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-xs text-destructive">
        {locationOptionsErrorTextOf(error, 'تعذر تحميل المحافظات لهذه الشركة.')}
      </p>
      {canRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}
