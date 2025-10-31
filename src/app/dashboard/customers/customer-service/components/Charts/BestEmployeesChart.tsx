'use client';
import React, { useMemo } from 'react';

type Employee = {
  id: number;
  name: string;
  success: number;
  delay: number;
  notResponding: number;
  Unsuccessful: number;
  cancel: number;
};

const SAMPLE: Employee[] = [
  {
    id: 1,
    name: 'جاكلين',
    success: 20,
    delay: 25,
    notResponding: 15,
    Unsuccessful: 10,
    cancel: 30,
  },
  {
    id: 2,
    name: 'أمنيه',
    success: 40,
    delay: 20,
    notResponding: 15,
    Unsuccessful: 10,
    cancel: 15,
  },
  {
    id: 3,
    name: 'بسمه',
    success: 25,
    delay: 35,
    notResponding: 10,
    Unsuccessful: 10,
    cancel: 20,
  },
  {
    id: 4,
    name: 'ندى',
    success: 30,
    delay: 20,
    notResponding: 15,
    Unsuccessful: 10,
    cancel: 25,
  },
  {
    id: 5,
    name: 'كريمة',
    success: 15,
    delay: 30,
    notResponding: 20,
    Unsuccessful: 15,
    cancel: 20,
  },
  {
    id: 6,
    name: 'يوستينا',
    success: 25,
    delay: 25,
    notResponding: 20,
    Unsuccessful: 10,
    cancel: 20,
  },
];

const COLORS: Record<string, string> = {
  success: '#5D24E1',
  delay: '#7438FF',
  notResponding: '#9365FF',
  Unsuccessful: '#B8A3EB',
  cancel: '#DFD8EE',
};

const ALL_KEYS = [
  'success',
  'delay',
  'notResponding',
  'Unsuccessful',
  'cancel',
] as const;
type KeyName = (typeof ALL_KEYS)[number];

interface Props {
  data?: Employee[];
  chartHeight?: number;
  barWidth?: number;
  spacing?: number;
  depth?: number;
}

export default function EmployeeTop33DChartSVG({
  data = SAMPLE,
  chartHeight = 256,
  barWidth = 92,
  spacing = 160,
  depth = 18,
}: Props): JSX.Element {
  const computed = useMemo(() => {
    return data.map((emp) => {
      const pairs: [KeyName, number][] = ALL_KEYS.map((k) => [
        k,
        (emp as any)[k],
      ]);
      pairs.sort((a, b) => b[1] - a[1]);
      const top3 = pairs.slice(0, 3);
      const top3Sum = top3.reduce((s, [, v]) => s + v, 0);
      return { emp, top3, top3Sum };
    });
  }, [data]);

  const maxTop3Sum = Math.max(...computed.map((c) => c.top3Sum), 1);
  const valueToPx = (v: number) => (v / maxTop3Sum) * chartHeight;
  const svgWidth = data.length * spacing;
  const svgHeight = chartHeight + 120;
  const bottomY = chartHeight;

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-6">
      {/* Legend */}
      <div className="flex gap-4 items-center justify-start text-sm text-gray-600 mb-4 rtl:justify-end">
        <Legend color={COLORS.success} label="ناجحة" />
        <Legend color={COLORS.delay} label="تأجيل" />
        <Legend color={COLORS.notResponding} label="عدم الرد" />
        <Legend color={COLORS.Unsuccessful} label="غير ناجحة" />
        <Legend color={COLORS.cancel} label="إلغاء" />
      </div>

      <div className="overflow-x-auto">
        <svg width={svgWidth} height={svgHeight} className="block mx-auto">
          {computed.map(({ emp, top3 }, idx) => {
            const ordered = [...top3].sort((a, b) => b[1] - a[1]);
            const heights = ordered.map(([, v]) => valueToPx(v));
            let currentY = bottomY;
            const groupX = idx * spacing + 40;
            const centerX = barWidth / 2;

            return (
              <g key={emp.id} transform={`translate(${groupX}, 20)`}>
                {/* Bar shell base */}

                {heights.map((h, i) => {
                  const top = currentY - h;
                  const [keyName] = ordered[i];
                  const color = COLORS[keyName];
                  currentY = top;

                  return (
                    <g key={`${emp.id}-${keyName}`}>
                      {/* LEFT face */}
                      <polygon
                        points={`${centerX},${top} ${0},${top - depth} ${0},${
                          top - depth + h
                        } ${centerX},${top + h}`}
                        fill={color}
                        opacity={1}
                      />
                      {/* RIGHT face */}
                      <polygon
                        points={`${centerX},${top} ${barWidth},${
                          top - depth
                        } ${barWidth},${top - depth + h} ${centerX},${top + h}`}
                        fill={color}
                        opacity={1}
                      />
                      {/* top ridge */}
                      <polygon
                        points={`${0},${
                          top - depth
                        } ${centerX},${top} ${barWidth},${top - depth}`}
                        fill={color}
                        opacity={1}
                      />
                    </g>
                  );
                })}

                {/* Top cap of the final stack */}
                <polygon
                  points={`${0},${
                    currentY - depth
                  } ${centerX},${currentY} ${barWidth},${currentY - depth}`}
                  fill="#E4DBFA"
                  opacity={0.1}
                />

                {/* name */}
                <text
                  x={barWidth / 2}
                  y={chartHeight + 40}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize={14}
                  fontWeight={700}
                >
                  {emp.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 h-4 rounded-sm" style={{ background: color }} />{' '}
      {label}
    </div>
  );
}
