/**
 * This file provides the mock "data" received
 * by your visualization code when you develop
 * locally.
 *
 */

const n = 1000
export var message = { tables: { DEFAULT: [] } };
message['theme'] = {
  themeSeriesColor: [
    {
      "color": "#0072f0",
      "seriesRef": {
        "index": 0
      },
      "themeRef": {
        "index": 4
      }
    },
    {
      "color": "#00b6cb",
      "seriesRef": {
        "index": 1
      },
      "themeRef": {
        "index": 5
      }
    },
    {
      "color": "#f10096",
      "seriesRef": {
        "index": 2
      },
      "themeRef": {
        "index": 6
      }
    },
    {
      "color": "#f66d00",
      "seriesRef": {
        "index": 3
      },
      "themeRef": {
        "index": 7
      }
    },
    {
      "color": "#ffa800",
      "seriesRef": {
        "index": 4
      },
      "themeRef": {
        "index": 8
      }
    },
    {
      "color": "#7cb342",
      "seriesRef": {
        "index": 5
      },
      "themeRef": {
        "index": 9
      }
    },
    {
      "color": "#5e35b1",
      "seriesRef": {
        "index": 6
      }
    },
    {
      "color": "#03a9f4",
      "seriesRef": {
        "index": 7
      }
    },
    {
      "color": "#ec407a",
      "seriesRef": {
        "index": 8
      }
    },
    {
      "color": "#ff7043",
      "seriesRef": {
        "index": 9
      }
    },
    {
      "color": "#737373",
      "seriesRef": {
        "index": 10
      }
    },
    {
      "color": "#f15a60",
      "seriesRef": {
        "index": 11
      }
    },
    {
      "color": "#7ac36a",
      "seriesRef": {
        "index": 12
      }
    },
    {
      "color": "#5a9bd4",
      "seriesRef": {
        "index": 13
      }
    },
    {
      "color": "#faa75a",
      "seriesRef": {
        "index": 14
      }
    },
    {
      "color": "#9e67ab",
      "seriesRef": {
        "index": 15
      }
    },
    {
      "color": "#ce7058",
      "seriesRef": {
        "index": 16
      }
    },
    {
      "color": "#d77fb3",
      "seriesRef": {
        "index": 17
      }
    },
    {
      "color": "#81d4fa",
      "seriesRef": {
        "index": 18
      }
    },
    {
      "color": "#f48fb1",
      "seriesRef": {
        "index": 19
      }
    }
  ]
}
message['style'] = {
  colorMap: {
    value: "{\"a\":\"#00ff00\",\"b\":\"#0000ff\",\"c\":\"#ff00ff\"}",
    defauleValue: ""
  }
}
const catValues = ['a', 'b', 'c'];
for (let i = 0; i < n; i++) {
  message.tables.DEFAULT.push({
    // xDim: [dateToString(new Date(i * 24 * 3600000 + 1697414400000))],
    xDim: [Math.random() * 100, Math.random() * 100, Math.random() * 100],
    cDim: [catValues[Math.floor(Math.random() * catValues.length)]],
    histData: [Math.random() * 100],
  })
};

