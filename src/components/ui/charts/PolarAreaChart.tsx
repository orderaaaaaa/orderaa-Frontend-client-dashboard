'use client';

import { useRef, useEffect, memo } from 'react';

export interface PolarAreaChartProps {
  series: number[];
  labels: string[];
  color?: string;
  height?: number;
}

export const PolarAreaChart = memo(function PolarAreaChart({
  series,
  labels,
  color = '#6366f1',
  height = 350,
}: PolarAreaChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ApexCharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    let mounted = true;

    import('apexcharts').then(({ default: ApexCharts }) => {
      if (!mounted || !chartRef.current) return;

      const options: ApexCharts.ApexOptions = {
        chart: {
          type: 'polarArea',
          height,
          fontFamily: 'inherit',
        },
        series,
        labels,
        theme: {
          monochrome: {
            enabled: true,
            color,
            shadeTo: 'light',
            shadeIntensity: 0.6,
          },
        },
        stroke: {
          colors: ['#fff'],
        },
        fill: {
          opacity: 0.8,
        },
        plotOptions: {
          polarArea: {
            rings: {
              strokeWidth: 0,
            },
            spokes: {
              strokeWidth: 0,
            },
          },
        },
        grid: {
          show: false,
        },
        legend: {
          show: true,
          position: 'bottom',
          fontSize: '13px',
          fontWeight: 600,
          markers: { size: 8, shape: 'circle' },
          itemMargin: { horizontal: 8, vertical: 4 },
        },
        dataLabels: {
          enabled: false,
        },
        tooltip: {
          enabled: true,
          y: {
            formatter(val: number) {
              return `${val}`;
            },
          },
        },
        yaxis: {
          show: false,
        },
        responsive: [
          {
            breakpoint: 640,
            options: {
              chart: { height: 300 },
              legend: { fontSize: '11px' },
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
  }, [series, labels, color, height]);

  return <div ref={chartRef} />;
});
