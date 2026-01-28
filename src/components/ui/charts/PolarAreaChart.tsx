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

      const fixLegendLayout = (chartCtx: ApexCharts) => {
        const el = (chartCtx as unknown as { el: HTMLElement }).el;
        const legendContainer = el.querySelector<HTMLElement>('.apexcharts-legend');
        const canvasContainer = el.querySelector<HTMLElement>('.apexcharts-canvas');
        const isRTL = document.documentElement.dir === 'rtl';

        if (canvasContainer) {
          canvasContainer.style.setProperty('direction', isRTL ? 'rtl' : 'ltr', 'important');
        }

        if (window.innerWidth < 640) {
          if (legendContainer) {
            legendContainer.style.position = 'absolute';
            legendContainer.style.top = '150px';
            legendContainer.style.left = '';
            legendContainer.style.right = '';
            legendContainer.style.display = 'flex';
            legendContainer.style.flexDirection = 'column';
            legendContainer.style.gap = '8px';
            legendContainer.style.alignItems = 'flex-start';
            legendContainer.style.width = '100%';
            legendContainer.style.marginTop = '16px';
          }

          el.querySelectorAll<HTMLElement>('.apexcharts-legend-series').forEach(
            (item) => {
              item.style.display = 'flex';
              item.style.flexDirection = 'row';
              item.style.alignItems = 'center';
              item.style.gap = '8px';
              item.style.margin = '0';
            },
          );
        } else {
          if (legendContainer) {
            legendContainer.style.position = '';
            legendContainer.style.top = '';
            legendContainer.style.left = '';
            legendContainer.style.right = '';
            legendContainer.style.display = '';
            legendContainer.style.flexDirection = '';
            legendContainer.style.gap = '25px';
            legendContainer.style.alignItems = '';
            legendContainer.style.width = '';
            legendContainer.style.marginTop = '';
            legendContainer.style.paddingBottom = '20px';
          }

          el.querySelectorAll<HTMLElement>('.apexcharts-legend-series').forEach(
            (item) => {
              item.style.display = '';
              item.style.flexDirection = '';
              item.style.alignItems = '';
              item.style.gap = '5px';
              item.style.margin = '';
            },
          );
        }
      };

      const options: ApexCharts.ApexOptions = {
        chart: {
          type: 'polarArea',
          height,
          fontFamily: 'inherit',
          events: {
            mounted: fixLegendLayout,
            updated: fixLegendLayout,
          },
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

      const handleResize = () => {
        if (chartInstance.current) {
          fixLegendLayout(chartInstance.current);
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
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
