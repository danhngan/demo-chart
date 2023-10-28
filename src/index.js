const dscc = require('@google/dscc');
const viz = require('@google/dscc-scripts/viz/initialViz.js');
const local = require('./localMessage.js');
const Plotly = require('plotly.js-dist');

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = false;

const TITLE_ATTRS = { text: 'titleText', font: { family: 'titleFont', size: 'titleFontSize' } }
const X_AXIS_ATTRS = {
  title: {
    text: 'xAxisTitleText',
    font: { family: 'titleFont', size: 'axesTitleFontSize' }
  },
  tickfont: { family: 'titleFont', size: 'axesTitleFontSize' }
}
const Y_AXIS_ATTRS = {
  title: {
    text: 'yAxisTitleText',
    font: { family: 'titleFont', size: 'axesTitleFontSize' }
  },
  tickfont: { family: 'titleFont', size: 'axesTitleFontSize' }
}

const getWindowSize = function () {
  return { width: dscc.getWidth(), height: dscc.getHeight() }
}

const getDefaultColors = function (numOfColor, themeSeries = null) {
  if (themeSeries) {
    return themeSeries.slice(0, numOfColor)
  }
  else {
    return ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'].slice(0, numOfColor)
  }
}

const assignStyle = function (mapAttr, style) {
  for (let a in mapAttr) {
    if (typeof mapAttr[a] === 'string' && style[mapAttr[a]]) {
      mapAttr[a] = style[mapAttr[a]]['value'] ? style[mapAttr[a]]['value'] : style[mapAttr[a]]['defaultValue'];
    }
    else if (typeof mapAttr[a] === 'string') {
      mapAttr[a] = null
    }
    else if (typeof mapAttr === 'object') {
      assignStyle(mapAttr[a], style)
    }
  }
}

const getTraces = function (data, cDim = 'cDim', metric = 'histData') {
  if (data[0] && data[0][cDim]) {
    const traces = {}
    data.forEach((row) => {
      if (row[cDim] in traces) { traces[row[cDim]].push(row[metric][0]) }
      else { traces[row[cDim]] = [row[metric][0]] }
    }
    )
    const res = []

    for (let c in traces) {
      res.push({
        type: 'histogram',
        name: c,
        marker: {
          color: getDefaultColors(1)[0],
        },
        x: traces[c]
      })
    }
    return res
  }
  else {
    return [{
      type: 'histogram',
      name: '',
      marker: {
        color: getDefaultColors(1)[0],
      },
      x: data.map((row) => row[metric][0])
    }]
  }
}


// write viz code here
const drawViz = (records) => {

  // create chart space
  const { width, height } = getWindowSize();
  var dataviz = document.getElementById('my_dataviz');
  if (!dataviz) {
    dataviz = document.createElement('div');
    dataviz.setAttribute('id', 'my_dataviz');
    document.body.appendChild(dataviz)
  }
  // process data
  const data = getTraces(records['tables']['DEFAULT']);

  // process style in data
  let style = records['style'];
  let colorMap = style['colorMap']['value'] ? JSON.parse(records['style']['colorMap']['value']) : null;
  let opacity = style['opacity']['value'] ? records['style']['opacity']['value'] : records['style']['opacity']['defaultValue'];

  let cats = data.map((d) => d['name']);
  if (!colorMap) {
    let tempColor = getDefaultColors(data.length, records['theme']['themeSeriesColor'].map((d) => d['color']));
    colorMap = {};
    cats.forEach((d, i) => { colorMap[cats[i]] = tempColor[i] })
  }
  for (let i in data) {
    data[i]['marker']['color'] = colorMap[data[i]['name']];
    data[i]['opacity'] = opacity
  }
  // layout
  const layout = {
    barmode: 'overlay',
    // width: width,
    height: height,
    margin: {
      l: 0.1 * width,
      r: 0.05 * width,
      b: 0.1 * height,
      t: 0.1 * height
    }
  };

  // style
  layout['title'] = TITLE_ATTRS;
  assignStyle(TITLE_ATTRS, style);

  layout['xaxis'] = X_AXIS_ATTRS;
  assignStyle(X_AXIS_ATTRS, style);

  layout['yaxis'] = Y_AXIS_ATTRS;
  assignStyle(Y_AXIS_ATTRS, style);

  // plot
  console.log(records.interactions, records.colorMap)
  Plotly.newPlot(dataviz, data, layout, { responsive: true });

};


// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
}
