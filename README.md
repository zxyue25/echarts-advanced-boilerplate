# 用ECharts玩出花——疑难case
# 前言

本文将总结我在这次需求中遇到的一些**ECharts疑难case**，主要是**tooltip**、**markPoint**的深度使用等。文章偏实践，有深度EChart使用经验会比较容易get，建议遇到有不熟悉的API时，仔细查阅EChart文档再回到本文。

> 本文所有的图表截图均在[github-demo](https://github.com/zxyue25/echarts-advanced-boilerplate)实现

# 大纲
- tooltip
    - tooltip属性的作用
    - 如何**自定义**tooltip
    - 如何解决tooltip展示**被遮挡**的问题
- markPoint
    - markPoint属性的作用
    - 如何**自定义markPoint图标**
    - 如何**按条件**在**正确的位置上**显示markPoint图标
    - 如何**主动高亮**markPoint
- 结合图表事件
    - 如何实现markPoint与非markPoint显示的tooltip不同
    - 如何实现点击某个节点出现指定markPoint icon
    - 如何实现图表可视区域变化自适应
- 其他较简单case
    - 柱状图的case
    - 饼图的case
- 一些问题

# 一、[tooltip](https://echarts.apache.org/zh/option.html#tooltip)

### 1.1 tooltip属性的作用

通常用来展示某个节点的详细数据，如下图（分别来自ECharts官方示例的折线图、柱状图、饼图）。
![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/917675b6865547d390b457a5a3fab61b~tplv-k3u1fbpfcp-watermark.image?)


### 1.2 如何自定义tooltip

可以看到官方提供的tooltip比较简单，想要实现**自定义数据**、带 **“特有样式”** 、带 **“交互”** 功能的tooltip怎么办？比如下图功能：

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/10418359c9004d2da883b622d0e73c99~tplv-k3u1fbpfcp-watermark.image?)

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d297640688544f5e87fb4990d1d523b1~tplv-k3u1fbpfcp-watermark.image?)
首先我们需要借助属性[formatter](https://echarts.apache.org/zh/option.html#tooltip.formatter)：提示框浮层内容格式器，支持**字符串模板**和**回调函数**两种形式

- **自定义数据**\
formatter足够实现

- **带“特有样式”**

    > label带“特有样式”，可以通过rich属性配置，文章后半部分会体现，但tooltip是没有的😭

    常见解决方案拼接html片段，如下图；很不优雅😅，但仅仅一个样式可能还凑合？
    ```
    formatter: function(params) {
        let html = `<div style="color: red;">${params.xx}<div>`
        return html
    }
    ```
- **带“交互”**\
比如说点击事件、调接口，hover出提示，form表单带校验...，用上述拼html片段的方案如果硬写原则上说是可以实现的，但是肯定很不优雅，有无更好的解决方案？

#### 1、思路一

拼接html太蠢了，一定要借助ECharts的tooltip嘛？

有没有可能先拿到鼠标在图表上的x、y坐标，在图表之外用借助antd这种组件库写react组件实现功能，再把react组件定位到鼠标的x、y坐标上？你看，antd的气泡卡片组件很像了嘛！

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d948e512d2944dd89c80adcd786ade28~tplv-k3u1fbpfcp-zoom-1.image)

先把tooltip隐藏，使用[echartsInstance.](https://echarts.apache.org/zh/api.html#echartsInstance) [on](https://echarts.apache.org/zh/api.html#echartsInstance.on) 监听鼠标事件，可以拿到x、y坐标以及该点的数据，用样式定位组件，把数据传入组件。

看起来一切没有问题，实践之后发现了以下几个致命问题

**问题一：怎么控制自定义组件的展示与否**？

**正常逻辑**：在鼠标移入某个节点的时候展示，移出某个节点的时候消失；这个可以通过监听鼠标移入移出事件`echartsInstance.on('mouseover')、echartsInstance.on('mouseout')`实现

**实践结果**：鼠标移动到节点，自定义组件能正常展示，但是当鼠标从节点移动到自定义组件上时，自定义组件直接消失了😅 原因你应该可以猜到是：当鼠标从节点移动到自定义组件上的时候就已经触发移出事件`echartsInstance.on('mouseout')`了，因为自定义组件是ECharts之外的部分

**解决方法**：增加自定义tooltip组件的移入移出事件，用一个变量标识tooltip是否正在显示，并且对鼠标的移入移出加setTimeout，保证先触发tooltip的移入事件，再触发`echartsInstance.on('mouseout')`事件，并在此判断如果tooltip正在显示的时候就不隐藏tooltip组件

**问题二：移动到自定义组件时，该节点的高亮会失效**

上面解决了组件的展示问题，但是选中节点的高亮还有问题，如下图\
还是同样的原因，但是当你鼠标移动到组件上的时候就已经离开ECharts了；需要用[echartsInstance.](https://echarts.apache.org/zh/api.html#echartsInstance)[dispatchAction](https://echarts.apache.org/zh/api.html#echartsInstance.dispatchAction)主动高亮，只要在显示tooltip组件的时候都需要高亮，隐藏的时候就取消高亮

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2e0c2539dc2f4086895e4c515ede952b~tplv-k3u1fbpfcp-watermark.image?)

> 理论上这个方案是可以实现的，我这里没用方案一，具体代码实现就不展开

#### **2、思路二**

有没有办法在tooltip里面直接写react组件？

我们知道`formatter`不能直接返回组件，可以返回一个html片段。那怎样的html片段可以渲染出组件呢，所以想到用ReactDOM.render去渲染jsx并挂载到`formatter`返回的html上，如下代码所示

```js
formatter(params) {
  setTimeout(() => {
    const root = document.getElementById(`tool-tip`);
    if (root) {
      ReactDOM.render(
        <EChartToolTips
          data={params}
        />,
        root
      );
    }
  }, 0);
  return `<div id="tool-tip"></div>`;
}
```

tooltip是ECharts内置实现的，配上[tooltip.enterable](https://echarts.apache.org/zh/option.html#tooltip.enterable)设置为true时，当鼠标移动到tooltip组件上时，是不会触发移出事件`echartsInstance.on('mouseout')`的；节点高亮也不会消失。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f62ea63229f44c92bef589ecccb52728~tplv-k3u1fbpfcp-zoom-1.image)

#### **3、饼图、柱状图** **tooltip** **问题**

自定义tooltip，折线图实现下来基本没啥问题，但在饼图、折线图中暴露了问题：\
鼠标放在节点上，从节点移动到tooltip组件上的时候，组件一直跟着鼠标位置在动，导致不能顺利的移动到react组件。

仔细观察发现原因是ECharts默认的tooltip位置会与鼠标位置x、y都有一段距离，如下图，红点是鼠标位置，而tooltip位置总在鼠标位置的一定距离，如下图（分别来自ECharts官方示例的折线图、柱状图）。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/65ee339a2a2841359abc5b2a2ab5446f~tplv-k3u1fbpfcp-watermark.image?)
**为什么折线图没有问题，饼图、柱状图却有问题呢？**\
折线图的节点“很小”，选中节点之后，移动到tooltip的过程中不会有其他行为；而柱状图和饼图，整个“面积”都是“节点范围”，也就是说当你在饼图、柱状图位置上移动的时候，tooltip的位置也跟着移动，导致不能顺利的移动到tooltip上。

**解决思路**：自定义tooltip的位置，将tooltip正好放在鼠标的旁边，这样从节点异动到tooltip组件就可以无缝衔接

> 解决方案使用到的属性同下面的1.3被遮挡问题，1.3一起讲代码实现

### 1.3 如何解决tooltip展示被遮挡的问题

#### **1、问题暴露**

如图下图所示

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3537844d9a0b4aecbeaa6093bb4f8e0b~tplv-k3u1fbpfcp-watermark.image?)
ECharts本身其实已经处理了tooltip**位置自适应**的问题（但我发现有时候也会出现不准被遮挡的情况，概率虽然不大），自定义了tooltip组件后，位置自适应不准问题更加明显；

自定义tooltip组件其实又分为以下两种场景
- 场景一：自定义**tooltip组件**，tooltip组件的宽高是固定的，不会发生变化
- 场景二：自定义**tooltip组件**，组件在不同情况下，大小不一样，也就说tooltip的宽高可能变化

**尝试解决方案**：按理来说两种场景都可以借助属性[tooltip.extraCssText](https://echarts.apache.org/zh/option.html#tooltip.extraCssText)将tooltip的宽高定义为react组件实际的宽高，场景二根据条件给[tooltip.extraCssText](https://echarts.apache.org/zh/option.html#tooltip.extraCssText)设置不同的宽高，这样在渲染的时候tooltip就会以定义的宽高来自适应位置

**实践结果**：理想很美好，现实很残酷；本身tooltip的自适应可能就不准，自定义tooltip之后更不准；[tooltip.extraCssText](https://echarts.apache.org/zh/option.html#tooltip.extraCssText)属性也没有使的被遮挡的概率减少

##### **2、解决思路**
有没有支持控制tooltip位置的属性呢？让tooltip一直保持在鼠标的**右上方**，如果**在右边要溢出就适量右移一定位置**。

[tooltip.](https://echarts.apache.org/zh/option.html#tooltip) [position](https://echarts.apache.org/zh/option.html#tooltip.position) 这个属性是可以支持的，参数如下

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2125193002fa4a92a9f440e864adb597~tplv-k3u1fbpfcp-zoom-1.image)

**x坐标**：

-   `ECharts当前容器的宽度size.viewSize[0]` - `鼠标在ECharts上的x坐标point[0]` < `tooltip组件的宽度`
    -   否：直接返回`鼠标在ECharts上的x坐标point[0]`即可
    -   是：说明tooltip的x坐标需要往右移动，否则会溢出被隐藏
        -   向右移动的距离是 `鼠标在ECharts上的x坐标point[0] + tooltip组件的宽度 - ECharts当前容器的宽度size.viewSize[0]` ，所以x坐标为：`鼠标在ECharts上的x坐标point[0] - 向右移动的距离`，其实就是`ECharts当前容器的宽度size.viewSize[0] - tooltip组件的宽度`

**y坐标**：
固定在上方，计算就很简单了：`鼠标在ECharts上的y坐标point[1] -tooltip组件的高度`

**代码实现**

> 因为我这里的业务场景，tooltip有三种不同的情况，有三种不同的宽高

```js
position(point, params, dom, rect, size) {
  if (isViewNote) {
    if (size.viewSize[0] - point[0] < toolTipFromStyle.width) {
      return [
        point[0] - (point[0] + toolTipFromStyle.width - size.viewSize[0]),
        point[1] - toolTipFromStyle.height,
      ];
    } else {
      return [point[0], point[1] - toolTipFromStyle.height];
    }
  } else {
    if (size.viewSize[0] - point[0] < toolTipDataStyle.width) {
      return [
        point[0] - (toolTipDataStyle.width + point[0] - size.viewSize[0]),
        point[1] - toolTipDataStyle.height - toolTipDataStyle.itemHeight * detail.trends.length,
      ];
    } else {
      return [
        point[0],
        params.componentSubType === 'pie' || params.componentSubType === 'bar'
          ? point[1] - toolTipDataStyle.height
          : point[1] - toolTipDataStyle.height - toolTipDataStyle.itemHeight * detail.trends.length,
      ];
    }
  }
},
```

## 二、markPoint

### 2.1 markPoint属性的作用

用来标注某个特殊的节点，看以下ECharts官方示例，比如说标注最大值节点、最小值节点（如下图一），比如说有某个值的节点（如图二）

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a97dbdb7e4374fa2b42a74bd70a9b2a9~tplv-k3u1fbpfcp-watermark.image?)

#### 2.2 如何自定义markPoint图标

> 需求背景：折线图的节点上有a字段时，展示A图标；没有a字段的点击该节点出现B的图标

可以看到下面的`markPoint`形态都不一样，不同场景下的图标不一样，不同颜色折线图上的图标颜色也不一样。
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e89d3ac526ce47839b60bb287418da12~tplv-k3u1fbpfcp-watermark.image?)

**markPoint.symbol**支持自定义图标

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/64f5d3b7613a43848a14903fdf895777~tplv-k3u1fbpfcp-zoom-1.image)

在[官网](https://echarts.apache.org/zh/option.html#series-line.markPoint.symbol)试一试，可以看到如果是矢量路径，ECharts对于矢量路径本身已经处理了图标自适应折线图颜色，但是仅仅使用图标比较简单的情况下是可以的，如果图标太复杂，矢量路径会丢失部分节点，如下图

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/339f6dce75ae4574a6827e4d6e48c946~tplv-k3u1fbpfcp-zoom-1.image)

跟UI沟通后，确实替换成简单的图标达不到想要的效果，所以最后使用`image://`路径根据颜色、状态去判断是否展示图标、展示什么样的图标；用`symbolSize`、`symbolOffset`属性去调整不同图标的大小。

配置在哪个`symbol`？

-   如果只有一种类型的图标（也就是说图标跟节点数据无关，无论什么情况图标都长一样），`markPoint.symbol`配置即可

<!---->

-   如果只有有多种类型的图标，遍历`markPoint.data`，在`markPoint.data.symbol`根据data状态展示不同图标

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fbd7a4cbbde046fab785cd014a3f9d77~tplv-k3u1fbpfcp-zoom-1.image)

#### 2.3 如何按条件在正确的位置上显示正确的markPoint

图标类型的问题在2.2中解决了，但是想要图标展示在正确位置上（在哪个节点上）应该怎么实现呢？不同的图实现方式有些不一样。

从官网可以看到我们可以通过配置`markPoint.data`来控制哪些节点展示图标，有以下几种方式

-   [type](https://echarts.apache.org/zh/option.html#series-line.markPoint.data.type)属性：特殊的标注类型，用于标注最大值最小值等。只适用于特殊场景

<!---->

-   [coord](https://echarts.apache.org/zh/option.html#series-line.markPoint.data.coord)属性：坐标系中的坐标

<!---->

-   [x](https://echarts.apache.org/zh/option.html#series-line.markPoint.data.x)、[y](https://echarts.apache.org/zh/option.html#series-line.markPoint.data.y)属性：相对容器的屏幕的坐标，单位像素

**1、折线图、柱状图如何确定markPoint位置**
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1edbadbf040c46a19cb72165ee3e71dc~tplv-k3u1fbpfcp-watermark.image?)
利用[coord](https://echarts.apache.org/zh/option.html#series-line.markPoint.data.coord)属性，遍历data，x坐标直接取dataIndex即可，y坐标(高度)即该节点的值

```
markPoint: {
    data: item.data.map((dataItem: any, dataIndex: number) => ({
      coord: [dataIndex, dataItem.trendValue],
    })),
  }
```

**2、饼图如何确定markPoint位置**

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c7f667570a854be695a2fd3fb3a3dba3~tplv-k3u1fbpfcp-watermark.image?)

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4820d27c8a6248a7bb6fda672a9e3f1b~tplv-k3u1fbpfcp-watermark.image?)

饼图继续使用`coord: [dataIndex, dataItem.trendValue]`，图标压根都不显示了。思考一下，确实饼图没有坐标系，无论将coord设置成什么值都显示不出来，尝试设置x、y坐标，图标可以显示出来，但是x、y值应该怎么算出来让人头疼。

搜索到[issue](https://github.com/apache/echarts/issues/1063)，最终是先让饼图渲染，渲染后拿到`labelLine`开始位置的x、y坐标，赋值给饼图的`markPoint.data`的x，y坐标，再渲染

```js
myChart.setOption(Object.assign(getBarEChartOption(), options));
const xYAxis = myChart._chartsMap[Object.keys(myChart?._chartsMap)[0]]?.group?._children?.map((item) => item?.textGuideLineConfig?.anchor) || [];
const options2 = Object.assign(
  getPieEChartOption(xYAxis),
  options,
);
myChart.setOption(options2);
```

#### 2.4 如何主动高亮markPoint

**不要试图通过** **API** **高亮markPoint，而是按照条件加载不同的symbol来表示markPoint高亮**

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6dfde647648c408e9d915de6f45dc049~tplv-k3u1fbpfcp-watermark.image?)

[echartsInstance.dispatchAction](https://echarts.apache.org/zh/api.html#echartsInstance.dispatchAction)这个API提供了控制tooltip显示的API等，通过配置如下图所示参数，确定高亮哪个节点。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7623a3b9039b40f080c3d58d4e084a5e~tplv-k3u1fbpfcp-zoom-1.image)

但是是无法高亮markPoint的！！我在这配置了很久，最后发现需要换一个思路：去**替换** **`markPoint.data.symbol`** **的图片，用数据条件判断是否高亮**。

上述是主动高亮，还有`markPoint`hover高亮，通过配置`markPoint.data.emphasis.itemStyle`一般都能满足需求，如下右图是hover高亮。

```
emphasis: {
  itemStyle: {
    borderColor: '#fff',
    borderWidth: 2,
    shadowBlur: 4,
    shadowColor: chartColors[0],
  },
},
```
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5898e5fb3f9845539e31336be89af857~tplv-k3u1fbpfcp-watermark.image?)
## 三、结合图表事件

#### 3.1 如何实现markPoint与非markPoint显示的tooltip不同

> 需求背景：有A字段（有markPoint）如下左图，无A字段（无markPoint）如下右图

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/68c94ac0d91c40efa6888651d99f2510~tplv-k3u1fbpfcp-watermark.image?)

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/023be3cc1dda4e0c90f780558fc4570c~tplv-k3u1fbpfcp-watermark.image?)

我们已经自定义了tooltip为react组件，可以传props即可，通过[echartsInstance.on](https://echarts.apache.org/zh/api.html#echartsInstance.on)可以监听鼠标移入移出，`params.componentType`可以区分选中的是否是`markPoint`，`visibleNote`变化后，[echartsInstance.setOption](https://echarts.apache.org/zh/api.html#echartsInstance.setOption)重新渲染，这样tooltip的react组件，就能拿到最新的状态

```
useEffect(() => {
    myChart.on('mouseover', function (params) {
        if (params.componentType === 'markPoint') {
          setIsPrize(true);
        }
      });

      myChart.on('mouseout', function (params) {
        setIsPrize(false);
      });
  }, []);
```

**注意：此场景下还必须设置** **[tooltip.trigger](https://echarts.apache.org/zh/option.html#tooltip.trigger)** **为** **`item`**

折线图多线条如果配置为axis，上述监听到的**params**是一个数组 **，** 你是无法知道鼠标具体划入了哪个节点的；设置**[tooltip.trigger](https://echarts.apache.org/zh/option.html#tooltip.trigger)** **为axis**通常是想看到同一个x轴上的多个y轴的点，可以自己通过数据拼装（也就是自己去拿一下该节点x坐标上所有的数据，二维数组好拿）实现

| 默认值    | 可选值           | 效果          |
| ------ | ------------- | ----------- |
| ‘item’ | ‘item’,’axis’ | 触发类型，默认数据触发 |

-   为’item’时只会显示该点的数据

<!---->

-   为’axis’时显示该列下所有坐标轴所对应的数据 如下所示

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8486d66d02b842a38d1c38c833ab2479~tplv-k3u1fbpfcp-zoom-1.image)

#### 3.2 如何实现点击某个节点出现指定markPoint icon

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1cd92607a29040d2a4ca8f103b424c15~tplv-k3u1fbpfcp-watermark.image?)

[echartsInstance.on](https://echarts.apache.org/zh/api.html#echartsInstance.on)监听鼠标点击事件，通过params拿到的值拼装然后重新调用，`activeNode`变化后，[echartsInstance.setOption](https://echarts.apache.org/zh/api.html#echartsInstance.setOption)重新渲染，这样tooltip的react组件，就能拿到最新的数据；然后上述降到的symbol里面根据数据按条件加载不同的图标。

```
chartRef.on('click', function (params: any) {
  if (!(!isAddNote && params.componentType !== EChartComponentTypeEnum.MARKPOINT)) {
    setIsSelectNote(true);
    setActiveNode({
      minutes: params.data.minutes,
      noteType: params.data.noteType,
      noteStr: params.data.note?.noteStr,
      id: params.data.note?.id,
      value: params.data.value,
      name: params.name,
      color: params.data?.color || params.color,
      backgroundColor: params.data.backgroundColor,
    });
  }
});
```

**注意：** 单根线折线图、柱状图、饼图用一个唯一标识即可，多条线折线图如果没有唯一标识，需要拿多个值作为唯一标识，比如这里拿了代表x坐标的事件，以及折线类型

#### 3.3 如何实现图表可视区域变化自适应

通过[echartsInstance.getWidth](https://echarts.apache.org/zh/api.html#echartsInstance.getWidth)拿到ECharts 实例容器的宽度，容器需要变化时调用[echartsInstance.resize](https://echarts.apache.org/zh/api.html#echartsInstance.resize)传入变化后的`width`即可

```
  useUpdateEffect(() => {
    if (isLiveNowDrawerOpen !== undefined) {
      const chartWidth = chartRefs.current[0].current.getWidth();
      [...Array(6).keys()].forEach(index => {
        chartRefs.current[index].current.resize({ width: isLiveNowDrawerOpen ? chartWidth - 300 : chartWidth + 300 });
      });
    }
  }, [isLiveNowDrawerOpen]);
```

## 四、其他case

#### 4.1 柱状图

##### **1、问题一**

当tooltip.trigger设置为item时，柱状图数值太小，或者为0时，鼠标上去展示不出tooltip，可以设置`series.barMinHeight`，设置最小高度，并且给一个默认的灰色


![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/33bb452b91444703a9f094931261ecf9~tplv-k3u1fbpfcp-watermark.image?)

##### **2、问题二**

柱状图想要y轴想要展示百分比，如上图

-   如果你什么都不处理，ECharts的自适应，会存在Y轴刻度大于`100%`的情况；

<!---->

-   不要尝试直接修改`yAxis`，比如固定成`0% 25% 50% 75% 100%`，会存在值与刻度对不上的情况，因为值还在以数值为标准展示Y轴

<!---->

-   可以直接把`data.value`换算成百分比的值，然后Y轴直接展示`{value}%`

```
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
    
value: parseFloat(((dataItem.value / total) * 100).toFixed(2)) // 保留两位有效小数
```

#### 4.2 饼图

##### **1、一个demo**

label可自定义样式

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/da25e6ab228442148847581f5c7f9eac~tplv-k3u1fbpfcp-watermark.image?)
```
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
```

## 五、一些问题

- 5.1 在form表单输入时，不能刷新渲染表单（轮循环数据），会导致输入清空，需要控制输入时，停止轮训
