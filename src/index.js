const dscc = require('@google/dscc');
const viz = require('@google/dscc-scripts/viz/initialViz.js');
const local = require('./localMessage.js');
const Plotly = require('plotly.js-dist');

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = true;

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

/**
 * get color from datastudio theme if themeSeries is specified, otherwise return color from plotly theme
 * 
 * @param {int} numOfColor 
 * @param {Array} themeSeries Theme from datastudio
 * @returns 
 */
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


class Data {
  constructor(raw, cDim = null, metric = null) {
    this.raw = raw;
    this.cDim = cDim;
    this.metric = metric;
    this.traces = this._parseData(this.cDim, this.metric);
    this.length = this.traces.length;
    this.cats = this.traces.map((d) => d['name']);
    this.elements = null;
    this.selectedTraces = [];
    for (let i in this.length) { this.selectedTraces.push(true) }
  }
  _parseData(cDim = 'cDim', metric = 'histData') {
    if (this.raw[0] && this.raw[0][cDim]) {
      const traces = {}
      this.raw.forEach((row) => {
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
        x: this.raw.map((row) => row[metric][0])
      }]
    }
  }

  assignColorMap(colorMap, themeSeries) {

    if (!colorMap) {
      let tempColor = getDefaultColors(this.length, themeSeries);
      colorMap = {};
      this.cats.forEach((d, i) => { colorMap[this.cats[i]] = tempColor[i] })
    }
    for (let i in this.traces) {
      this.traces[i]['marker']['color'] = colorMap[this.traces[i]['name']];
    }
  }

  assignOpacity(opacity) {
    for (let i in this.traces) {
      this.traces[i]['opacity'] = opacity
    }
  }

  setFocusTrace(idx) {
    for (let i in this.length) {
      this.selectedTraces[i] = false
    }
    this.selectedTraces[idx] = true
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
  const data = new Data(records['tables']['DEFAULT'], 'cDim', 'histData');

  // process style in data
  let style = records['style'];
  let colorMap = style['colorMap']['value'] ? JSON.parse(records['style']['colorMap']['value']) : null;
  let opacity = style['opacity']['value'] ? records['style']['opacity']['value'] : records['style']['opacity']['defaultValue'];

  data.assignColorMap(colorMap, records['theme']['themeSeriesColor'].map((d) => d['color']));
  data.assignOpacity(opacity)
  // layout
  const layout = {
    showlegend: true,
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
  Plotly.newPlot(dataviz, data.traces, layout, { responsive: true });
  dataviz.on('plotly_legenddoubleclick', function (event) {
    console.log(event);
  })

  data.elements = document.getElementsByClassName('traces');
};


// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
}
