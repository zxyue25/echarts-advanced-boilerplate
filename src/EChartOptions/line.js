import { chartColors, getMarkPointSymbol } from './index';

export const getLineEChartOption = () => {
  const options = {
    color: chartColors,
    legend: {
      data: ['Email', 'Union Ads']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Email',
        type: 'line',
        data: [120, 132, 100, 134, 90, 230, 200],
        markPoint: {
          label: {
            show: false,
          },
          data: [120, 132, 100, 134, 90, 230, 200].map((dataItem, dataIndex) => ({
            coord: [dataIndex, dataItem],
            symbol: dataItem % 100 === 0 ? getMarkPointSymbol(chartColors[0]) : "none",
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
      {
        name: 'Union Ads',
        type: 'line',
        data: [220, 212, 200, 234, 400, 300, 310],
        markPoint: {
          label: {
            show: false,
          },
          data: [220, 212, 200, 234, 400, 300, 310].map((dataItem, dataIndex) => ({
            coord: [dataIndex, dataItem],
            // symbol: dataItem % 100 === 0 ? getMarkPointSymbol(chartColors[1]) : "none",
            symbol:  dataItem === 200 ? `image://${require(`../assets/img/prize-add-${chartColors[1].replace('#', '')}.png`)}` : dataItem % 100 === 0 ? getMarkPointSymbol(chartColors[1]) : "none",
            symbolOffset: ['0%', '-38%'],
            symbolSize: [36, 32],//dataItem === 200 ? [48, 36] : [36, 32],
            emphasis: {
              itemStyle: {
                borderColor: '#fff',
                borderWidth: 2,
                shadowBlur: 4,
                shadowColor: chartColors[1],
              },
            },
          })),
        }
      },
    ]
  };
  return options;
};
