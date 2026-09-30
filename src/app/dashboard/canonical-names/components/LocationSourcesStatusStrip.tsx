'use client';

import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type {
  LocationRefreshErrorCode,
  LocationSourcesStatus,
} from '@/types/canonicalNames';
import { locationSourceLabel } from '../utils/locationSourceLabel';

const REFRESH_ERROR_LABELS: Record<LocationRefreshErrorCode, string> = {
  GOVERNORATES_FAILED: 'تعذر جلب المحافظات',
  CITIES_PARTIAL: 'بعض المدن لم تُجلب',
  TIMEOUT: 'انتهت مهلة الاتصال بشركة الشحن',
  NO_CREDENTIALS: 'لا توجد بيانات ربط لشركة الشحن',
  WRITE_FAILED: 'تعذّر حفظ القوائم',
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ar-EG');
};

interface LocationSourcesStatusStripProps {
  status: LocationSourcesStatus | undefined;
}

export default function LocationSourcesStatusStrip({
  status,
}: LocationSourcesStatusStripProps) {
  if (!status) return null;
  if (!status.running && status.sources.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-md border bg-gray-50 p-3">
      {status.running && (
        <p className="flex items-center gap-2 text-xs text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          جاري تحديث القوائم
        </p>
      )}
      <ul className="flex flex-wrap gap-2">
        {status.sources.map((source) => (
          <li
            key={source.source}
            className="flex flex-wrap items-center gap-2 rounded-md border bg-white px-2 py-1 text-xs"
          >
            <span className="font-medium text-gray-900">
              {locationSourceLabel(source.source)}
            </span>
            <span className="text-gray-500">
              {source.lastSuccessAt
                ? `آخر تحديث: ${formatDate(source.lastSuccessAt)}`
                : 'لم يكتمل تحديث بعد'}
            </span>
            <span className="text-gray-500">
              {source.governorateCount} محافظة، {source.cityCount} مدينة
            </span>
            {source.lastErrorCode && (
              <Badge variant="destructive">
                {REFRESH_ERROR_LABELS[source.lastErrorCode]}
              </Badge>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
