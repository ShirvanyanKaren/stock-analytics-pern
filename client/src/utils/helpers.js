import axios from "axios";
import { SET_STOCK_WEIGHTS } from "./actions";
import Auth from "../utils/auth";

const pyBackEnd = "https://pern-portfolio-backend-805cd64a428d.herokuapp.com";

// Index options object
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
console.log(indexOptions["SP500"]);

export async function stockData(stockSymbol, startDate, endDate) {
  console.log("stockSymbol", stockSymbol);
  const response = await axios.get(`${pyBackEnd}/stockgraph`, {
    params: {
      symbol: stockSymbol,
      start: startDate,
      end: endDate,
    },
  });
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
    `https://eodhd.com/api/query-search-extended/?q=${query}&api_token=65431c249ef2b9.93958016`
  );
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

export async function getCompanyFinancials(stockSymbol, statement, quarterly) {
  const url = `${pyBackEnd}/financials`;
  try {
    const response = await axios.get(url, {
      params: {
        symbol: stockSymbol,
        statement: statement,
        quarterly: quarterly,
      },
    });
    console.log('Fetch response:', response); // Log the response

    if (!response.data) {
      const message = `An error has occurred: ${response.status}`;
      throw new Error(message);
    }
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 200 range
      console.error("Error fetching financial statement:", error.response.status, error.response.data);
      throw new Error(`Error fetching financial statement: ${error.response.status}`);
    } else if (error.request) {
      // Request was made but no response received
      console.error("Error fetching financial statement:", error.request);
      throw new Error("Error fetching financial statement: No response received");
    } else {
      // Something else caused an error
      console.error("Error fetching financial statement:", error.message);
      throw new Error(`Error fetching financial statement: ${error.message}`);
    }
  }
}

export function transposeData(data) {
  const transposed = {};
  data.forEach((row, rowIndex) => {
    Object.entries(row).forEach(([key, value]) => {
      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
      if (!transposed[formattedKey]) {
        transposed[formattedKey] = [];
      }
      transposed[formattedKey][rowIndex] = value;
    });
  });

  return Object.entries(transposed).map(([key, values]) => ({ metric: key, ...values }));
}

export function formatFinancialData(data) {
  let formattedData = "Financial Statement Data:\n";
  data.forEach(row => {
    const metric = row.metric;
    const values = Object.values(row).slice(1); // exclude the 'metric' key
    formattedData += `${metric}: ${values.join(', ')}\n`;
  });
  return formattedData;
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
    const request = window.indexedDB.open("stockWeights", 1);

    let db, tx, store;

    request.onupgradeneeded = function (e) {
      const db = request.result;
      db.createObjectStore("stockWeights", { keyPath: "portfolio_id" });
    };

    request.onerror = function (e) {
      console.log("There was an error");
      reject("Error in IDB request");
    };

    request.onsuccess = function (e) {
      db = request.result;
      tx = db.transaction(storeName, "readwrite");
      store = tx.objectStore(storeName);

      db.onerror = function (e) {
        console.log("error", e);
        reject("Database error");
      };

      switch (method) {
        case "put":
          store.put(object);
          resolve(object);
          break;
        case "get":
          const all = store.getAll();
          all.onsuccess = function () {
            resolve(all.result);
          };
          break;
        case "delete":
          console.log("delete object", object.toString());
          store.delete(object.toString());
          resolve(object);
          break;
        default:
          reject("Invalid method");
          break;
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
