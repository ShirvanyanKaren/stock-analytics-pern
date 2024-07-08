import yfinance as yf

def get_all_financial_ratios(ticker):
    # Fetching the data
    stock = yf.Ticker(ticker)
    
    # Fetching all available key financial metrics
    financial_ratios = stock.info

    return financial_ratios

ticker = 'AAPL'
ratios = get_all_financial_ratios(ticker)

for key, value in ratios.items():
    print(f"{key}: {value}")
