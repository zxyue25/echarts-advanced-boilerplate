import './App.css';
import 'antd/dist/antd.css';
import * as echarts from 'echarts';
import { useEffect, useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import EChartTooltip from './components/EChartTooltip'
import { getLineEChartOption, getBarEChartOption, getPieEChartOption } from './EChartOptions/index'

function App() {
  let myChart = null
  const [isPrize, setIsPrize] = useState(false)

  const changeIsPrize = (isPrizeBol) => {
    setIsPrize(isPrizeBol)
  }

  const updateChartOptions = useCallback((isForm) => {
    const tooltipOption = {
      tooltip: {
        trigger: 'item',
        enterable: true,
        hideDelay: 200,
        alwaysShowContent: true,
        borderWidth: 0,
        position(point, params, dom, rect, size) {
          if (isForm) {
            if (size.viewSize[0] - point[0] < 260) {
              return [
                point[0] - (260 + point[0] - size.viewSize[0]),
                point[1] - 220
              ];
            } else {
              return [
                point[0],
                point[1] - 220
              ];
            }
          } else {
            if (size.viewSize[0] - point[0] < 130) {
              return [
                point[0] - (130 + point[0] - size.viewSize[0]),
                point[1] - 100
              ];
            } else {
              return [
                point[0],
                point[1] - 100
              ];
            }
          }

        },
        formatter(params) {
          setTimeout(() => {
            const root = document.getElementById(`tool-tip`);
            if (root) {
              ReactDOM.render(
                <EChartTooltip data={params} isPrize={isForm} changeIsPrize={changeIsPrize} />,
                root,
              );
            }
          }, 0);
          return `<div id="tool-tip"></div>`;
        },
        extraCssText: 'z-index: 999',
      },
    };
    return tooltipOption
  }, [])

  useEffect(() => {
    const options = updateChartOptions(isPrize)
    if (!myChart) {
      if (!document.getElementById('chartRef')) {
        return;
      }
      myChart = echarts.init(document.getElementById('chartRef'));
      myChart.on('mouseover', function (params) {
        if (params.componentType === 'markPoint') {
          setIsPrize(true);
        }
      });

      myChart.on('mouseout', function (params) {
        setIsPrize(false);
      });

      myChart.on('click', function (params) {
        if (params.componentType !== 'markPoint') {
          setIsPrize(true);
        }
      });
    }
    myChart.setOption(Object.assign(getBarEChartOption(), options));
    // const xYAxis = myChart._chartsMap[Object.keys(myChart?._chartsMap)[0]]?.group?._children?.map((item) => item?.textGuideLineConfig?.anchor) || [];
    // const options2 = Object.assign(
    //   getPieEChartOption(xYAxis),
    //   options,
    // );
    // myChart.setOption(options2);
  }, [isPrize])

  return (
    <div className="App">
      <div className='chart' id='chartRef'></div>
    </div>
  );
}

export default App;
