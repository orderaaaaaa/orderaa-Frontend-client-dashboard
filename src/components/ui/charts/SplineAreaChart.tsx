'use client';

import { useRef, useEffect, memo } from 'react';
import { useTheme } from 'next-themes';

export interface SplineAreaChartSeries {
  name: string;
  data: number[];
}

interface SplineAreaChartProps {
  categories: string[];
  series: SplineAreaChartSeries[];
  height?: number;
  colors?: string[];
}

export const SplineAreaChart = memo(function SplineAreaChart({
  categories,
  series,
  height = 150,
  colors = ['#2dd4bf', '#3b82f6'],
}: SplineAreaChartProps) {
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
          type: 'area',
          height,
          toolbar: { show: false },
          zoom: { enabled: false },
          fontFamily: 'inherit',
          foreColor: isDark ? '#d4d4d4' : '#373d3f',
          events: {
            mounted: fixCanvasDirection,
            updated: fixCanvasDirection,
          },
        },
        stroke: {
          curve: 'smooth',
          width: 2,
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.4,
            opacityTo: 0.05,
            stops: [0, 90, 100],
          },
        },
        dataLabels: { enabled: false },
        series: series.map((s) => ({ name: s.name, data: s.data })),
        xaxis: {
          categories,
          tickAmount: categories.length,
          labels: {
            style: { fontSize: '10px', colors: isDark ? '#a3a3a3' : '#9ca3af' },
            hideOverlappingLabels: false,
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          min: 0,
          forceNiceScale: false,
          labels: {
            style: { fontSize: '10px', colors: isDark ? '#a3a3a3' : '#9ca3af' },
          },
        },
        grid: {
          borderColor: isDark ? '#262626' : '#f3f4f6',
          strokeDashArray: 3,
        },
        colors,
        legend: {
          show: true,
          position: 'bottom',
          fontSize: '11px',
          markers: { size: 5, shape: 'circle' },
        },
        tooltip: { enabled: true },
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
  }, [categories, series, height, colors, isDark, resolvedTheme]);

  return <div ref={chartRef} />;
});
