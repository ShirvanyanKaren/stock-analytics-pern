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
import asyncio
import concurrent.futures
import uvicorn
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from openai import OpenAI
from typing import List


load_dotenv()

app = FastAPI()

class SymbolList(BaseModel):
    symbols: list[str]

#app.add_middleware(
    #CORSMiddleware,
   # allow_origins=["*"],
    #allow_credentials=True,
    #allow_methods=["*"],
    #allow_headers=["*"], 
#)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your React app's URL
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


# function for the dashboard page and stockcards components

@app.get("/financials")
def all_statements(symbol: str, quarterly: bool):
    stock = yf.Ticker(symbol)
    try:
        if quarterly:
            income = stock.quarterly_financials
            balance = stock.quarterly_balance_sheet
            cash = stock.quarterly_cashflow
        else:
            income = stock.financials
            balance = stock.balance_sheet
            cash = stock.cashflow

        # Get the most recent date
        most_recent_date = max(income.columns[0], balance.columns[0], cash.columns[0])

        # Select only the most recent data
        income = income[most_recent_date].to_frame().T
        balance = balance[most_recent_date].to_frame().T
        cash = cash[most_recent_date].to_frame().T

        income.reset_index(inplace=True)
        balance.reset_index(inplace=True)
        cash.reset_index(inplace=True)

        return {
            'income': income.to_json(orient='records'),
            'balance': balance.to_json(orient='records'),
            'cash': cash.to_json(orient='records')
        }
    except Exception as e:
        print(f"Error fetching financial data for {symbol}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching financial data")


def process_symbol(symbol: str):
    symbol = symbol.upper()
    if "-" in symbol and "KS" in symbol:
        symbol = symbol.replace("-", ".")
    return symbol

def fetch_stock_info(symbol: str):
    try:
        stock_info = Ticker(symbol).summary_detail
        stock_key_stats = Ticker(symbol).key_stats or { symbol: {} }
        long_name = Ticker(symbol).price[symbol]['longName']
        long_name = Ticker(symbol).price[symbol]['longName']
        if type(stock_key_stats[symbol]) == 'dict':
            for key, value in stock_key_stats[symbol].items():
                if key not in stock_info[symbol]:
                    stock_info[symbol][key] = value
        stock_info[symbol]['longName'] = long_name
        stock_info[symbol]['52WeekHigh'] = stock_info[symbol].pop('fiftyTwoWeekHigh')
        stock_info[symbol]['52WeekLow'] = stock_info[symbol].pop('fiftyTwoWeekLow')
        stock_info[symbol]['stockSymbol'] = symbol
        return stock_info
    except Exception as e:
        print(f"error fetching data for {symbol}: {e}")

def fetch_stock_graph(symbol: str, start: str, end: str):
    start_date = dt.datetime.strptime(start, '%Y-%m-%d')
    end_date = dt.datetime.strptime(end, '%Y-%m-%d')
    stock = yf.download(symbol, start=start_date, end=end_date)
    stock.reset_index(inplace=True)
    stock['Date'] = stock['Date'].dt.strftime('%Y-%m-%d')
    stock = stock.to_json(orient='records')
    return stock

@app.get("/stockweights")
async def stock_weights(stocks: str):
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
            if arr[i] : model_obj[arr[i].replace(':', '')] = arr[i+1]
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
    merged_port[['Mkt-RF','SMB','HML','RF']] =  merged_port[['Mkt-RF','SMB','HML','RF']]/100
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

@app.get("/gpt-analysis")
async def gpt3():
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    completion = await client.chat.completions.create(model="gpt-3.5-turbo", messages=[{"role": "user", "content": "hello"}])
    return completion.choices[0].message['content']



def fetch_stock_overview(symbol):
    try:
        stock = Ticker(symbol)
        stock_summary = stock.summary_detail[symbol]
        stock_price = stock.price[symbol]
        overview = {
            "price": stock_price.get('regularMarketPrice', 'N/A'),
            "priceChange": stock_price.get('regularMarketChange', 'N/A'),
            "priceChangePercent": stock_price.get('regularMarketChangePercent', 'N/A'),
            "afterHoursPrice": stock_price.get('postMarketPrice', 'N/A'),
            "afterHoursChange": stock_price.get('postMarketChange', 'N/A'),
            "afterHoursChangePercent": stock_price.get('postMarketChangePercent', 'N/A'),
            "lastCloseTime": stock_price.get('regularMarketTime', 'N/A'),
            "afterHoursTime": stock_price.get('postMarketTime', 'N/A'),
            "symbol": symbol,
        }
        return overview
    except Exception as e:
        print(f"Error fetching data for {symbol}: {e}")
        return None

@app.post("/fetch-stock-overview")
async def stock_overview(symbols: SymbolList):
    try:
        loop = asyncio.get_event_loop()
        with concurrent.futures.ThreadPoolExecutor() as executor:
            tasks = [loop.run_in_executor(executor, fetch_stock_overview, symbol) for symbol in symbols.symbols]
            res = await asyncio.gather(*tasks)
        return [r for r in res if r is not None]
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error fetching stock data")

@app.get("/stock-statistics")
async def stock_statistics(symbol: str):
    stock = yf.Ticker(symbol)
    try:
        stats = stock.info
    except ValueError as e:
        print(f"Failed to fetch data: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch stock statistics")
    return stats



class SymbolList(BaseModel):
    symbols: List[str]


@app.post("/get-financial-metrics")
def get_financial_metrics(symbols: SymbolList):
    unique_metrics = set()
    for symbol in symbols.symbols:
        ticker = yf.Ticker(symbol)
        financials = ticker.quarterly_financials
        if financials.empty:
            print(f"No financial data available for {symbol}.")
            continue
        most_recent_quarter = financials.columns[0]
        metrics = financials[most_recent_quarter].dropna().index.tolist()
        unique_metrics.update(metrics)
    return list(unique_metrics)


# new function for stockfinancials.jsx component, we used the old one for the metrics

@app.get("/financial_statements")
def get_financial_statements(symbol: str, quarterly: bool):
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






import io
import base64
import matplotlib.pyplot as plt
from fastapi import FastAPI, HTTPException
import yfinance as yf
import pandas as pd
import numpy as np
import scipy.stats as stats

@app.get("/standard-deviation")
def get_standard_deviation(symbol: str, start_date: str, end_date: str):
    try:
        # Fetch data
        stock_data = yf.download(symbol, start=start_date, end=end_date)
        
        # Calculate daily change percentage
        stock_data['Daily Change %'] = ((stock_data['Close'] - stock_data['Open']) / stock_data['Open']) * 100
        
        # Define bins and labels
        bins = np.arange(-3, 3.5, 0.5).tolist()
        bin_labels = [f"{bins[i]:.1f}% to {bins[i+1]:.1f}%" for i in range(len(bins)-1)]
        stock_data['Bin'] = pd.cut(stock_data['Daily Change %'], bins=bins, labels=bin_labels, include_lowest=True)

        # Create frequency table
        frequency_table = pd.DataFrame({
            'Bins': stock_data['Bin'].value_counts(sort=False).index.categories,
            'Qty': stock_data['Bin'].value_counts(sort=False).values
        })
        frequency_table['Qty%'] = (frequency_table['Qty'] / frequency_table['Qty'].sum()) * 100
        frequency_table['Cum%'] = frequency_table['Qty%'].cumsum()
        frequency_table.sort_values(by='Bins', inplace=True)
        frequency_table['Qty%'] = frequency_table['Qty%'].map('{:.2f}%'.format)
        frequency_table['Cum%'] = frequency_table['Cum%'].map('{:.2f}%'.format)

        # Create statistics table
        stats_data = {
            'Up Days': ((stock_data['Close'] > stock_data['Open']).sum(), f"{stock_data[stock_data['Close'] > stock_data['Open']]['Daily Change %'].max():.2f}%"),
            'Down Days': ((stock_data['Close'] < stock_data['Open']).sum(), f"{stock_data[stock_data['Close'] < stock_data['Open']]['Daily Change %'].min():.2f}%"),
            'Average': (stock_data['Daily Change %'].mean(),),
            'ST DEV': (stock_data['Daily Change %'].std(),),
            'Variance': (stock_data['Daily Change %'].var(),),
            'Max': (stock_data['Daily Change %'].max(),),
            'Min': (stock_data['Daily Change %'].min(),)
        }
        stats_df = pd.DataFrame(stats_data, index=['Value', 'Percent' if 'Percent' in stats_data else '']).T
        stats_df['Value'] = stats_df['Value'].astype(float).map('{:.2f}'.format)
        stats_df = stats_df.reset_index().rename(columns={'index': 'Statistic'})

        # Calculate price differences for standard deviation analysis
        stock_data['Daily_Price_Difference'] = stock_data['Close'] - stock_data['Open']
        stock_data['Weekly_Price_Difference'] = stock_data['Close'] - stock_data['Open'].shift(4)
        stock_data['Monthly_Price_Difference'] = stock_data['Close'] - stock_data['Open'].shift(19)

        # Calculate standard deviations
        daily_std = np.std(stock_data['Daily_Price_Difference'])
        weekly_std = np.std(stock_data['Weekly_Price_Difference'].dropna())
        monthly_std = np.std(stock_data['Monthly_Price_Difference'].dropna())

        current_stock_price = stock_data['Close'].iloc[-1]

        # Create price table
        prices_data = {
            'Frequency': ['Daily', 'Weekly', 'Monthly'],
            '1st Std Deviation (-)': [current_stock_price - daily_std, current_stock_price - weekly_std, current_stock_price - monthly_std],
            '1st Std Deviation (+)': [current_stock_price + daily_std, current_stock_price + weekly_std, current_stock_price + monthly_std],
            '2nd Std Deviation (-)': [current_stock_price - 2 * daily_std, current_stock_price - 2 * weekly_std, current_stock_price - 2 * monthly_std],
            '2nd Std Deviation (+)': [current_stock_price + 2 * daily_std, current_stock_price + 2 * weekly_std, current_stock_price + 2 * monthly_std],
            '3rd Std Deviation (-)': [current_stock_price - 3 * daily_std, current_stock_price - 3 * weekly_std, current_stock_price - 3 * monthly_std],
            '3rd Std Deviation (+)': [current_stock_price + 3 * daily_std, current_stock_price + 3 * weekly_std, current_stock_price + 3 * monthly_std]
        }
        prices_table = pd.DataFrame(prices_data)

        # Generate plots
        histogram_plot = generate_histogram_plot(stock_data, symbol)
        daily_plot = generate_distribution_plot(stock_data['Daily_Price_Difference'], daily_std, 'Daily', symbol)
        weekly_plot = generate_distribution_plot(stock_data['Weekly_Price_Difference'].dropna(), weekly_std, 'Weekly', symbol)
        monthly_plot = generate_distribution_plot(stock_data['Monthly_Price_Difference'].dropna(), monthly_std, 'Monthly', symbol)
        frequency_bar_chart = generate_frequency_bar_chart(frequency_table, symbol)

        return {
            "frequency_table": frequency_table.to_dict(orient='list'),
            "stats_df": stats_df.to_dict(orient='list'),
            "stats": {
                "daily_std": daily_std,
                "weekly_std": weekly_std,
                "monthly_std": monthly_std,
                "current_price": current_stock_price
            },
            "prices_table": prices_table.to_dict(orient='list'),
            "histogram_plot": histogram_plot,
            "daily_plot": daily_plot,
            "weekly_plot": weekly_plot,
            "monthly_plot": monthly_plot,
            "frequency_bar_chart": frequency_bar_chart
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_histogram_plot(stock_data, symbol):
    plt.switch_backend('Agg')  # Use a non-interactive backend
    plt.figure(figsize=(10, 6))
    plt.hist(stock_data['Daily_Price_Difference'], bins=30, color='blue', alpha=0.4, label='Daily')
    plt.hist(stock_data['Weekly_Price_Difference'].dropna(), bins=30, color='green', alpha=0.4, label='Weekly')
    plt.hist(stock_data['Monthly_Price_Difference'].dropna(), bins=30, color='red', alpha=0.4, label='Monthly')
    plt.title(f'{symbol} Price Difference Histograms')
    plt.xlabel('Price Difference')
    plt.ylabel('Frequency')
    plt.legend(loc='upper right')
    return plot_to_base64(plt)

def generate_distribution_plot(changes, std, label, symbol):
    plt.switch_backend('Agg')  # Use a non-interactive backend
    mean_change = changes.mean()
    plt.figure(figsize=(10, 6))
    hist_data = plt.hist(changes, bins=30, color='blue', alpha=0.5, density=True, label=f'{label} Price Difference')
    xmin, xmax = plt.xlim()
    x = np.linspace(xmin, xmax, 100)
    p = stats.norm.pdf(x, mean_change, std)
    plt.plot(x, p, 'k', linewidth=2, label='Normal Distribution Fit')
    plt.title(f'Normal Distribution Fit for {label} Price Differences of {symbol}')
    plt.xlabel(f'{label} Price Difference')
    plt.ylabel('Density')
    plt.axvline(mean_change, color='red', linestyle='dashed', linewidth=2, label='Mean')
    plt.axvline(mean_change + std, color='green', linestyle='dashed', linewidth=2, label='+1 STD')
    plt.axvline(mean_change - std, color='green', linestyle='dashed', linewidth=2, label='-1 STD')
    plt.axvline(mean_change + 2 * std, color='yellow', linestyle='dashed', linewidth=2, label='+2 STD')
    plt.axvline(mean_change - 2 * std, color='yellow', linestyle='dashed', linewidth=2, label='-2 STD')
    plt.axvline(mean_change + 3 * std, color='orange', linestyle='dashed', linewidth=2, label='+3 STD')
    plt.axvline(mean_change - 3 * std, color='orange', linestyle='dashed', linewidth=2, label='-3 STD')
    plt.legend()
    return plot_to_base64(plt)

def generate_frequency_bar_chart(frequency_table, symbol):
    plt.switch_backend('Agg')  # Use a non-interactive backend
    plt.figure(figsize=(12, 8))
    plt.barh(np.arange(len(frequency_table)), frequency_table['Qty'], color='blue', edgecolor='black')
    plt.xlabel('Frequency')
    plt.ylabel('Daily Change in %')
    plt.title(f'Daily Change in Percentage from Open to Close, past 6 months - {symbol}')
    plt.yticks(ticks=np.arange(len(frequency_table)), labels=frequency_table['Bins'])
    plt.gca().invert_yaxis()
    plt.grid(axis='x', linestyle='--', alpha=0.7)
    plt.tight_layout()
    return plot_to_base64(plt)

def plot_to_base64(plt):
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close()
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode('utf-8')

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







    
   



    
   