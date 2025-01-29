import axios from "axios";
import { SET_STOCK_WEIGHTS } from "./actions";
import Auth from "./auth";
import { indexOptions } from "./constants";
import React from "react";
import { userData } from "@/types/user";
import { StockObject, StockWeightNumber, StockGraphData, StockOverview, StockChartConfig, SearchParams, FormatterOptions } from "@/types/stocks";
// const pyBackEnd = "https://pern-portfolio-backend-805cd64a428d.herokuapp.com";

const pyBackEnd = "http://127.0.0.1:8000";
const nodeBackend = "http://localhost:3001"




export async function fetchStockStatistics(symbol : string) {
  try {
    const response = await axios.get(`${pyBackEnd}/stock-statistics`, {
      params: {
        symbol: symbol,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stock statistics:', error);
    throw error;
  }
}


export async function addStock(stockState : object) {
  try {
    const response = await axios.post(`${nodeBackend}/api/stocks`, stockState);
    return response.data;
  } catch (error) {
    throw new Error("Error adding stock");
  }
}

export async function addToWatchlist(stockSymbol : string, userId : string) {
  try {
    const response = await axios.post(`${pyBackEnd}/add-to-watchlist`, {
      stock_symbol: stockSymbol,
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    throw new Error("Error adding to watchlist");
  }
}

export async function createWatchlist(watchlistName : string, userId : string) {
  try {
    const response = await axios.post(`${pyBackEnd}/create-watchlist`, {
      name: watchlistName,
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    throw new Error("Error creating watchlist");
  }
}

export async function stockWatchlistSearch(query : string) {
  const response = await axios.get(
    `https://eodhd.com/api/query-search-extended/`,
    {
      params: {
        q: query,
        api_token: "65431c249ef2b9.93958016",
      },
    }
  );

  return response.data;
}

export async function getWatchlistInfo(stockSymbols: string[]) {
  try {
    const stockInfoPromises = stockSymbols.map(async (symbol : string ) => {
      const overview = await getStockOverview(symbol as string);
      return {
        stockSymbol: symbol,
        currentPrice: overview?.currentPrice,
        priceChange: overview?.priceChange,
        priceChangePercent: overview?.priceChangePercent,
        afterHoursPrice: overview?.afterHoursPrice,
        afterHoursChange: overview?.afterHoursChange,
        afterHoursChangePercent: overview?.afterHoursChangePercent,
      };
    });

    const stockInfos = await Promise.all(stockInfoPromises);
    return stockInfos;
  } catch (error) {
    console.error('Error fetching watchlist info:', error);
    return [];
  }
}

export async function getWatchlistRatios(stock : string) {
  const response = await axios.get(`${pyBackEnd}/ratios`, {
    params: {
      symbol: stock,
    },
  });
  return response.data;
}

export async function stockData(stockSymbol : string, startDate : string, endDate : string) {
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

export async function stockInfo(stockSymbol : string) {
  const response = await axios.get(`${pyBackEnd}/stockinfo`, {
    params: {
      symbol: stockSymbol,
    },
  });
  return response.data;
}


export async function linReg(searchParams : SearchParams, startDate : string, endDate : string, weights : object) {
  const index = indexOptions[searchParams.index as keyof typeof indexOptions];
  const response = await axios.get(`${pyBackEnd}/linreg`, {
    params: {
      stocks: searchParams.symbol,
      index: index,
      start: startDate,
      end: endDate,
      stockWeights: weights,
    },
  });
  return response.data;
}

export async function stockSearch(query: string) {
  try {
    const response = await axios.get(
      `https://eodhd.com/api/query-search-extended/`,
      {
        params: {
          q: query,
          api_token: "65431c249ef2b9.93958016",
          exchange: "US",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching stock search results:", error);
    throw error;
  }
}



export async function getStockWeights(stockNumbers : StockWeightNumber) {
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

export async function getCompanyFinancials(stockSymbol : string, quarterly : boolean) {
  const response = await axios.get(`${pyBackEnd}/financials`, {
    params: {
      symbol: stockSymbol,
      quarterly: quarterly,
    },
  });
  let data = response.data;
  for (let key in data) {
    data[key] = JSON.parse(data[key]);
    data[key].sort((a: any, b: any) => new Date(b.asOfDate).getTime() - new Date(a.asOfDate).getTime());
  }
  return data;
}

export async function getFamaFrenchData(startDate: string, endDate: string, stockWeights: StockWeightNumber) {
  const response = await axios.get(`${pyBackEnd}/famafrench`, {
    params: {
      stockWeights: stockWeights,
      start: startDate,
      end: endDate,
    },
  });
  return response.data;
}

export function idbPromise(storeName : string, method : string, object? : object | string) {
  return new Promise((resolve) => {
    const request = window.indexedDB.open(storeName, 1);

    let db: IDBDatabase, tx: IDBTransaction, store: IDBObjectStore;

    request.onupgradeneeded = function () {
      const db = request.result;
      if (storeName === "stockWeights") {
        db.createObjectStore("stockWeights", { keyPath: "portfolio_id" });
      } else if (storeName === "financials") {
        db.createObjectStore("financials", { keyPath: "symbol" });
      } else if (storeName === "watchlist") {
        db.createObjectStore("watchlist", { keyPath: "watchlistName" });
      }
    };

    request.onerror = function () {
      console.log("There was an error");
    };
    request.onsuccess = function () {
      db = request.result;
      tx = db.transaction(storeName, "readwrite");
      store = tx.objectStore(storeName);
      db.onerror = function (e) {
        console.log("error", e);
      };
      if (method === "put") {
        console.log("putting", object);
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
        resolve("watchlist deleted");
      }

      tx.oncomplete = function () {
        db.close();
      };
    };
  });
}




export async function getStockObject(
  userData : userData,
  stockData : { stock: StockObject[] },
  dispatch : React.Dispatch<any>,
  setStockWeights : React.Dispatch<any>
) {
  const data = stockData;
  const stockObjects = data.stock;
  const promises = stockObjects.map( (stockObject : { stock_symbol : string, stock_quantity : number }) => {
    return {
      [stockObject.stock_symbol]: stockObject.stock_quantity,
    };
  });
  const stockNumbersArray = await Promise.all(promises);
  let stockNumbers = Object.assign({}, ...stockNumbersArray);
  stockNumbers = JSON.stringify(stockNumbers);
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


export async function setStockGraph(data : StockGraphData[]) {
  const dataPoints = [];
  for (var i = 0; i < data.length; i++) {
    dataPoints.push({
      x: new Date(data[i].Date),
      y: {
        open: Number(data[i].Open),
        high: Number(data[i].High),
        low: Number(data[i].Low),
        close: Number(data[i].Close),
        volume: Number(data[i].Volume),
      },
    });
  }
  return dataPoints;
}


export function generateFinancialsChartOptions(data : StockGraphData[]) {
  return {
    theme: "light2",
    charts: [{
      axisX: {
        lineThickness: 1,
        tickLength: 5,
        labelFontSize: 12,
      },
      axisY: {
        title: "Stock Price",
        prefix: "$",
        tickLength: 5,
        labelFontSize: 12,
      },
      data: [{
        type: "line",
        dataPoints: data.map(point => ({
          x: new Date(point.Date),
          y: point.Close
        }))
      }]
    }],
    navigator: {
      enabled: false
    },
    rangeSelector: {
      inputFields: {
        enabled: false
      },
      buttons: [{
        range: 1,
        rangeType: "year",
        label: "5Y"
      }],
      buttonStyle: {
        display: "none"
      }
    }
  };
}


export function generateChartOptions(type: string, config: StockChartConfig) {
  switch (type) {
    case "stock":
      const { theme, stockName, data } = config;
      return {
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
              includeZero: false, // Ensures the y-axis doesn't start from zero for better visibility
            },
            toolTip: {
              shared: true,
              contentFormatter: function (e: FormatterOptions) {
                let content = `<strong>${e.entries[0].dataPoint.x.toLocaleDateString()}</strong>`;
                e.entries.forEach(function (entry) {
                  content += `<br/>${entry.dataSeries.name}: $${entry.dataPoint.y.toFixed(2)}`;
                });
                return content;
              },
            },
            data: [
              {
                name: "Price (in USD)",
                yValueFormatString: "$#,###.##",
                type: "line",
                color: "#2BB148",
                dataPoints: data.map((point) => ({
                  x: new Date(point.Date),
                  y: point.Close,
                })),
              },
              {
                type: "line",
                name: "50 Day MA",
                showInLegend: true,
                yValueFormatString: "$#,###.##",
                color: "#FF5733",
                dataPoints: calculateMovingAverage(data, 50),
              },
              {
                type: "line",
                name: "200 Day MA",
                showInLegend: true,
                yValueFormatString: "$#,###.##",
                color: "#C70039",
                dataPoints: calculateMovingAverage(data, 200),
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
              includeZero: false,
            },
            toolTip: {
              shared: true,
              contentFormatter: function (e : FormatterOptions) {
                let content = `<strong>${e.entries[0].dataPoint.x.toLocaleDateString()}</strong>`;
                e.entries.forEach(function (entry) {
                  content += `<br/>${entry.dataSeries.name}: ${entry.dataPoint.y.toLocaleString()}`;
                });
                return content;
              },
            },
            data: [
              {
                color: "#049C",
                name: "Volume",
                yValueFormatString: "#,###",
                type: "column",
                dataPoints: data.map((point) => ({
                  x: new Date(point.Date),
                  y: point.Volume,
                })),
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
              dataPoints: data.map((point) => ({
                x: new Date(point.Date),
                y: point.Close,
              })),
              type: "area",
            },
          ],
          slider: {
            minimum: new Date(data[0].Date),
            maximum: new Date(data[data.length - 1].Date),
            fontColor: "white",
            indexLabelFontColor: "white",
          },
        },
      };

      function calculateMovingAverage(data: StockGraphData[], days : number) {
        const maData = [];
        for (let i = 0; i < data.length; i++) {
          if (i < days - 1) {
            maData.push({ x: new Date(data[i].Date), y: null });
          } else {
            const sum = data.slice(i - days + 1, i + 1).reduce((acc, cur) => acc + cur.Close, 0);
            maData.push({ x: new Date(data[i].Date), y: sum / days });
          }
        }
        return maData;
      }
  

    case "regression":
      const { theme: scatterTheme, searchParams, index, formula } = config;
      if (!searchParams || !index || !formula) {
        throw new Error("searchParams is undefined");
      }
      const searchIndex = indexOptions[searchParams.index as keyof typeof indexOptions];
      return {
        theme: scatterTheme,
        title: {
          text: `${searchParams.symbol} vs ${searchIndex} Linear Regression`,
        },
        axisX: {
          title: `${searchParams.index}`,
        },
        axisY: {
          title: `${searchParams.symbol}`,
          margin: 0,
        },
        data: [
          {
            type: "scatter",
            showInLegend: true,
            legendText: `${searchParams.symbol}`,
            dataPoints: index?.map((point) => ({
              x: point.x,
              y: point.y,
              toolTipContent: `${searchIndex}: ${point.x}, ${searchParams.symbol}: ${point.y}`,
            })),
            label: "Data Points",
          },
          {
            type: "line",
            showInLegend: true,
            legendText: `${searchIndex}`,
            margin: 10,
            padding: 10,
            legendMarkerType: "none",
            dataPoints: index?.map((point) => ({
              x: point.x,
              y: formula.intercept + formula.coef * point.x,
              toolTipContent: `${searchIndex}: ${point.x}, ${searchParams.symbol}: ${point.y}`,
            })),
          },
        ],
      };

    case "famaFrench":
      const { dates, portfolio, mktRf, smb, hml, graphParams } = config;
      if (!dates || !portfolio) {
        throw new Error("dates or portfolio is undefined");
      }
      return {
        animationEnabled: true,
        exportEnabled: true,
        theme: "dark1",
        title: {
          text: "Fama French Model",
        },
        axisX: {
          title: "Date",
          labelFontSize: 12,
          valueFormatString: "MMM YYYY",
          crosshair: {
            enabled: true,
            snapToDataPoint: true,
          },
          minimum: new Date(dates[0]),
          maximum: new Date(dates[dates.length - 1]),
        },
        axisY: {
          title: "Percent",
        },
        data: [
          {
            type: "spline",
            name: "Portfolio",
            toolTipContent: `Date: {x}<br />Portfolio: {y}%`,
            showInLegend: true,
            legendText: "Portfolio",
            dataPoints: portfolio.map((point, index) => ({
              x: new Date(dates[index]),
              y: point,
            })),
          },
          graphParams?.mktRf && {
            type: "spline",
            name: "Mkt-Rf",
            toolTipContent: "Date: {x}<br />Mkt-Rf: {y}",
            showInLegend: true,
            legendText: "Mkt-RF",
            dataPoints: mktRf?.map((point, index) => ({
              x: new Date(dates[index]),
              y: point,
                          })),
          },
          graphParams?.smb && {
            type: "spline",
            name: "SMB",
            toolTipContent: "Date: {x}<br />SMB: {y}",
            showInLegend: true,
            legendText: "SMB",
            dataPoints: smb?.map((point, index) => ({
              x: new Date(dates[index]),
              y: point,
            })),
          },
          graphParams?.hml && {
            type: "spline",
            name: "HML",
            toolTipContent: "Date: {x}<br />HML: {y}",
            showInLegend: true,
            legendText: "HML",
            dataPoints: hml?.map((point, index) => ({
              x: new Date(dates[index]),
              y: point,
            })),
          },
        ].filter(Boolean), 
      };

    default:
      throw new Error("Unknown chart type");
  }
}
// Use a constant for the backend URL to ensure consistency

type Metrics = {
  ratios: {},
  financials: {},
  stockPerformance: {}
};

export async function getStockOverview(stockSymbols: string | string[], metrics?: Metrics) {
  try {
    const response = await axios.post(`${pyBackEnd}/fetch-stock-overview`, {
      symbols: stockSymbols,
      metrics: metrics
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stock overview:', error);
    return null;
  }
} 

// key board shortcut for selecting multiline object / function on mac vsc

