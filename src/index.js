const dscc = require('@google/dscc');
const viz = require('@google/dscc-scripts/viz/initialViz.js');
const local = require('./localMessage.js');
const d3 = require('d3');

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = true;

const preProcessing = function (data) {
  return data.map((row) => { return { date: parseDate(row['dimID'][0]), value: row['metricID'][0] } })
};

const parseDate = function (d) {
  return d3.timeParse("%Y%m%d")(d)
};
const createChart = function (svg, data, width, height) {

  // Add X axis --> it is a date format
  var x = d3.scaleTime()
    .domain(d3.extent(data, function (d) { return d.date; }))
    .range([0, width]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(data, function (d) { return +d.value; })])
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add the line
  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function (d) { return x(d.date) })
      .y(function (d) { return y(d.value) })
    )

}
// write viz code here
const drawViz = (data) => {
  const div = document.createElement('div');
  div.setAttribute('id', 'my_dataviz');
  document.body.appendChild(div);


  var margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerWidth - margin.top - margin.bottom;
  console.log(window.innerHeight, window.innerWidth)
  // append the svg object to the body of the page
  var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  let data_ = preProcessing(data.tables.DEFAULT)
  createChart(svg = svg, data = data_, width = width, height = height)
};

// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
}
