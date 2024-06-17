import dash
from dash import html, dcc
from dash.dependencies import Input, Output, State
from dash.dash_table import DataTable
import plotly.graph_objs as go
import yfinance as yf
from datetime import datetime
import requests
import json
from dash.exceptions import PreventUpdate
import json
import openai
from dash.dependencies import Input, Output, State
from dash import html

openai.api_key = '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'

# Initialize the Dash app with suppress_callback_exceptions set to True
app = dash.Dash(__name__, external_stylesheets=['https://codepen.io/chriddyp/pen/bWLwgP.css'], suppress_callback_exceptions=True)

# Define the layout of the app
app.layout = html.Div([
    # Header
    
    html.Div([
        html.H2('Stock Data Dashboard', style={'float': 'left'}),
    ]),
    # Input, Submit Button, and Time Range Buttons
    html.Div([
        dcc.Input(id='stock-input', type='text', value='TSLA', placeholder='Enter a stock symbol...', style={'width': '300px'}),
        html.Button('Submit', id='submit-button', n_clicks=0),
        html.Div(id='time-range-buttons', children=[
            html.Button('1D', id='1d', n_clicks=0),
            html.Button('1W', id='1w', n_clicks=0),
            html.Button('1M', id='1m', n_clicks=0),
            html.Button('6M', id='6m', n_clicks=0),
            html.Button('1Y', id='1y', n_clicks=0),
            html.Button('5Y', id='5y', n_clicks=0),
        ], style={'padding': '10px'}),
    ]),
    # Stock Chart
    html.Div([
        dcc.Graph(id='stock-chart'),
    ], style={'width': '70%', 'display': 'inline-block', 'padding': '0 20'}),
    # Stock Details
    html.Div([
        html.Div(id='stock-details'),
    ], style={'width': '30%', 'display': 'inline-block', 'vertical-align': 'top'}),
    # Financial Statement Buttons
    html.Div([
            dcc.Tabs(id="tabs", children=[
        dcc.Tab(label="Financial Statements", children=[
            html.Div([
                html.Button('Income Statement', id='income-statement', n_clicks=0),
                html.Button('Balance Sheet', id='balance-sheet', n_clicks=0),
                html.Button('Cash Flow', id='cash-flow', n_clicks=0),
            ], style={'padding': '80px', 'textAlign': 'center'}),
            html.Div(id='financials-table'),
        ]),
        dcc.Tab(label="Statistics & Ratios", children=[
            html.Div(id='statistics-and-ratios'),
        ]),
    ]),
    ], style={'padding': '20px', 'textAlign': 'center'}),
    # Financials Data Table
    html.Div(id='financials-table'),
    # Hidden div for storing JSON data
    html.Div(id='financial-data-json', style={'display': 'none'}),
    # Chatbot UI in the corner of the app

# Chatbot UI enhanced and made draggable
    html.Div([
        dcc.Textarea(id='chat-input', placeholder='Ask a financial question...', style={
            'width': '100%', 'height': '100px', 'padding': '10px', 'box-sizing': 'border-box',
            'border': '2px solid #ccc', 'border-radius': '4px', 'background-color': '#f8f8f8',
            'resize': 'none', 'font-size': '16px'}),
        html.Button('Ask', id='ask-chatbot', n_clicks=0, style={
            'width': '100%', 'padding': '10px 20px', 'margin-top': '10px', 'border': 'none',
            'border-radius': '4px', 'background-color': '#007BFF', 'color': 'white',
            'font-size': '16px'}),
        html.Div(id='chatbot-response', style={'margin-top': '10px'})
    ], style={'position': 'fixed', 'bottom': '90px', 'right': '100px', 'width': '300px',
            'background-color': '#fff', 'box-shadow': '0 2px 10px rgba(0,0,0,0.1)',
            'border-radius': '8px', 'padding': '20px', 'box-sizing': 'border-box',
            'resize': 'both', 'overflow': 'auto', 'cursor': 'move'}, className='draggable')



])


    
# Helper function to fetch and return stock data
def fetch_stock_data(stock_symbol, period, interval):
    stock_data = yf.download(stock_symbol, period=period, interval=interval)
    stock_data.reset_index(inplace=True)
    return stock_data

# Callback to update the stock chart
@app.callback(
    Output('stock-chart', 'figure'),
    [Input('submit-button', 'n_clicks')],
    [State('stock-input', 'value'),
     State('1d', 'n_clicks'),
     State('1w', 'n_clicks'),
     State('1m', 'n_clicks'),
     State('6m', 'n_clicks'),
     State('1y', 'n_clicks'),
     State('5y', 'n_clicks')]
)
def update_graph(n_clicks, stock_symbol, n1d, n1w, n1m, n6m, n1y, n5y):
    if n_clicks > 0:
        # Define period and interval based on which button was clicked most recently
        button_id, _ = max(
            [('1d', n1d), ('1w', n1w), ('1m', n1m), ('6m', n6m), ('1y', n1y), ('5y', n5y)],
            key=lambda item: item[1]
        )
        
        periods_intervals = {
            '1d': ('1d', '1m'),
            '1w': ('7d', '15m'),
            '1m': ('1mo', '1h'),
            '6m': ('6mo', '1d'),
            '1y': ('1y', '1d'),
            '5y': ('5y', '1wk'),
        }
        period, interval = periods_intervals[button_id]
        
        # Fetch stock data
        stock_data = fetch_stock_data(stock_symbol, period, interval)
        
        # Create the figure with the stock data
        fig = go.Figure(data=[go.Candlestick(
            x=stock_data.index,
            open=stock_data['Open'],
            high=stock_data['High'],
            low=stock_data['Low'],
            close=stock_data['Close']
        )])
        
        # Update layout to customize the look of the chart
        fig.update_layout(
            title=f'{stock_symbol} Share Price',
            xaxis_title='Date',
            yaxis_title='Price',
            xaxis_rangeslider_visible=False
        )
        return fig
    else:
        return go.Figure()
# Callback to update the financials data table based on the selected statement

@app.callback(
    [Output('financials-table', 'children'),
     Output('financial-data-json', 'children')],
    [Input('income-statement', 'n_clicks'),
     Input('balance-sheet', 'n_clicks'),
     Input('cash-flow', 'n_clicks')],
    [State('stock-input', 'value')]
)
def update_financials(income_n_clicks, balance_n_clicks, cash_n_clicks, stock_symbol):
    ctx = dash.callback_context
    if not ctx.triggered:
        raise PreventUpdate

    button_id = ctx.triggered[0]['prop_id'].split('.')[0]

    ticker = yf.Ticker(stock_symbol)
    
    financials = None
    if button_id == 'income-statement':
        financials = ticker.financials
    elif button_id == 'balance-sheet':
        financials = ticker.balance_sheet
    elif button_id == 'cash-flow':
        financials = ticker.cashflow

    if financials is not None and not financials.empty:
        financials.columns = financials.columns.strftime('%Y-%m-%d')
        financials.reset_index(inplace=True)
        financials.rename(columns={'index': 'Metric'}, inplace=True)
        
        data = financials.to_dict('records')
        financial_data_json = financials.to_json(date_format='iso')

        # Custom tooltip data based on financial metrics
        custom_tooltips = {
            'Revenue': 'Total income from business operations.',
            'Gross Profit': 'Income after subtracting cost of sales.',
            # Add more custom tooltips for other metrics as needed
        }

        tooltip_data = []
        for row in data:
            row_tooltips = {}
            for column, value in row.items():
                if column == 'Metric' and value in custom_tooltips:
                    row_tooltips[column] = {'value': custom_tooltips[value], 'type': 'markdown'}
                else:
                    row_tooltips[column] = {'value': str(value), 'type': 'markdown'}
            tooltip_data.append(row_tooltips)

        columns = [{"name": 'Metric', "id": 'Metric'}]
        columns.extend([{"name": col, "id": col} for col in financials.columns if col != 'Metric'])

        return (
            DataTable(
                id='table',
                columns=columns,
                data=data,
                tooltip_data=tooltip_data,
                style_table={'height': '900px', 'overflowY': 'auto'},
                style_cell={'textAlign': 'left'},
                style_header={
                    'backgroundColor': 'white',
                    'fontWeight': 'bold'
                },
                tooltip_duration=None,
            ),
            financial_data_json
        )
    else:
        return html.Div("Financial data not available."), "{}"

    


@app.callback(
    Output('statistics-and-ratios', 'children'),
    [Input('stock-input', 'value')]
)
def update_statistics(stock_symbol):
    ticker = yf.Ticker(stock_symbol)
    stats = ticker.info

    # Example: Extract some statistics
    market_cap = stats.get('marketCap')
    pe_ratio = stats.get('trailingPE')
    dividend_yield = stats.get('dividendYield')

    # Create a simple layout to display these statistics
    stats_layout = html.Div([
        html.P(f"Market Cap: {market_cap}"),
        html.P(f"PE Ratio: {pe_ratio}"),
        html.P(f"Dividend Yield: {dividend_yield}"),
    ])

    return stats_layout


# Callback to handle chatbot interactions
@app.callback(
    Output('chatbot-response', 'children'),
    Input('ask-chatbot', 'n_clicks'),
    State('chat-input', 'value'),
    State('financial-data-json', 'children')
)
def handle_chatbot_interaction(n_clicks, user_input, financial_data_json):
    if n_clicks > 0 and user_input:
        # Load financial data stored as JSON
        financial_data = json.loads(financial_data_json)

        # Prepare the context for the chatbot based on financial data
        context = "Here's the financial data:\n" + "\n".join(
            [f"{metric}: {data}" for metric, data in financial_data.items()]
        ) + "\n\n"  # Ensure there's a newline before the user input

        # Prepare the payload for the API call
        prompt_text = context + user_input + "\n you are a PROFESSIONAL CFA in the year 2024 that provides financial insights IN THE DATA PROVIDED. Only WHEN ASKED, provide defintions for FOR THE METRICS/Labels from the data provided. Explain things at the Lexile level of 750L. If you dont know based off the information SAY I DONT KNOW in a polite way."

        try:
            # Make the API call using openai package
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": "Here's the financial data."},
                          {"role": "user", "content": prompt_text}],
            )

            # Extract the chat response
            chat_response = response.choices[0].message['content'].strip()
            return html.Div(chat_response)
        except Exception as e:
            return html.Div(f"An error occurred: {e}")


if __name__ == '__main__':
    app.run_server(debug=True)
