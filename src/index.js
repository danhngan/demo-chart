const dscc = require('@google/dscc');
const viz = require('@google/dscc-scripts/viz/initialViz.js');
const local = require('./localMessage.js');
const Plotly = require('plotly.js-dist');
const dateToString = function (dateValue) {
  const day = dateValue.toLocaleString('en-US', { day: '2-digit' });
  const month = dateValue.toLocaleString('en-US', { month: '2-digit' });
  const year = dateValue.toLocaleString('en-US', { year: '2-digit' });
  return '20' + year + month + day
};

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = true;

const getWindowSize = function () {
  return { width: dscc.getWidth(), height: dscc.getHeight() }
}

// write viz code here
const drawViz = (records) => {
  console.time("test_timer");

  // create chart space
  const { width, height } = getWindowSize();
  console.log(width, height);
  const dataviz = document.createElement('div');
  dataviz.setAttribute('id', 'my_dataviz');
  document.body.appendChild(dataviz);

  // process data
  const xDim = records['tables']['DEFAULT'].map((a) => a['xDim'][0]);
  const yDim = records['tables']['DEFAULT'].map((a) => a['yDim'][0]);
  const data = [{
    type: 'scatter',
    mode: 'markers',
    x: xDim,
    y: yDim
  }]
  const layout = {
    xaxis: { title: 'metricOne', color: 'blue' },
    yaxis: { title: 'metricTwo', color: 'blue' },
    width: width,
    height: height,
    margin: {
      l: 0.05 * width,
      r: 0.05 * width,
      b: 0.05 * height,
      t: 0.1 * height
    }
  }

  // plot
  Plotly.newPlot(dataviz, data, layout,
    { showSendToCloud: true });
  console.timeEnd("test_timer");
};


// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
}
