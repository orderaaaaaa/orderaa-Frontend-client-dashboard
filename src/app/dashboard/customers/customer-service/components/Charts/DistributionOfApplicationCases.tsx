// components/charts/CallDistributionChart.tsx
'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { chartTheme as t } from '@/lib/chartTheme';

type Row = {
  name: string; // المكالمة الأولى | الثانية | الثالثة | 4+
  ناجحة: number;
  غيرناجحة: number;
};

const defaultData: Row[] = [
  { name: 'المكالمة الأولى', ناجحة: 12, غيرناجحة: 48 },
  { name: 'المكالمة الثانية', ناجحة: 30, غيرناجحة: 30 },
  { name: 'المكالمة الثالثة', ناجحة: 22, غيرناجحة: 38 },
  { name: '4+ مكالمات', ناجحة: 28, غيرناجحة: 32 },
];

export function CallDistributionChart({
  data = defaultData,
}: {
  data?: Row[];
}) {
  return (
    <ResponsiveContainer width="100%" height={480}>
      <BarChart data={data} barCategoryGap={24}>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.purple300} />
            <stop offset="100%" stopColor={t.purple700} />
          </linearGradient>
          <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.purple100} />
            <stop offset="100%" stopColor={t.purple500} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={t.grid} />
        <XAxis dataKey="name" tick={{ fill: t.label, fontSize: 12 }} />
        <YAxis
          tick={{ fill: t.label, fontSize: 12 }}
          tickFormatter={(v) => `${v}%`}
          domain={[0, 60]}
        />
        <Tooltip
          formatter={(v: number) => `${v}%`}
          contentStyle={{ borderRadius: 12, borderColor: t.cardBorder }}
        />
        <Bar
          dataKey="غيرناجحة"
          stackId="s"
          fill="url(#g2)"
          radius={[8, 8, 0, 0]}
        />
        <Bar
          dataKey="ناجحة"
          stackId="s"
          fill="url(#g1)"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
