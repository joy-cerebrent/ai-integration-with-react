import DynamicChart from './DynamicChart';
import type { EChartsOption } from 'echarts';

const ChartComponent = () => {
  const barConfig = {
    title: { text: 'Bar Chart' },
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

  const pieConfig = {
    title: { text: 'Pie Chart', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: 'Fruits',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: 'Apple' },
          { value: 735, name: 'Banana' },
          { value: 580, name: 'Cherry' },
          { value: 484, name: 'Date' },
          { value: 300, name: 'Elderberry' },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  const radarConfig = {
    title: { text: 'Radar Chart' },
    tooltip: {},
    legend: { data: ['Score'] },
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

  return (
    <div className="w-full flex-1 flex flex-col space-y-4 p-4">
      <DynamicChart chartConfig={barConfig as EChartsOption} type="bar" height="300px" width="400px"/>
      <DynamicChart chartConfig={pieConfig as EChartsOption} type="pie" height="300px" width="400px"/>
      <DynamicChart chartConfig={radarConfig as EChartsOption} type="radar" height="300px" width="400px"/>
    </div>
  );
};

export default ChartComponent;
