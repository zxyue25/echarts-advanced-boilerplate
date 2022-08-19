export const chartColors = ['#025DF4', '#DB6BCF', '#2498D1', '#BBBDE6'];
export const toolTipFromStyle = {
  width: 370,
  height: 290,
  noBtnHeight: 240,
  noBtnWidth: 300,
};

export const toolTipDataStyle = {
  width: 160,
  height: 75,
  itemHeight: 20,
};

export const getMarkPointSymbol = (color) => {
  let imgUrl = 'none';
  imgUrl = `image://${require(`../assets/img/prize-${color.replace('#', '')}.png`)}`
  return imgUrl;
};

export const getMarkPointSymbolSize = (isActive = false, note = null) => {
  if (isActive) {
    return note ? [32, 44] : [38, 44];
  } else {
    return [24, 36];
  }
};

export * from './bar';
export * from './line';
export * from './pie';
