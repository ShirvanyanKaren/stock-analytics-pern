import axios from "axios";
import { SET_STOCK_WEIGHTS } from "./actions";
import Auth from "../utils/auth";
// const pyBackEnd = "https://pern-portfolio-backend-805cd64a428d.herokuapp.com";

const pyBackEnd = "http://127.0.0.1:8000";



////NEW AS OF 6/24/24 watchlist helper functions



// Watchlist helper functions
export async function addStock(stockState) {
  try {
    const response = await axios.post(`${pyBackEnd}/add-stock`, stockState);
    return response.data;
  } catch (error) {
    throw new Error("Error adding stock");
  }
}

export async function addToWatchlist(stockSymbol, userId) {
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

export async function createWatchlist(watchlistName, userId) {
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

export async function stockWatchlistSearch(query) {
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

export async function getWatchlistInfo(stockSymbols) {
  try {
    const stockInfoPromises = stockSymbols.map(async (symbol) => {
      const overview = await getStockOverview(symbol);
      return {
        stockSymbol: symbol,
        currentPrice: overview.currentPrice,
        priceChange: overview.priceChange,
        priceChangePercent: overview.priceChangePercent,
        afterHoursPrice: overview.afterHoursPrice,
        afterHoursChange: overview.afterHoursChange,
        afterHoursChangePercent: overview.afterHoursChangePercent,
      };
    });

    const stockInfos = await Promise.all(stockInfoPromises);
    return stockInfos;
  } catch (error) {
    console.error('Error fetching watchlist info:', error);
    return [];
  }
}

export async function getWatchlist(userId) {
  const response = await axios.get(`${pyBackEnd}/get-watchlist`, {
    params: {
      user_id: userId,
    },
  });
  return response.data;
}

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

export async function linReg(searchParams, startDate, endDate, weights) {
  const response = await axios.get(`${pyBackEnd}/linreg`, {
    params: {
      stocks: searchParams.symbol,
      index: indexOptions[searchParams.index],
      start: startDate,
      end: endDate,
      stockWeights: weights,
    },
  });
  return response.data;
}

export async function stockSearch(query) {
  try {
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
  } catch (error) {
    console.error("Error fetching stock search results:", error);
    throw error;
  }
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

export async function setStockGraph(data) {
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

export function generateChartOptions(type, config) {
  switch (type) {
    case "stock":
      const { theme, stockName, data, stockSymbol } = config;
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
            },
            toolTip: {
              shared: true,
            },
            data: [
              {
                name: "Price (in USD)",
                yValueFormatString: "$#,###.##",
                type: "line", // Change this from "candlestick" to "line"
                color: "#2BB148",
                dataPoints: data.map((point) => ({
                  x: new Date(point.Date),
                  y: point.Close, // Use point.Close for the y value in line graph
                })),
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
            minimum: new Date("2022-05-01"),
            maximum: new Date("2022-07-01"),
            fontColor: "white",
            indexLabelFontColor: "white",
          },
        },
      };
  

    case "regression":
      const { theme: scatterTheme, searchParams, index, formula } = config;
      const searchIndex = indexOptions[searchParams.index];
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
            dataPoints: index.map((point) => ({
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
            dataPoints: index.map((point) => ({
              x: point.x,
              y: formula.intercept + formula.coef * point.x,
              toolTipContent: `${searchIndex}: ${point.x}, ${searchParams.symbol}: ${point.y}`,
            })),
          },
        ],
      };

    case "famaFrench":
      const { dates, portfolio, mktRf, smb, hml, graphParams } = config;
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
          graphParams.mktRf && {
            type: "spline",
            name: "Mkt-Rf",
            toolTipContent: "Date: {x}<br />Mkt-Rf: {y}",
            showInLegend: true,
            legendText: "Mkt-RF",
            dataPoints: mktRf.map((point, index) => ({
              x: new Date(dates[index]),
              y: point,
            })),
          },
          graphParams.smb && {
            type: "spline",
            name: "SMB",
            toolTipContent: "Date: {x}<br />SMB: {y}",
            showInLegend: true,
            legendText: "SMB",
            dataPoints: smb.map((point, index) => ({
              x: new Date(dates[index]),
              y: point,
            })),
          },
          graphParams.hml && {
            type: "spline",
            name: "HML",
            toolTipContent: "Date: {x}<br />HML: {y}",
            showInLegend: true,
            legendText: "HML",
            dataPoints: hml.map((point, index) => ({
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

export async function getStockOverview(stockSymbols) {
  try {
    console.log(stockSymbols)
    const response = await axios.post(`${pyBackEnd}/stockoverview`, {
      symbols: stockSymbols,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stock overview:', error);
    return null;
  }
} 




export const returnInfo = {
  "SMB Beta":
    "The sensitivity of a portfolio's excess returns to the returns of the SMB factor. A beta of 1.0 indicates perfect correlation to the factor, 0.0 indicates no correlation, And negative values indicate an inverse correlation.",
  "HML Beta":
    "The sensitivity of a portfolio's excess returns to the returns of the HML factor. A beta of 1.0 indicates perfect correlation to the factor, 0.0 indicates no correlation, And negative values indicate an inverse correlation.",
  "Portfolio Beta":
    "The sensitivity Of a portfolio's excess returns to the returns of the Mkt-Rf factor. A beta of 1.0 indicates perfect correlation to the factor, 0.0 indicates no correlation, And negative values indicate an inverse correlation.",
  "SMB P-Value":
    "The probability of observing a value as extreme or more extreme than the observed value by chance, assuming the null hypothesis is true. A p-value Of 0.05 or less is considered statistically significant.",
  "HML P-Value":
    "The probability of observing a value as extreme or more extreme than the observed value by chance, assuming the null hypothesis is true. A p-value Of 0.05 or less is considered statistically significant.",
  "Mkt-Rf P-Value":
    "The probability Of observing a value as extreme or more extreme than the observed value by chance, assuming the null hypothesis is true. A p-value Of 0.05 or less is considered statistically significant.",
  "R-Squared":
    "The percentage Of a portfolio's excess returns that can be explained by the returns Of the SMB And HML factors. A value Of 1.0 indicates perfect correlation, 0.0 indicates no correlation, And negative values indicate an inverse correlation.",
  "Sharpe Ratio":
    "The average return earned In excess Of the risk-free rate per unit Of volatility or total risk. A higher Sharpe ratio indicates a better historical risk-adjusted performance.",
  "Period Type": "The type Of period for which the financial data is reported.",
  "Currency Code":
    "The code that represents the currency used In financial transactions, such as USD for US dollars.",
  "Average Dilution Earnings":
    "Earnings calculated after accounting for potential dilution from options, warrants, or convertible securities.",
  "Basic Average Shares":
    "The average number Of shares outstanding during a specific reporting period, not adjusted for potential dilution.",
  "Basic E P S":
    "Earnings per share calculated using the number Of basic shares outstanding.",
  "Cost Of Revenue":
    "The direct costs attributable to the production Of the goods sold by a company.",
  "Diluted Average Shares":
    "The average number Of shares outstanding during the period, adjusted for the effects Of dilutive securities.",
  "Diluted EPS":
    "Earnings per share calculated using the diluted number Of shares outstanding.",
  "Diluted NI Available to Com Stockholders":
    "Net income available to common stockholders, adjusted for dilutive effects.",
  "EBIT":
    "Earnings Before Interest And Taxes; a measure Of a firm's profit that includes all expenses except interest And income tax expenses.",
  "EBITDA":
    "Earnings Before Interest, Taxes, Depreciation, And Amortization; an indicator Of a company's financial performance.",
  "Gross Profit":
    "The profit a company makes after deducting the costs associated with making And selling its products.",
  "Interest Expense": "The cost incurred by an entity for borrowed funds.",
  "Interest Expense Non Operating":
    "Interest expense that is not related to the principal operations Of the business.",
  "Interest Income":
    "The income a company earns from its cash holdings And marketable securities.",
  "Interest Income Non Operating":
    "Interest income that is not generated from the principal operations Of the business.",
  "Minority Interests":
    "The portion Of subsidiary companies' equity that is not owned by the parent corporation.",
  "Net Income Common Stockholders":
    "Net income that is available to common stockholders.",
  "Net Income Continuous Operations":
    "The income attributable to the ongoing, regular business activities.",
  "Net Income From Continuing And Discontinued Operation":
    "Total earnings that include both continuing operations And those that have been or are to be discontinued.",
  "Net Income From Continuing Operation Net Minority Interest":
    "Income from continuing operations that excludes the effects Of minority interests.",
  "Net Income Including Noncontrolling Interests":
    "Total earnings that include the interests Of noncontrolling stakeholders.",
  "Net Interest Income":
    "The difference between the revenue generated from a bank's assets And the expenses associated with paying out its liabilities.",
  "Net Non Operating Interest Income Expense":
    "The net expense or income from non-operating interest activities.",
  "Normalized E B I T D A":
    "EBITDA adjusted for non-recurring, irregular, And one-time items.",
  "Normalized Income":
    "Net income adjusted to eliminate the effects Of nonrecurring gains And losses.",
  "Operating Expense": "Expenses incurred from normal business operations.",
  "Operating Income":
    "The profit realized from a business's ongoing operations.",
  "Operating Revenue":
    "The revenue generated from a company's primary activities.",
  "Other Income Expense":
    "Revenues or expenses that are not related to the core operations Of a business.",
  "Other Non Operating Income Expenses":
    "Gains or losses not related to the core business operations.",
  "Otherunder Preferred Stock Dividend":
    "Dividends On preferred stock that must be subtracted from net income In earnings per share calculations.",
  "Pretax Income": "The income Of a company before taxes are deducted.",
  "Reconciled Cost Of Revenue":
    "Adjusted reporting Of the cost Of revenue, reconciling reported figures with actual figures.",
  "Reconciled Depreciation":
    "Adjusted depreciation expense that aligns reported figures with actual depreciation costs.",
  "Research And Development":
    "Expenses associated with the research And development Of a company’s products or services.",
  "Restructuring And Merger Acquisition":
    "Costs related to restructuring And merger And acquisition activities.",
  "Selling General And Administration":
    "Expenses associated with selling products And managing the business.",
  "Special Income Charges":
    "Non-recurring or special charges that need to be noted separately from regular income.",
  "Tax Effect Of Unusual Items":
    "The tax impact Of items that are unusual or nonrecurring.",
  "Tax Provision":
    "The total amount Of current income tax liability for a period.",
  "Tax Rate for Calcs":
    "The tax rate used for calculation purposes In financial modeling.",
  "Total Expenses": "The total amount Of expenses incurred by a company.",
  "Total Operating Income As Reported":
    "Total income from operations as reported In financial statements.",
  "Total Revenue":
    "The total amount Of income generated by the sale Of goods or services.",
  "Total Unusual Items": "Total Of items that are unusual or nonrecurring.",
  "Total Unusual Items Excluding Goodwill":
    "Total Of unusual or nonrecurring items excluding the effects Of goodwill.",
  "Accounts Payable":
    "The amount Of money a company owes to suppliers for items or services purchased On credit.",
  "Accounts Receivable":
    "Money owed to a company by its customers for products or services sold On credit.",
  "Accumulated Depreciation":
    "The total depreciation Of an asset accumulated up to a specified date.",
  "Additional Paid In Capital":
    "The amount Of capital from investors above the par value Of stock.",
  "Capital Lease Obligations":
    "A lease considered to have the economic characteristics Of asset ownership.",
  "Capital Stock":
    "The total amount Of a company's equity represented by shares.",
  "Cash And Cash Equivalents":
    "Company assets In the form Of cash or assets easily converted to cash.",
  "Cash Cash Equivalents And Short Term Investments":
    "Short-term investments that are highly liquid And easily converted to cash.",
  "Cash Equivalents":
    "Short-term, highly liquid investments that are easily convertible to known amounts Of cash.",
  "Cash Financial": "Cash held for financial purposes.",
  "Common Stock":
    "A type Of equity security that represents ownership In a corporation.",
  "Common Stock Equity": "The equity held by common stockholders.",
  "Construction In Progress":
    "The costs Of construction work that is not yet completed.",
  "Current Accrued Expenses":
    "Expenses that have been incurred but not yet paid.",
  "Current Assets":
    "Assets that are expected to be converted into cash within a year.",
  "Current Capital Lease Obligation":
    "The portion Of a capital lease obligation that is due within one year.",
  "Current Debt":
    "The portion Of a company's debt that is due within one year.",
  "Current Debt And Capital Lease Obligation":
    "The portion Of both current debt And capital lease obligations due within one year.",
  "Current Deferred Liabilities":
    "Liabilities that have been deferred And are due within a year.",
  "Current Deferred Revenue":
    "Revenue received but not yet earned within a year.",
  "Current Liabilities":
    "A company's debts or obligations that are due within one year.",
  "Current Provisions":
    "Current liabilities that are uncertain In amount or timing.",
  "Finished Goods":
    "Goods that have completed the manufacturing process but have not yet been sold.",
  "Gains Losses Not Affecting Retained Earnings":
    "Gains or losses that do not affect retained earnings.",
  Goodwill:
    "An intangible asset that arises when a buyer acquires an existing business.",
  "Goodwill And Other Intangible Assets":
    "Goodwill And other intangible assets acquired by a company.",
  "Gross P P E":
    "The total cost Of property, plant, And equipment before depreciation.",
  "Interest Payable":
    "The amount Of interest expense that has been incurred but not yet paid.",
  Inventory:
    "The raw materials, work-In-progress goods, And finished goods that a company has On hand.",
  "Invested Capital":
    "The total amount Of money that was invested into a company by its shareholders And debt holders.",
  "Land And Improvements": "Land And any improvements made to it.",
  Leases:
    "Contracts In which the property owner allows another party to use the property for a specific period In exchange for payment.",
  "Line Of Credit":
    "An arrangement between a financial institution And a customer that establishes a maximum loan balance that the lender allows the borrower to access or maintain.",
  "Long Term Capital Lease Obligation":
    "A lease obligation with a term longer than one year.",
  "Long Term Debt": "Loans And financial obligations lasting over one year.",
  "Long Term Debt And Capital Lease Obligation":
    "The sum Of long-term debt And capital lease obligations.",
  "Long Term Provisions":
    "Long-term liabilities that are uncertain In amount or timing.",
  "Machinery Furniture Equipment":
    "Physical assets used In the production Of goods And services.",
  "Minority Interest":
    "The portion Of a subsidiary corporation's stock that is not owned by the parent corporation.",
  "Net Debt":
    "The total amount Of a company's debt minus cash And cash equivalents.",
  "Net P P E":
    "The value Of a company's property, plant, And equipment after accounting for depreciation.",
  "Net Tangible Assets":
    "A company's total assets minus its intangible assets And liabilities.",
  "Non Current Accrued Expenses":
    "Expenses that have been incurred but not yet paid And are due after one year.",
  "Non Current Deferred Assets":
    "Assets that are deferred And not expected to be realized within one year.",
  "Non Current Deferred Liabilities":
    "Liabilities that are deferred And not due within one year.",
  "Non Current Deferred Revenue":
    "Revenue received but not yet earned And not expected to be recognized within one year.",
  "Non Current Deferred Taxes Assets":
    "Deferred tax assets that are not expected to be realized within one year.",
  "Non Current Deferred Taxes Liabilities":
    "Deferred tax liabilities that are not due within one year.",
  "Non Current Note Receivables":
    "Notes receivable that are not expected to be collected within one year.",
  "Ordinary Shares Number":
    "The number Of ordinary shares issued by a company.",
  "Other Current Assets":
    "Miscellaneous short-term assets that do not fall into standard categories.",
  "Other Current Borrowings":
    "Miscellaneous short-term borrowings that do not fall into standard categories.",
  "Other Current Liabilities":
    "Miscellaneous short-term liabilities that do not fall into standard categories.",
  "Other Equity Adjustments":
    "Adjustments to equity that do not fall into standard categories.",
  "Other Intangible Assets":
    "Miscellaneous intangible assets that do not fall into standard categories.",
  "Other Inventories":
    "Miscellaneous inventories that do not fall into standard categories.",
  "Other Non Current Assets":
    "Miscellaneous long-term assets that do not fall into standard categories.",
  "Other Non Current Liabilities":
    "Miscellaneous long-term liabilities that do not fall into standard categories.",
  "Other Properties":
    "Miscellaneous properties that do not fall into standard categories.",
  "Other Short Term Investments":
    "Miscellaneous short-term investments that do not fall into standard categories.",
  Payables: "Money owed by a company to its creditors.",
  "Payables And Accrued Expenses":
    "Money owed by a company to its creditors And expenses that have been incurred but not yet paid.",
  "Preferred Securities Outside Stock Equity":
    "Preferred securities that are not part Of stock equity.",
  "Preferred Stock":
    "A class Of ownership In a corporation that has a higher claim On its assets And earnings than common stock.",
  "Prepaid Assets":
    "Expenses paid In advance And recorded as assets until they are used or consumed.",
  Properties: "Real estate And other physical assets owned by a company.",
  "Raw Materials": "The basic materials used In the production process.",
  Receivables:
    "Money owed to a company by its customers for products or services sold On credit.",
  "Restricted Cash":
    "Cash that is restricted for a specific purpose And not available for general business use.",
  "Retained Earnings":
    "The portion Of net income that is retained by the company rather than distributed to shareholders.",
  "Share Issued": "The number Of shares that have been issued by a company.",
  "Stockholders Equity":
    "The equity stake currently held On the books by a firm's equity investors.",
  "Tangible Book Value":
    "The value Of a company’s physical assets minus its liabilities.",
  "Total Assets":
    "The total value Of everything a company owns And uses to conduct its business.",
  "Total Capitalization":
    "The sum Of a company's long-term debt, stock, And retained earnings.",
  "Total Debt": "The sum Of a company's short-term And long-term debt.",
  "Total Equity Gross Minority Interest":
    "The total equity including the portion attributable to minority interests.",
  "Total Liabilities Net Minority Interest":
    "Total liabilities minus the portion attributable to minority interests.",
  "Total Non Current Assets":
    "The total value Of a company's long-term assets.",
  "Total Non Current Liabilities Net Minority Interest":
    "Total long-term liabilities minus the portion attributable to minority interests.",
  "Total Tax Payable":
    "The total amount Of tax a company owes to tax authorities.",
  "Treasury Shares Number":
    "The number Of shares that a company has bought back from shareholders.",
  "Work In Process":
    "Goods that are In the process Of being manufactured but are not yet completed.",
  "Working Capital":
    "The difference between a company's current assets And current liabilities.",
  "Asset Impairment Charge":
    "A charge taken to write down the carrying value Of an asset when its market value falls below its book value.",
  "Beginning Cash Position":
    "The amount Of cash available at the start Of a period.",
  "Capital Expenditure":
    "Funds used by a company to acquire or upgrade physical assets such as property, industrial buildings, or equipment.",
  "Cash Flow from Continuing Financing Activities":
    "The cash generated or used by a company from its continuing financing activities.",
  "Cash Flow from Continuing Investing Activities":
    "The cash generated or used by a company from its continuing investing activities.",
  "Cash Flow from Continuing Operating Activities":
    "The cash generated or used by a company from its continuing operating activities.",
  "Change In Account Payable":
    "The increase or decrease In a company’s accounts payable balance during a period.",
  "Change In Cash Supplemental as Reported":
    "The increase or decrease In a company’s cash balance as reported during a period.",
  "Change In Inventory":
    "The increase or decrease In a company’s inventory balance during a period.",
  "Change In Other Current Assets":
    "The increase or decrease In a company’s other current assets during a period.",
  "Change In Other Current Liabilities":
    "The increase or decrease In a company’s other current liabilities during a period.",
  "Change In Other Working Capital":
    "The increase or decrease In a company’s other working capital during a period.",
  "Change In Payables":
    "The increase or decrease In a company’s payables balance during a period.",
  "Change In Payables And Accrued Expense":
    "The increase or decrease In a company’s payables And accrued expenses during a period.",
  "Change In Prepaid Assets":
    "The increase or decrease In a company’s prepaid assets during a period.",
  "Change In Receivables":
    "The increase or decrease In a company’s receivables balance during a period.",
  "Change In Working Capital":
    "The increase or decrease In a company’s working capital during a period.",
  "Changes In Account Receivables":
    "The increase or decrease In a company’s accounts receivable balance during a period.",
  "Changes In Cash":
    "The increase or decrease In a company’s cash balance during a period.",
  "Common Stock Issuance":
    "The process Of creating new shares And selling them to investors.",
  "Deferred Income Tax":
    "A tax liability that a company owes but does not need to pay until a future period.",
  "Deferred Tax":
    "A tax liability that is due In the future but is recorded as an expense In the current period.",
  Depreciation:
    "The allocation Of the cost Of a tangible asset over its useful life.",
  "Depreciation Amortization Depletion":
    "The combined allocation Of the cost Of tangible And intangible assets over their useful lives.",
  "Depreciation And Amortization":
    "The combined allocation Of the cost Of tangible And intangible assets over their useful lives.",
  "Effect Of Exchange Rate Changes":
    "The impact Of changes In exchange rates On a company’s financial statements.",
  "End Cash Position": "The amount Of cash available at the end Of a period.",
  "Financing Cash Flow":
    "The cash generated or used by a company from its financing activities.",
  "Free Cash Flow":
    "The cash generated by a company after accounting for capital expenditures.",
  "Gain Loss On Sale Of PPE":
    "The gain or loss recognized from the sale Of property, plant, And equipment.",
  "Income Tax Paid Supplemental Data":
    "Additional data On income taxes paid during a period.",
  "Interest Paid Supplemental Data":
    "Additional data On interest paid during a period.",
  "Investing Cash Flow":
    "The cash generated or used by a company from its investing activities.",
  "Issuance Of Capital Stock":
    "The process Of creating new shares Of capital stock And selling them to investors.",
  "Issuance Of Debt":
    "The process Of creating new debt And selling it to investors.",
  "Long Term Debt Issuance":
    "The process Of creating new long-term debt And selling it to investors.",
  "Long Term Debt Payments": "The repayment Of long-term debt obligations.",
  "Net Business Purchase And Sale":
    "The net effect Of purchases And sales Of businesses during a period.",
  "Net Common Stock Issuance":
    "The net amount Of common stock issued during a period.",
  "Net Foreign Currency Exchange Gain Loss":
    "The net gain or loss from foreign currency exchange transactions.",
  "Net Income":
    "The total profit Of a company after all expenses And taxes have been deducted.",
  "Net Income from Continuing Operations":
    "The income from continuing operations excluding any discontinued operations.",
  "Net Intangibles Purchase And Sale":
    "The net effect Of purchases And sales Of intangible assets during a period.",
  "Net Investment Purchase And Sale":
    "The net effect Of purchases And sales Of investments during a period.",
  "Net Issuance Payments Of Debt":
    "The net amount Of debt issued And repaid during a period.",
  "Net Long Term Debt Issuance":
    "The net amount Of long-term debt issued during a period.",
  "Net Other Financing Charges":
    "The net effect Of other financing charges during a period.",
  "Net Other Investing Changes":
    "The net effect Of other investing changes during a period.",
  "Net PPE Purchase And Sale":
    "The net effect Of purchases And sales Of property, plant, And equipment during a period.",
  "Operating Cash Flow":
    "The cash generated or used by a company from its operating activities.",
  "Operating Gains Losses":
    "The gains or losses generated from operating activities.",
  "Other Non Cash Items": "Other items that do not involve cash transactions.",
  "Proceeds from Stock Option Exercised":
    "The cash received from the exercise Of stock options.",
  "Purchase Of Business": "The cash paid to acquire a business.",
  "Purchase Of Intangibles": "The cash paid to acquire intangible assets.",
  "Purchase Of Investment": "The cash paid to acquire investments.",
  "Purchase Of PPE": "The cash paid to acquire property, plant, And equipment.",
  "Repayment Of Debt": "The repayment Of debt obligations.",
  "Sale Of Business": "The cash received from the sale Of a business.",
  "Sale Of Intangibles":
    "The cash received from the sale Of intangible assets.",
  "Sale Of Investment": "The cash received from the sale Of investments.",
  "Stock Based Compensation":
    "The compensation given to employees In the form Of stock options or shares.",
  "52 Week High": "The highest price Of a stock In the past 52 weeks.",
  "52 Week Low": "The lowest price Of a stock In the past 52 weeks.",
  "Beta": "A measure Of a stock's volatility In relation to the market.",
  "Open": "The price Of a stock at the beginning Of a trading day.",
  "Previous Close":
    "The price Of a stock at the end Of the previous trading day.",
  "Volume": "The number Of shares traded during a specific period.",
  "Shares Outstanding": "The number Of shares that a company has issued.",
  "Market Cap": "The total value Of a company's outstanding shares.",
  "Day High": "The highest price Of a stock during a trading day.",
  "Day Low": "The lowest price Of a stock during a trading day.",
  "Dividend Yield": "The annual dividend payment divided by the stock's price.",
  "Forward PE": "The price Of a stock divided by its earnings per share.",
  "Dividend Rate": "The annual dividend payment.",
  "Mkt-RF": "The excess return of the market over the risk-free rate.",
  "Mkt-RF P-Value": "The probability Of observing a value as extreme or more extreme than the observed value by chance, assuming the null hypothesis is true. A p-value Of 0.05 or less is considered statistically significant.",
  "Adj. R-Squared": "The percentage Of a portfolio's excess returns that can be explained by the returns Of the Mkt-RF factor. A value Of 1.0 indicates perfect correlation, 0.0 indicates no correlation, And negative values indicate an inverse correlation.",
  "F-statistic": "A measure Of the overall significance Of the regression model.",
  "Prob (F-statistic)": "The probability Of observing an F-statistic as extreme or more extreme than the observed value by chance, assuming the null hypothesis is true. A p-value Of 0.05 or less is considered statistically significant.",
  "Covariance Type": "The type Of covariance used In the regression model.",
  "No. Observations": "The number of observations used In the regression model.",
  "AIC": "Akaike Information Criterion; a measure Of the relative quality Of a statistical model.",
  "BIC": "Bayesian Information Criterion; a measure Of the relative quality Of a statistical model.",
  "Log-Likelihood": "The log-likelihood Of the regression model.",
  "R-squared": "The percentage Of a portfolio's excess returns that can be explained by the returns Of the SMB And HML factors. A value Of 1.0 indicates perfect correlation, 0.0 indicates no correlation, And negative values indicate an inverse correlation.",
  "Method": "The method used to calculate the regression model. Least Squares is the most common method.",
  "Model": "The type Of regression model used. OLS is Ordinary Least Squares and it is the most common type of regression model.",
  "Df Residuals": "The degrees of freedom of the residuals.",
  "Df Model": "The degrees of freedom of the model.",
}
export const commonQuestions = [
  {
    question: "What is this page about?",
    answer: "This page provides detailed financial information about the selected stock, including historical data, financial statements, and analytics."
  },
  {
    question: "How can I view financial statements?",
    answer: "You can click on the 'Financials' tab to view the income statement, balance sheet, and cash flow statement of the selected stock."
  },
  {
    question: "What is the significance of the charts?",
    answer: "The charts show historical price and volume data, which can help you understand the stock's performance over time."
  },
  {
    question: "How do I use the Knowledge Mode?",
    answer: "In Knowledge Mode, you can click on financial terms to get detailed explanations and definitions."
  }
];

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