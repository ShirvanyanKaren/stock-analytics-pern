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

