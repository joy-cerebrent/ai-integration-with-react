import DynamicChart from './DynamicChart';
import type { EChartsOption } from 'echarts';

const generateColorRange = (
  steps: number,
  startColor: [number, number, number] = [255, 255, 255],
  endColor: [number, number, number] = [144, 144, 144]
): string[] => {
  const colors: string[] = [];

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * t);
    const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * t);
    const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * t);
    colors.push(`rgb(${r},${g},${b})`);
  }

  return colors;
};

const ChartComponent = () => {
  const barConfig: EChartsOption = {
    title: {
      text: 'Bar Chart',
      left: 'center',
      textStyle: {
        color: "#fff"
      }
    },
    color: "white",
    tooltip: {},
    xAxis: {
      data: ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'],
    },
    yAxis: {},
    series: [
      {
        name: 'Sales',
        type: 'bar',
        data: [5, 20, 36, 10, 10],
      },
    ],
  };

  const pieConfig: EChartsOption = {
    title: {
      text: 'Pie Chart',
      left: 'center',
      textStyle: {
        color: "#fff"
      }
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      textStyle: {
        color: "#fff"
      },
      left: 'right',
      top: 'center'
    },
    color: generateColorRange(5),
    series: [
      {
        name: 'Fruits',
        type: 'pie',
        radius: '50%',
        label: {
          show: true,
          color: "#fff",
          textBorderColor: "transparent"
        },
        labelLine: {
          show: true,
          lineStyle: {
            color: "#fff"
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        data: [
          { value: 1048, name: 'Apple' },
          { value: 735, name: 'Banana' },
          { value: 580, name: 'Cherry' },
          { value: 484, name: 'Date' },
          { value: 300, name: 'Elderberry' },
        ],
      },
    ],
  };

  const radarConfig: EChartsOption = {
    title: {
      text: 'Radar Chart',
      left: 'center',
      textStyle: {
        color: "#fff"
      }
    },
    tooltip: {},
    legend: {
      data: ['Score'],
      top: 'bottom',
      textStyle: {
        color: '#fff'
      }
    },
    color: "white",
    radar: {
      indicator: [
        { name: 'Speed', max: 100 },
        { name: 'Agility', max: 100 },
        { name: 'Strength', max: 100 },
        { name: 'Endurance', max: 100 },
        { name: 'Flexibility', max: 100 },
      ],
    },
    series: [
      {
        name: 'Scores',
        type: 'radar',
        data: [
          {
            value: [80, 90, 70, 85, 60],
            name: 'Score',
          },
        ],
      },
    ],
  };

  const multipleBarConfig: EChartsOption = {
    title: {
      text: 'Bar Chart - Sales per Month',
      left: 'center',
      textStyle: {
        color: "#fff"
      }
    },
    tooltip: {},
    legend: {
      data: ['Product A', 'Product B', 'Product C'],
      top: 'bottom',
      textStyle: { color: '#fff' },
    },
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar'],
      axisLine: { lineStyle: { color: '#9ca3af' } },
      axisLabel: { color: '#fff' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#9ca3af' } },
      axisLabel: { color: '#fff' },
    },
    series: [
      {
        name: 'Product A',
        type: 'bar',
        data: [15, 25, 35],
        itemStyle: {
          color: generateColorRange(3)[0],
        },
      },
      {
        name: 'Product B',
        type: 'bar',
        data: [10, 20, 30],
        itemStyle: {
          color: generateColorRange(3)[1],
        },
      },
      {
        name: 'Product C',
        type: 'bar',
        data: [5, 15, 25],
        itemStyle: {
          color: generateColorRange(3)[2],
        },
      },
    ],
  };

  const radarConfigFilled: EChartsOption = {
    title: {
      text: 'Radar Chart - Single Score',
      left: 'center',
      textStyle: {
        color: "#fff",
      },
    },
    legend: {
      data: ['Player 1', 'Player 2'],
      top: 'bottom',
      textStyle: { color: '#fff' },
    },
    radar: {
      indicator: [
        { name: 'Speed', max: 100 },
        { name: 'Agility', max: 100 },
        { name: 'Strength', max: 100 },
        { name: 'Endurance', max: 100 },
        { name: 'Flexibility', max: 100 },
      ],
    },
    series: [
      {
        name: 'Stats',
        type: 'radar',
        data: [
          {
            value: [80, 85, 90, 70, 95],
            name: 'Player 1',
            areaStyle: { color: 'rgba(255, 255, 255, 0.4)' },
            lineStyle: { color: 'rgba(255, 255, 255, 0.8)' },
            itemStyle: { color: 'rgba(255, 255, 255, 0.8)' }
          },
          {
            value: [95, 65, 32, 78, 90],
            name: 'Player 2',
            areaStyle: { color: 'rgba(255, 255, 255, 0.4)' },
            lineStyle: { color: 'rgba(255, 255, 255, 0.6)' },
            itemStyle: { color: 'rgba(255, 255, 255, 0.6)' }
          },
        ],
      },
    ],
  };

  const lineConfig: EChartsOption = {
    title: {
      text: 'Line Chart - Single Data',
      left: 'center',
      textStyle: {
        color: "#fff"
      }
    },
    tooltip: {},
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      axisLine: { lineStyle: { color: '#9ca3af' } },
      axisLabel: { color: '#fff' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#9ca3af' } },
      axisLabel: { color: '#fff' },
    },
    series: [
      {
        data: [5, 15, 25, 35, 45],
        type: 'line',
        itemStyle: { color: '#fff' },
        lineStyle: { color: '#fff' },
        smooth: true,
      },
    ],
  };

  const areaConfig: EChartsOption = {
    title: {
      text: 'Area Chart - Monthly Growth',
      left: 'center',
      textStyle: {
        color: "#fff"
      }
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      axisLine: { lineStyle: { color: '#9ca3af' } },
      axisLabel: { color: '#fff' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#9ca3af' } },
      axisLabel: { color: '#fff' },
    },
    series: [
      {
        name: 'Growth',
        type: 'line',
        data: [10, 20, 15, 25, 30],
        smooth: true,
        itemStyle: {
          color: '#fff',
        },
        lineStyle: {
          color: '#fff',
        },
        areaStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
        },
      },
    ],
  };


  const lineConfigMultiple: EChartsOption = {
    title: {
      text: 'Line Chart - Multiple Data',
      left: 'center',
      textStyle: {
        color: "#fff"
      }
    },
    legend: {
      data: ['Product A', 'Product B', 'Product C'],
      top: 'bottom',
      textStyle: { color: '#fff' },
    },
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      axisLine: { lineStyle: { color: '#9ca3af' } },
      axisLabel: { color: '#fff' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#9ca3af' } },
      axisLabel: { color: '#fff' },
    },
    series: [
      {
        name: 'Product A',
        data: [10, 20, 30, 40, 50],
        type: 'line',
        itemStyle: {
          color: generateColorRange(3)[0],
        },
        lineStyle: {
          color: generateColorRange(3)[0],
        },
        smooth: true,
      },
      {
        name: 'Product B',
        data: [5, 15, 25, 35, 45],
        type: 'line',
        itemStyle: {
          color: generateColorRange(3)[1],
        },
        lineStyle: {
          color: generateColorRange(3)[1],
        },
        smooth: true,
      },
      {
        name: 'Product C',
        data: [2, 12, 22, 32, 42],
        type: 'line',
        itemStyle: {
          color: generateColorRange(3)[2],
        },
        lineStyle: {
          color: generateColorRange(3)[2],
        },
        smooth: true,
      },
    ],
  };

  return (
    <div className="w-full flex-1 grid grid-cols-2 space-y-4 p-4">
      <DynamicChart chartConfig={barConfig as EChartsOption} type="bar" height="300px" width="350px" />
      <DynamicChart chartConfig={pieConfig as EChartsOption} type="pie" height="300px" width="350px" />
      <DynamicChart chartConfig={radarConfig as EChartsOption} type="radar" height="300px" width="350px" />
      <DynamicChart chartConfig={multipleBarConfig as EChartsOption} type="bar" height="300px" width="350px" />
      <DynamicChart chartConfig={radarConfigFilled as EChartsOption} type="radar" height="300px" width="350px" />
      <DynamicChart chartConfig={lineConfig} type="line" height="300px" width="350px" />
      <DynamicChart chartConfig={areaConfig} type="area" height="300px" width="350px" />
      <DynamicChart chartConfig={lineConfigMultiple} type="line" height="300px" width="350px" />

      <h2 className="col-span-2">New Chart</h2>
    </div>
  );
};

export default ChartComponent;
