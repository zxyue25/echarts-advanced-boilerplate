import { chartColors, getMarkPointSymbol } from './index';

export const getPieEChartOption = (xYAxis = []) => {
  console.log(xYAxis)
  const data = [
    { value: 0, name: 'Search Engine' },
    { value: 700, name: 'Direct' },
  ]
  const total = data.reduce((count, curItem) => Number(count) + Number(curItem.value), 0);
  const handledData = data.map((dataItem) => ({
    ...dataItem,
    ...{
      percentValue: total ? parseFloat(((dataItem.value / total) * 100).toFixed(2)) : 0,
    },
  }));

  const options = {
    color: chartColors,
    legend: {
      top: '5%',
      left: 'center',
      selectedMode: false,
    },
    title: {
      text: total,
      left: 'center',
      top: '50%',
      textStyle: {
        fontSize: 20,
        color: '#1C1F23',
      },
    },
    graphic: {
      type: 'text',
      left: 'center',
      top: '45%',
      style: {
        text: 'Total',
        textAlign: 'center',
        fontSize: 12,
        fill: 'rgba(28, 31, 35, 0.6)',
      },
    },
    series: [
      {
        type: 'pie',
        top: '5%',
        radius: ['30%', '55%'],
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        startAngle: 270,
        data: handledData.map((dataItem, dataIndex) => ({
          value: dataItem.value,
          name: dataItem.name,
          label: {
            position: 'outside',
            formatter: ['{icon|}{value|{c}}{gap|}', '{tag|{b} {d}%}'].join('\n'),
            rich: {
              icon: {
                width: 14,
                height: 14,
                backgroundColor: {
                  image: require(`../assets/img/prize-${chartColors[dataIndex].replace('#', '')}.png`),
                },
              },
              value: {
                height: 14,
                color: chartColors[dataIndex],
                fontWeight: 700,
                fontSize: 16,
                lineHeight: 20,
              },
              gap: {
                height: 12,
              },
              tag: {
                height: 10,
                backgroundColor: 'rgba(46, 50, 56, 0.05)',
                borderRadius: 18,
                padding: 8,
                fontWeight: 600,
                fontSize: 12,
                color: 'rgba(28, 31, 35, 0.8)',
                margin: [8, 0, 0, 0],
              },
            },
          },
          labelLine: {
            show: true,
            length: 16,
            length2: 20,
            lineStyle: {
              color: chartColors[dataIndex],
            },
            maxSurfaceAngle: 60,
          },
        })),
        markPoint: {
          label: {
            show: false,
          },
          animation: false,
          data: handledData.map((dataItem, dataIndex) => ({
            textValue: `${dataItem.percentValue}%`,
            x: xYAxis[dataIndex]?.x,
            y: xYAxis[dataIndex]?.y,
            symbol: dataItem.value % 100 === 0 ? getMarkPointSymbol(chartColors[dataIndex]) : 'none',
            symbolSize: [36, 32],
            symbolOffset: [0, '-40%'],
            emphasis: {
              itemStyle: {
                borderColor: '#fff',
                borderWidth: 2,
                shadowBlur: 4,
                shadowColor: "#fff",
              },
            },
          })),
        },
      },
    ],
  };
  return options;
};
