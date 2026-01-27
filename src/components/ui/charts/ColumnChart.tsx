'use client';

import { useRef, useEffect, memo } from 'react';

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

  useEffect(() => {
    if (!chartRef.current) return;

    let mounted = true;

    import('apexcharts').then(({ default: ApexCharts }) => {
      if (!mounted || !chartRef.current) return;

      const options: ApexCharts.ApexOptions = {
        chart: {
          type: 'bar',
          height,
          fontFamily: 'inherit',
          toolbar: { show: false },
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
            colors: ['#304758'],
          },
        },
        xaxis: {
          categories,
          labels: {
            style: {
              fontSize: '12px',
              fontWeight: 600,
            },
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          max(max: number) {
            return Math.ceil(max * 1.15);
          },
          labels: {
            style: {
              fontSize: '11px',
              colors: '#9ca3af',
            },
          },
        },
        grid: {
          borderColor: '#f3f4f6',
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
              chart: { height: 300 },
              plotOptions: {
                bar: { columnWidth: '70%' },
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
  }, [categories, series, color, height]);

  return <div ref={chartRef} />;
});
