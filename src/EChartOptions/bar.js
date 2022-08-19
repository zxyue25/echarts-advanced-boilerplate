

import { chartColors, getMarkPointSymbol } from './index';

export const getBarEChartOption = () => {
  const data = [120, 200, 0, 0, 70, 100, 130]
  const total = data.reduce((count, curItem) => Number(count) + Number(curItem), 0);

  const handledData = data.map((dataItem) => ({
    value: dataItem,
    ...{
      percentValue: total ? parseFloat(((dataItem / total) * 100).toFixed(2)) : 0,
    },
  }));

  const options = {
    color: chartColors,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: [
      {
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          formatter: '{value}%',
        },
      },
    ],
    series: [
      {
        type: 'bar',
        stack: 'Ad',
        barWidth: 32,
        emphasis: {
          focus: 'series',
        },
        barMinHeight: 10,
        data: handledData.map((dataItem) => ({
          value: dataItem.percentValue,
          itemStyle: {
            color: dataItem.value !== 0 ? chartColors[0] : '#EEE',
          },
        })),
        markPoint: {
          label: {
            show: false,
          },
          data: handledData.map((dataItem, dataIndex) => ({
            coord: [dataIndex, dataItem.percentValue],
            symbol: dataItem.value % 100 === 0 && dataIndex % 2 === 0 ? getMarkPointSymbol(chartColors[0]) : "none",
            symbolOffset: ['0%', '-38%'],
            symbolSize: [36, 32],
            emphasis: {
              itemStyle: {
                borderColor: '#fff',
                borderWidth: 2,
                shadowBlur: 4,
                shadowColor: chartColors[0],
              },
            },
          })),
        }
      },
    ],
  };
  return options;
};
