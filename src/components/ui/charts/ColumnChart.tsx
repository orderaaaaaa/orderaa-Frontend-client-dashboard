'use client';

import { useRef, useEffect, memo } from 'react';
import { useTheme } from 'next-themes';

export interface ColumnChartSeries {
  name: string;
  data: number[];
}

export interface ColumnChartProps {
  categories: string[];
  series: ColumnChartSeries[];
  color?: string;
  height?: number;
}

export const ColumnChart = memo(function ColumnChart({
  categories,
  series,
  color = '#3b82f6',
  height = 350,
}: ColumnChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ApexCharts | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    if (!chartRef.current || !resolvedTheme) return;

    let mounted = true;

    import('apexcharts').then(({ default: ApexCharts }) => {
      if (!mounted || !chartRef.current) return;

      const fixCanvasDirection = (chartCtx: ApexCharts) => {
        const el = (chartCtx as unknown as { el: HTMLElement }).el;
        const canvasContainer = el.querySelector<HTMLElement>('.apexcharts-canvas');
        const isRTL = document.documentElement.dir === 'rtl';

        if (canvasContainer) {
          canvasContainer.style.setProperty('direction', isRTL ? 'rtl' : 'ltr', 'important');
        }
      };

      const options: ApexCharts.ApexOptions = {
        chart: {
          type: 'bar',
          height,
          fontFamily: 'inherit',
          foreColor: isDark ? '#d4d4d4' : '#373d3f',
          toolbar: { show: false },
          events: {
            mounted: fixCanvasDirection,
            updated: fixCanvasDirection,
          },
        },
        series: series.map((s) => ({ name: s.name, data: s.data })),
        plotOptions: {
          bar: {
            borderRadius: 10,
            dataLabels: {
              position: 'top',
            },
            columnWidth: '50%',
          },
        },
        dataLabels: {
          enabled: true,
          formatter(val: number) {
            return `${val}`;
          },
          offsetY: -25,
          style: {
            fontSize: '13px',
            fontWeight: 700,
            colors: [isDark ? '#e5e5e5' : '#304758'],
          },
        },
        xaxis: {
          categories,
          tickAmount: categories.length,
          labels: {
            style: {
              fontSize: '12px',
              fontWeight: 600,
            },
            hideOverlappingLabels: false,
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          min: 0,
          forceNiceScale: false,
          max(max: number) {
            return Math.ceil(max * 1.15);
          },
          labels: {
            style: {
              fontSize: '11px',
              colors: isDark ? '#a3a3a3' : '#9ca3af',
            },
          },
        },
        grid: {
          borderColor: isDark ? '#262626' : '#f3f4f6',
          strokeDashArray: 3,
        },
        colors: [color],
        tooltip: {
          enabled: true,
          y: {
            formatter(val: number) {
              return `${val}`;
            },
          },
        },
        responsive: [
          {
            breakpoint: 640,
            options: {
              chart: {
                height,
              },
              plotOptions: {
                bar: { columnWidth: '70%' },
              },
              xaxis: {
                labels: {
                  rotate: 0,
                  style: {
                    fontSize: '10px',
                    fontWeight: 600,
                  },
                },
              },
            },
          },
        ],
      };

      chartInstance.current = new ApexCharts(chartRef.current, options);
      chartInstance.current.render();
    });

    return () => {
      mounted = false;
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [categories, series, color, height, isDark, resolvedTheme]);

  return <div ref={chartRef} />;
});
