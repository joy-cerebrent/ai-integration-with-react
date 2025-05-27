import DynamicChart from './DynamicChart';
import type { EChartsOption } from 'echarts';

interface ChartComponentProps {
  data: EChartsOption;
}

const ChartComponent = ({ data }: ChartComponentProps) => {
  return <DynamicChart chartConfig={data} type="custom" />;
};

export default ChartComponent;
