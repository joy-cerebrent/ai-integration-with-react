import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

const DynamicChart = ({
  chartConfig,
  type,
  width = '100%',
  height = '400px',
}: {
  chartConfig: EChartsOption;
  type: "bar" | "pie" | "radar" | "line" | "area";
  width?: string;
  height?: string;
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.EChartsType | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstanceRef.current) {
        chartInstanceRef.current = echarts.init(chartRef.current);
      }

      chartInstanceRef.current.setOption(chartConfig);
    }

    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstanceRef.current?.dispose();
      chartInstanceRef.current = null;
    };
  }, [chartConfig, type]);

  return (
    <div
      ref={chartRef}
      style={{
        width,
        height,
      }}
    />
  );
};

export default DynamicChart;
