import axios from "axios";
import { SET_STOCK_WEIGHTS } from "./actions";
import Auth from "../utils/auth";
// const pyBackEnd = "https://pern-portfolio-backend-805cd64a428d.herokuapp.com";

const pyBackEnd = "http://127.0.0.1:8000"

export const indexOptions = {
  "SP500": "^GSPC",
  "Dow Jones": "^DJI",
  "Nasdaq": "^IXIC",
  "Russell 2000": "^RUT",
  "S&P 400 Mid Cap": "^MID",
  "S&P 600 Small Cap": "^SML",
  "S&P 100": "^OEX",
  "S&P 500 Growth": "^SGX",
  "S&P 500 Value": "^SVX",
  "S&P 500 High Beta": "^SPHB",
  "S&P 500 Low Volatility": "^SPLV",
  "S&P 500 High Quality": "^SPHQ",
  "Wilshire 5000": "^W5000",
  "NYSE Composite": "^NYA",
  "NYSE American Composite": "^XAX",
  "Unemployment Rate": "UNRATE",
  "Consumer Price Index": "CPIAUCSL",
  "Producer Price Index": "PPIACO",
  "Federal Funds Rate": "FEDFUNDS",
  "Volatile Index": "VIXCLS",
  "Economic Policy Uncertainty Index": "USEPUINDXD",
};

export async function stockData(stockSymbol, startDate, endDate) {
  const response = await axios.get(
    `${pyBackEnd}/stockgraph`,

    {
      params: {
        symbol: stockSymbol,
        start: startDate,
        end: endDate,
      },
    }
  );
  return response.data;
}
export async function stockInfo(stockSymbol) {
  const response = await axios.get(`${pyBackEnd}/stockinfo`, {
    params: {
      symbol: stockSymbol,
    },
  });
  return response.data;
}

export async function linReg(stockSymbol, searchIndex, startDate, endDate, weights) {
  console.log(stockSymbol, searchIndex, startDate, endDate, weights);
  const response = await axios.get(`${pyBackEnd}/linreg`, {
    params: {
      stocks: stockSymbol,
      index: searchIndex,
      start: startDate,
      end: endDate,
      stockWeights: weights,

    },
  });
  return response.data;
}

export async function stockSearch(query) {
  const response = await axios.get(
    `https://eodhd.com/api/query-search-extended/`, {
    params : {
      q: query,
      api_token: "65431c249ef2b9.93958016",
    }
});


  return response.data;
}

export async function getStockWeights(stockNumbers) {
  const response = await axios.get(`${pyBackEnd}/stockweights`, {
    params: {
      stocks: stockNumbers,
    },
  });
  return response.data;
}

export async function getStockWeightsIdb() {
  const response = await idbPromise("stockWeights", "get");
  return response;
}

export async function getCompanyFinancials(stockSymbol, quarterly) {
  const response = await axios.get(`${pyBackEnd}/financials`, {
    params: {
      symbol: stockSymbol,
      quarterly: quarterly,
    },
  });
  let data = response.data;
  for (let key in data) {
    data[key] = JSON.parse(data[key]);
    data[key].sort((a, b) => new Date(b.asOfDate) - new Date(a.asOfDate));
  }
  return data;
}

export async function getFamaFrenchData(startDate, endDate, stockWeights) {
  console.log("stockWeights", stockWeights, startDate, endDate);
  const response = await axios.get(`${pyBackEnd}/famafrench`, {
    params: {
      stockWeights: stockWeights,
      start: startDate,
      end: endDate,
    },
  });
  return response.data;
}

export function idbPromise(storeName, method, object) {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(storeName, 1);

    let db, tx, store;

    request.onupgradeneeded = function (e) {
      const db = request.result;
      if (storeName === "stockWeights") {
        db.createObjectStore("stockWeights", { keyPath: "portfolio_id" });
      } else if (storeName === "financials") {
        db.createObjectStore("financials", { keyPath: "symbol" });
      }

    };

    request.onerror = function (e) {
      console.log("There was an error");
    };
    request.onsuccess = function (e) {
      db = request.result;
      tx = db.transaction(storeName, "readwrite");
      store = tx.objectStore(storeName);

      db.onerror = function (e) {
        console.log("error", e);
      };

      if (method === "put") {
        store.put(object);
        resolve(object);
      } else if (method === "get") {
        const all = store.getAll();
        all.onsuccess = function () {
          resolve(all.result);
        };
      } else if (method === "delete") {
        store.clear();
        console.log("deleted");
        resolve();
      }

      tx.oncomplete = function () {
        db.close();
      };
    };
  });
}

export async function getStockObject(
  userData,
  stockData,
  dispatch,
  setStockWeights
) {
  const data = await stockData;
  const stockObjects = await data.stock;
  const promises = stockObjects.map(async (stockObject) => {
    return {
      [stockObject.stock_symbol]: stockObject.stock_quantity,
    };
  });
  const stockNumbersArray = await Promise.all(promises);
  let stockNumbers = Object.assign({}, ...stockNumbersArray);
  stockNumbers = JSON.stringify(stockNumbers);
  console.log("stockNumbers", stockNumbers);
  const stockWeights = await getStockWeights(stockNumbers);
  if (stockWeights && Auth.loggedIn()) {
    try {
      stockWeights["portfolio_id"] = userData?.user?.id;
      idbPromise("stockWeights", "put", {
        ...stockWeights,
        portfolio_id: userData?.user?.id,
      });
      dispatch({
        type: SET_STOCK_WEIGHTS,
        payload: stockWeights,
      });
      
    } catch (err) {
      console.log(err);
    }
  }
  setStockWeights(stockWeights);

}

export async function setStockGraph(data)
{
  const dataPoints = [];
  for (var i = 0; i < data.length; i++) {
    dataPoints.push({
      x: new Date(data[i].Date),
      y: {"open": Number(data[i].Open), "high": Number(data[i].High), "low": Number(data[i].Low), "close": Number(data[i].Close), "volume": Number(data[i].Volume)}
    });
  }
  return dataPoints; 
}


export async function setGraphOptions(theme, stockName, data, stockSymbol) {
  const options = {
    theme: theme,
    title: { text: `${stockName} Stock Price and Volume` },
    subtitles: [{ text: "Price-Volume Trend" }],
    charts: [
      {
        axisX: {
          lineThickness: 5,
          tickLength: 0,
          labelFormatter: function () {
            return "";
          },
          crosshair: {
            enabled: true,
            snapToDataPoint: true,
            labelFormatter: function () {
              return "";
            },
          },
        },
        axisY: {
          title: "Stock Price",
          prefix: "$",
          tickLength: 0,
        },
        toolTip: {
          shared: true,
        },
        data: [
          {
            name: "Price (in USD)",
            yValueFormatString: "$#,###.##",
            type: "candlestick",
            color: "#049C",
            dataPoints: data.map((point) => {
              return {
                x: new Date(point.Date),
                y: [point.Open, point.High, point.Low, point.Close],
              };
            }
            ),

          },
        ],
      },
      {
        height: 100,
        axisX: {
          crosshair: {
            enabled: true,
            snapToDataPoint: true,
          },
        },
        axisY: {
          title: "Volume",
          prefix: "$",
          tickLength: 0,
        },
        toolTip: {
          shared: true,
        },
        data: [
          {
            color: "#049C",
            name: "Volume",
            yValueFormatString: "$#,###.##",
            type: "column",

            dataPoints: data.map((point) => {
              return {
                x: new Date(point.Date),
                y: point.Volume,
              };
            }
            ),
          },
        ],
      },
    ],
    navigator: {
      data: [
        {
          color: "white",
          fillOpacity: 0.4,
          indexLabel: "",
          dataPoints: data.map((point) => {
            return {
              x: new Date(point.Date),
              y: point.Close,
            };
          }
          ),
          type: "area",
        },
      ],
      slider: {
        minimum: new Date("2022-05-01"),
        maximum: new Date("2022-07-01"),
        fontColor: "white",
        indexLabelFontColor: "white",
        //
      },
    },
  };
return options;
}
  


