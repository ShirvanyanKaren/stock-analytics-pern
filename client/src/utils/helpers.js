import axios from "axios";

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
        const response = await axios.get('http:////127.0.0.1:8000/stockgraph', 

        {
          params: {
            symbol: stockSymbol,
            start: startDate,
            end: endDate,
          },
        });
    return response.data;
}

export async function linReg(stockSymbol, searchIndex, startDate, endDate) {
        const response = await axios.get('http:////127.0.0.1:8000/linreg',
        {
          params: {
            stocks: stockSymbol,
            index: searchIndex,
            start: startDate,
            end: endDate,
          },
        });
    return response.data;
}

export async function stockSearch(query) {
        const response = await axios.get(`https://eodhd.com/api/query-search-extended/?q=${query}&api_token=65431c249ef2b9.93958016`);
    return response.data;

}

export async function getStockWeights(stockNumbers) {
  const response = await axios.get('http:////127.0.0.1:8000/stockweights',
  {
    params: {
      stocks: stockNumbers,
    },
  });
  return response.data;
}


export function idbPromise(stockWeights, method, object){
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('stockWeights', 1);

    let db, tx, store;

    request.onupgradeneeded = function(e) {
      const db = request.result;
      db.createObjectStore('stockWeights', { keyPath: 'portfolio_id' });
    };

    request.onerror = function(e) {
      console.log('There was an error');
    };

    request.onsuccess = function(e) {
      db = request.result;
      tx = db.transaction('stockWeights', 'readwrite');
      store = tx.objectStore('stockWeights');

      db.onerror = function(e) {
        console.log('error', e);
      };
      if (method === 'put') {
        store.put(object);
      }
      if (method === 'get') {
        const all = store.getAll();
        all.onsuccess = function() {
          resolve(all.result);
        };
      }
      if (method === 'delete') {
        console.log("delete object", object);
        store.delete(object);
      }
      tx.oncomplete = function() {
        db.close();
      };
    };
  });


}
