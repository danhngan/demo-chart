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

const delay = ms => new Promise(res => setTimeout(res, ms));

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

class Data {
  constructor(cDim = null, metric = null) {
    this.raw = null
    this.tableRaw = null;
    this.cDim = cDim;
    this.cDimFieldId = null;
    this.metric = metric;
    this.filter = null;
    this.traces = null;
    this.length = 0;
    this.cats = null;
    this.elements = null;
    this.selectedTraces = [];
  }

  assignNewData(raw) {
    this.raw = raw
    this.tableRaw = raw['tables']['DEFAULT'];
    this.cDimFieldId = this.getCDimFieldId();
    this.filter = this.getFilter();
    this.traces = this._parseData(this.cDim, this.metric);
    this.length = this.traces.length;
    this.cats = this.traces.map((d) => d['name']);
    this.elements = null;
    this.selectedTraces = [];
    for (let i in this.length) { this.selectedTraces.push(true) }
    // process style in data
    let style = raw['style'];
    let colorMap = style['colorMap']['value'] ? JSON.parse(raw['colorMap']['value']) : null;
    let opacity = style['opacity']['value'] ? style['opacity']['value'] : style['opacity']['defaultValue'];

    this.assignColorMap(colorMap, raw['theme']['themeSeriesColor'].map((d) => d['color']));
    this.assignOpacity(opacity)
  }

  updateData(raw) {

  }

  _parseData(cDim = 'cDim', metric = 'histData') {
    if (this.tableRaw[0] && this.tableRaw[0][cDim]) {
      const traces = {}
      this.tableRaw.forEach((row) => {
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
          x: traces[c],
          opacity: 1,
          visible: this.filter ? (this.filter.has(c) ? true : 'legendonly') : true
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
        x: this.tableRaw.map((row) => row[metric][0])
      }]
    }
  }
  getCDimFieldId() {
    if (this.cDim) {
      return this.raw['fields'][this.cDim][0]["id"]
    }
    return null
  }

  getFilter() {
    let data = this.raw['interactions']['filter']['value']['data'];
    if (data) {
      return new Set(data.values.map((d) => d[0]))
    }
    return null
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

  setElements(elements) {
    this.elements = elements
  }
  sendFilter(event) {
    if (this.cDim) {
      let filterData = {
        concepts: [this.cDimFieldId],
        values: []
      }

      // get focused traces
      for (let i in [...Array(this.elements.length).keys()]) {
        if (this.elements[i].style['opacity'] == 1) {
          filterData.values.push([this.cats[i]])
        }
      }
      if (filterData.values.length == this.cats.length) {
        dscc.clearInteraction('filter',
          dscc.InteractionType.FILTER
        )
      }
      else {
        dscc.sendInteraction('filter',
          dscc.InteractionType.FILTER,
          filterData
        )
      }
    }
  }
}

class MouseEventHandler {
  constructor() {
    this.queue = []
  }
  addEvent(event) {
    this.queue.push(event)
  }
  getEvent() {
    return this.queue.shift()
  }
  processEvent(data, funcName) {
    let event = this.getEvent();
    if (this.queue.length == 0) {
      data[funcName](event)
    }
  }

}
const { width, height } = getWindowSize();
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

const processLegendClick = function (data, queue) {
  return async function (event) {
    queue.addEvent(event);
    await delay(500);
    queue.processEvent(data, 'sendFilter')
  }
}

const data = new Data('cDim', 'histData')

// write viz code here
const drawViz = function (records) {
  // create chart space

  var dataviz = document.getElementById('my_dataviz');
  if (!dataviz) {
    dataviz = document.createElement('div');
    dataviz.setAttribute('id', 'my_dataviz');
    document.body.appendChild(dataviz)
  }
  data.assignNewData(records);

  let style = records['style']
  // style
  layout['title'] = TITLE_ATTRS;
  assignStyle(TITLE_ATTRS, style);

  layout['xaxis'] = X_AXIS_ATTRS;
  assignStyle(X_AXIS_ATTRS, style);

  layout['yaxis'] = Y_AXIS_ATTRS;
  assignStyle(Y_AXIS_ATTRS, style);

  // plot
  const queueMouseEvent = new MouseEventHandler();
  Plotly.newPlot(dataviz, data.traces, layout, { responsive: true });
  data.setElements(document.getElementsByClassName('traces'));
  dataviz.on('plotly_legendclick', processLegendClick(data, queueMouseEvent))
};

console.log('check if rerun')
// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
}
