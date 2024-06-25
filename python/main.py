from typing import Union
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import pandas_datareader.data as pdr
import datetime as dt
import yfinance as yf
import numpy as np
import getFamaFrenchFactors as gff
import pandas as pd
import simplejson as json
from yahooquery import Ticker 
import statsmodels.api as sma
import uvicorn
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/stockinfo")
async def stock_info(symbol: str):
    symbol = process_symbol(symbol)
    stock_info = fetch_stock_info(symbol)
    return stock_info

@app.get("/stockgraph")
async def stock_graph(symbol: str, start: str, end: str):
    symbol = process_symbol(symbol)
    stock = fetch_stock_graph(symbol, start, end)
    return stock

@app.get("/financials")
def all_statements(symbol: str, quarterly: bool):
    quarterly = 'q' if quarterly else 'a'
    stock = Ticker(symbol)
    income = stock.income_statement(quarterly)
    balance = stock.balance_sheet(quarterly)
    cash = stock.cash_flow(quarterly)

    income.reset_index(inplace=True)
    balance.reset_index(inplace=True)
    cash.reset_index(inplace=True)

    return {
        'income': income.dropna(thresh=len(income.columns) / 2).to_json(orient='records'),
        'balance': balance.dropna(thresh=len(balance.columns) / 2).to_json(orient='records'),
        'cash': cash.dropna(thresh=len(cash.columns) / 2).to_json(orient='records')
    }

def process_symbol(symbol: str):
    symbol = symbol.upper()
    if "-" in symbol and "KS" in symbol:
        symbol = symbol.replace("-", ".")
    return symbol

def fetch_stock_info(symbol: str):
    stock_info = Ticker(symbol).summary_detail
    stock_key_stats = Ticker(symbol).key_stats
    long_name = Ticker(symbol).price[symbol]['longName']
    for key, value in stock_key_stats[symbol].items():
        if key not in stock_info[symbol]:
            stock_info[symbol][key] = value
    stock_info[symbol]['longName'] = long_name
    stock_info[symbol]['52WeekHigh'] = stock_info[symbol].pop('fiftyTwoWeekHigh')
    stock_info[symbol]['52WeekLow'] = stock_info[symbol].pop('fiftyTwoWeekLow')
    stock_info[symbol]['stockSymbol'] = symbol
    return stock_info

def fetch_stock_graph(symbol: str, start: str, end: str):
    start_date = dt.datetime.strptime(start, '%Y-%m-%d')
    end_date = dt.datetime.strptime(end, '%Y-%m-%d')
    stock = yf.download(symbol, start=start_date, end=end_date)
    stock.reset_index(inplace=True)
    stock['Date'] = stock['Date'].dt.strftime('%Y-%m-%d')
    stock = stock.to_json(orient='records')
    return stock

@app.get("/stockweights")
async def stock_weights(stocks):
    stocks = json.loads(stocks)
    total_value = 0
    weighted_portfolio = {}
    for stock in stocks:
        value = yf.Ticker(stock).history(period='1d')['Close'][0]
        stocks[stock] = value * stocks[stock]
        total_value += stocks[stock]
    for stock in stocks:
        weighted_portfolio[stock] = stocks[stock] / total_value
    return weighted_portfolio

def lin_reg_data(symbols, start, end, index, stockWeights):
    start_date = dt.datetime.strptime(start, '%Y-%m-%d')
    end_date = dt.datetime.strptime(end, '%Y-%m-%d')
    using_weights = False
    if symbols == 'Portfolio' or stockWeights != '':
        using_weights = True
        stock_weights = json.loads(stockWeights)
    if index in ['UNRATE', 'CPIAUCSL', 'PPIACO', 'FEDFUNDS', 'GDP', 'USEPUINDXD', 'VIXCLS']:
        index_data = pdr.DataReader(index, 'fred', start, end)
        index_data.index = index_data.index.rename('Date')
        if using_weights:
            stock_keys = list(stock_weights.keys())
            stocks = yf.download(stock_keys, start=start_date, end=end_date)['Adj Close'].pct_change()[1:]
            stocks = stocks * pd.Series(stock_weights)
            stocks = stocks.sum(axis=1)
            stocks = pd.DataFrame({'Adj Close': stocks})
            index_data = index_data.pct_change()
        else:
            stocks = yf.download(stocks, start=start_date, end=end_date)['Adj Close']
        stock_data = pd.merge(stocks, index_data, on='Date')
    else:
        if using_weights:
            stock_keys = list(stock_weights.keys())
            stocks = yf.download(stock_keys, start=start_date, end=end_date)['Adj Close'].pct_change()[1:]
            stocks = stocks * pd.Series(stock_weights)
            stocks = stocks.sum(axis=1)
            stock_data = pd.DataFrame({'Adj Close': stocks})
            index_data = yf.download(index, start=start_date, end=end_date)['Adj Close']
            index_data = index_data.pct_change()
            stock_data[index] = index_data
        else:
            stock_data = yf.download(symbols, start=start_date, end=end_date)['Adj Close']
            stock_data = stock_data.rename(columns={symbols[1]: 'Adj Close'})
    stock_data = stock_data.dropna()
    stocks_df = pd.DataFrame({
        'Dependent': stock_data['Adj Close'],
        'Independent': stock_data[index]
    })
    if using_weights: stock_data = stock_data * 100
    return stocks_df, stock_data

@app.get("/linreg")
async def lin_reg(stocks: str, index: str, start: str, end: str, stockWeights: str):
    symbols = [index, stocks]
    stocks_df, stock_data = lin_reg_data(symbols, start, end, index, stockWeights)
    formula = 'Dependent ~ Independent'
    model = sma.OLS.from_formula(formula, data=stocks_df).fit()
    coef = model.params[1]
    intercept = model.params[0]
    r_squared = model.rsquared
    model_html = model.summary().as_html().replace('\n', '')
    model_summary = pd.read_html(model_html)[0].to_json(orient='values')
    model_summary = json.loads(model_summary)
    model_obj = {}
    for arr in model_summary:
        for i in range(0, len(arr), 2):
            if arr[i]: model_obj[arr[i].replace(':', '')] = arr[i + 1]
    values = {'coef': coef, 'intercept': intercept, 'r_squared': r_squared, 'model': model_obj}
    sorted_stocks = stock_data.sort_values(by=index, ascending=True)
    json_data = sorted_stocks.reset_index(drop=True).to_json(date_format='iso', orient='values')
    return json_data, values

@app.get("/famafrench")
async def fama_french(stockWeights: str, start: str, end: str):
    weighted_portfolio = await stock_weights(stockWeights)
    ff3_monthly = pd.DataFrame(gff.famaFrench3Factor(frequency='m'))
    ff3_monthly.rename(columns={'date_ff_factors':'Date'}, inplace=True)
    ff3_monthly.set_index('Date', inplace=True)
    market_premium = ff3_monthly['Mkt-RF'].mean()
    size_premium = ff3_monthly['SMB'].mean()
    value_premium = ff3_monthly['HML'].mean()
    stocks = list(weighted_portfolio.keys())
    start = dt.datetime.strptime(start, '%Y-%m-%d')
    end = dt.datetime.strptime(end, '%Y-%m-%d')
    uw_portfolio = yf.download(stocks, start=start, end=end)['Adj Close'].pct_change()[1:]
    if len(stocks) == 1:
        weighted_returns = uw_portfolio * weighted_portfolio[stocks[0]]
        portfolio = pd.DataFrame({'Portfolio': weighted_returns})
    else:
        weighted_returns = uw_portfolio * pd.Series(weighted_portfolio)
        portfolio = pd.DataFrame({'Portfolio': weighted_returns.sum(axis=1)})
    portfolio_mtl = portfolio.resample('M').agg(lambda x: (x + 1).prod() - 1)
    factors = pdr.DataReader('F-F_Research_Data_Factors', 'famafrench', start, end)[0][1:]

    if len(portfolio_mtl) != len(factors):
        min_length = min(len(portfolio_mtl), len(factors))
        portfolio_mtl = portfolio_mtl[:min_length]
        factors = factors[:min_length]

    portfolio_mtl.index = factors.index
    merged_port = pd.merge(portfolio_mtl, factors, on='Date')
    port_data = merged_port.copy()
    merged_port[['Mkt-RF','SMB','HML','RF']] = merged_port[['Mkt-RF','SMB','HML','RF']]/100
    merged_port['Excess Portfolio'] = merged_port['Portfolio'] - merged_port['RF']
    y = merged_port['Excess Portfolio']
    x = merged_port[['Mkt-RF','SMB','HML']]
    x = sma.add_constant(x)
    model = sma.OLS(y, x).fit()
    intercept, beta_m, beta_s, beta_v = model.params
    pvalues = model.pvalues
    risk_free = merged_port['RF'].mean()
    expected_return = risk_free + beta_m * market_premium + beta_s * size_premium + beta_v * value_premium
    expected_return = expected_return * 12
    sharpe = (expected_return - risk_free) / merged_port['Excess Portfolio'].std()
    results = {'R-Squared': model.rsquared,
               'HML Beta': model.params['HML'],
               'SMB Beta': model.params['SMB'],
               'Mkt-RF': model.params['Mkt-RF'],
               'intercept': model.params['const'],
               'Expected Return': expected_return * 100,
               'Mkt-RF P-Value': pvalues['Mkt-RF'],
               'SMB P-Value': pvalues['SMB'],
               'HML P-Value': pvalues['HML'],
               'Sharpe Ratio': sharpe,
               'Portfolio Beta': beta_m + beta_s + beta_v,
               }
    port_data['Portfolio'] = port_data['Portfolio'] * 100
    json_data = port_data.to_json(orient='index')
    return json_data, results

if __name__ == "__main__":
    load_dotenv()
    PORT = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=PORT)
    print(f"process id: {os.getpid()}")


    # stream = client.chat.completions.create(
    #     model="gpt-4",
    #     messages=[{"role": "user", "content": "Say this is a test"}],
    #     stream=True,
    # )
    # for chunk in stream:
    #     if chunk.choices[0].delta.content is not None:
    #         print(chunk.choices[0].delta.content, end="")







    
   




