/**
 * This file provides the mock "data" received
 * by your visualization code when you develop
 * locally.
 *
 */

const n = 100
export var message = { tables: { DEFAULT: [] } }
for (let i = 0; i < n; i++) {
  message.tables.DEFAULT.push({
    // xDim: [dateToString(new Date(i * 24 * 3600000 + 1697414400000))],
    xDim: [Math.random() * 100],
    yDim: [Math.random() * 100],
  })
};

