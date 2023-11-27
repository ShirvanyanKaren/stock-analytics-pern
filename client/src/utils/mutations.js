import {gql} from '@apollo/client';

export const LOGIN_USER = gql`
mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password){
        token
        user {
            id
        }
    }
}
`;

export const ADD_USER = gql`
mutation addUser($username: String!, $email: String!, $password: String!) {
  addUser(username: $username, email: $email, password: $password) {
    token
    user {
        id
    }
  }
}
`;
export const ADD_STOCK = gql`
mutation addStocksPortfolio($portfolioId: ID!, $stockName: String!, $stockSymbol: String!, $stockQuantity: Int!, $stockPurchaseDate: String!) {
  addStocksPortfolio(portfolio_id: $portfolioId, stock_name: $stockName, stock_symbol: $stockSymbol, stock_quantity: $stockQuantity, stock_purchase_date: $stockPurchaseDate) {
    portfolio_id
    stock_name
    stock_purchase_date
    stock_quantity
    stock_symbol
  }
}
`;