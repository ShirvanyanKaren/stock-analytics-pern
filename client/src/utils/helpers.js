import axios from "axios";
// const pyBackEnd = typeof process == 'object' ? process.env.BACK : "http://0.0.0.0:8000";
import { SET_STOCK_WEIGHTS } from "./actions";
import Auth from "../utils/auth";
// const pyBackEnd = "https://pern-portfolio-backend-805cd64a428d.herokuapp.com";

const pyBackEnd = "http://0.0.0.0:8000"

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
  console.log("stockSymbol", stockSymbol);
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
  const response = await axios.get(`${pyBackEnd}/financials`, {
    params: {
      symbol: stockSymbol,
      statement: statement,
      quarterly: quarterly,
    },
  });
  return response.data;
}

export async function getFamaFrenchData(startDate, endDate, stockWeights) {
  const response = await axios.get(`${pyBackEnd}/famafrench`, {
    params: {
      stockWeights: stockWeights,
      start: startDate,
      end: endDate,
    },
  });
  return response.data;
}

export function idbPromise(stockWeights, method, object) {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("stockWeights", 1);

    let db, tx, store;

    request.onupgradeneeded = function (e) {
      const db = request.result;
      db.createObjectStore("stockWeights", { keyPath: "portfolio_id" });
    };

    request.onerror = function (e) {
      console.log("There was an error");
    };

    request.onsuccess = function (e) {
      db = request.result;
      tx = db.transaction("stockWeights", "readwrite");
      store = tx.objectStore("stockWeights");

      db.onerror = function (e) {
        console.log("error", e);
      };
      if (method === "put") {
        store.put(object);
      }
      if (method === "get") {
        const all = store.getAll();
        all.onsuccess = function () {
          resolve(all.result);
        };
      }
      if (method === "delete") {
        console.log("delete object", object.toString());
        store.delete(object.toString());
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
