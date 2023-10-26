const dscc = require('@google/dscc');
const viz = require('@google/dscc-scripts/viz/initialViz.js');
const local = require('./localMessage.js');
const Plotly = require('plotly.js-dist');

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
  var dataviz = document.getElementById('my_dataviz')
  if (!dataviz) {
    dataviz = document.createElement('div');
    dataviz.setAttribute('id', 'my_dataviz');
    document.body.appendChild(dataviz);
  }
  // process data
  const xDim = records['tables']['DEFAULT'].map((a) => a['xDim'][0]);
  const data = [{
    type: 'histogram',
    marker: {
      color: 'green',
    },
    x: xDim
  }]
  const layout = {
    yaxis: { title: 'Count' },
    // width: width,
    // height: height,
    margin: {
      l: 0.1 * width,
      r: 0.05 * width,
      b: 0.05 * height,
      t: 0.1 * height
    }
  }

  // plot
  Plotly.newPlot(dataviz, data, layout, { responsive: true });
  console.timeEnd("test_timer");
};


// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
}
