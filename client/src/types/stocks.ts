export type StockOverview = {
    currentPrice: number,
    priceChange: number,
    priceChangePercent: number,
    afterHoursPrice: number,
    afterHoursChange: number,
    afterHoursChangePercent: number,
  }

export type StockWeightNumber = {
    [key: string]: number;
};

export type SearchParams = {
    symbol: string,
    index: string,
};

export type StockObject = {
    stock_symbol: string,
    stock_quantity: number,
};

export type StockGraphData = {
    Date: string,
    Open: number,
    High: number,
    Low: number,
    Close: number,
    Volume: number,
};

export type StockChartConfig = {
    theme: string,
    stockName: string,
    data: StockGraphData[],
    stockSymbol?: string,
    searchParams?: SearchParams, 
    formula?: {
      intercept: number,
      coef: number,
    },
    mktRf?: number[],
    smb?: number[],
    hml?: number[],
    graphParams?: {
      mktRf: boolean,
      smb: boolean,
      hml: boolean,
    },
    index?: { x: number, y: number }[],
    portfolio?: number[],
    dates?: string[],
  };
  
  export type FormatterOptions = {
    entries: any[],
    dataPoint: any,
  };

