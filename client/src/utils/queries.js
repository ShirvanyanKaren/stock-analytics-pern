import { gql } from '@apollo/client';

export const QUERY_ME = gql`
    {
        me {
            id
            username
            email
        }
    }
`;

export const QUERY_USER = gql`
    query user($username: String!) {
        user(username: $username) {
            id
            username
            email
            portfolio_id
        }
    }
`;

export const QUERY_STOCK = gql`
    query stock($portfolioId: ID!) {
        stock(portfolio_id: $portfolioId) {
            stock_name
            stock_purchase_date
            stock_quantity
            stock_symbol
            id
          }
    }
`; 


export const QUERY_STOCK_DATA = gql`
    query getStockData($symbol: String!, $start: String!, $end: String!) {
        getStockData(symbol: $symbol, start: $start, end: $end) {
            stockData
        }
    }
`;

export const QUERY_STOCK_INFO = gql`
    query getStockInfo($symbol: String!) {
        getStockInfo(symbol: $symbol) {
            symbol
        }
    }
`;


export const QUERY_LIN_REG = gql`
    query getLinReg($stocks: String!, $index: String!, $start: String!, $end: String!) {
        getLinReg(stocks: $stocks, index: $index, start: $start, end: $end) {
            LinReg
        }
    }
`;

export const QUERY_STOCK_SEARCH = gql`
    query getStockSearch($query: String!) {
        getStockSearch(query: $query) {
            StockSearch
        }
    }
`;

export const QUERY_STOCK_WEIGHTS = gql`
    query getStockWeights($stocks: Object!) {
        getStockWeights(stocks: $stocks) {
        stockWeights
        }
    }
`;

export const QUERY_PORT = gql`
query GetPort {
    getPort {
      port
    }
  }
`;
