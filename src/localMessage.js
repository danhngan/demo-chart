/**
 * This file provides the mock "data" received
 * by your visualization code when you develop
 * locally.
 *
 */

const dateToString = function (dateValue) {
  const day = dateValue.toLocaleString('en-US', { day: '2-digit' });
  const month = dateValue.toLocaleString('en-US', { month: '2-digit' });
  const year = dateValue.toLocaleString('en-US', { year: '2-digit' });
  return '20' + year + month + day
};
const n = 10
export var message = { tables: { DEFAULT: [] } }
for (let i = 0; i < n; i++) {
  message.tables.DEFAULT.push({
    dimID: [dateToString(new Date(i * 24 * 3600000 + 1697414400000))],
    metricID: [Math.random() * 1000]
  })
};
// export const message = {
//   tables: {
//     DEFAULT: [
//       {
//         dimID: ['25-54'],
//         metricID: [128863172],
//       },
//       {
//         dimID: ['0-14'],
//         metricID: [61175933],
//       },
//       {
//         dimID: ['65+'],
//         metricID: [51055052],
//       },
//       {
//         dimID: ['15-24'],
//         metricID: [43351778],
//       },
//       {
//         dimID: ['55-64'],
//         metricID: [42179856],
//       },
//     ],
//   },
//   fields: {
//     dimID: [
//       {
//         id: 'qt_nzqx6a0xvb',
//         name: 'Age Group',
//         type: 'TEXT',
//         concept: 'DIMENSION',
//       },
//     ],
//     metricID: [
//       {
//         id: 'qt_8isx6a0xvb',
//         name: 'Population',
//         type: 'NUMBER',
//         concept: 'METRIC',
//       },
//     ],
//   },
//   style: {},
// };
