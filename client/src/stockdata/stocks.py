from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas_datareader.data as pdr
import datetime as dt
import yfinance as yf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],  
    allow_headers=["*"],  
)


@app.get("/{symbol}/{start}/{end}")
def read_root(symbol, start, end):
    yf.pdr_override()
    start_date = dt.datetime.strptime(start, '%Y-%m-%d')
    end_date = dt.datetime.strptime(end, '%Y-%m-%d')
    stock = pdr.get_data_yahoo(symbol, start_date, end_date)
    stock.reset_index(inplace=True)
    stock['Date'] = stock['Date'].dt.strftime('%Y-%m-%d')
    stock = stock.to_json(orient='records')
    return stock



@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}
     # symbol = 'AAPL'
    # start_date = dt.datetime.strptime('2023-01-01', '%Y-%m-%d')
    # end_date = dt.datetime.strptime('2023-06-01', '%Y-%m-%d')
    # stock = pdr.get_data_yahoo(symbol, start_date, end_date)
    # stock.reset_index(inplace=True)
    # stock = stock.to_json(orient='records')
    # return stock