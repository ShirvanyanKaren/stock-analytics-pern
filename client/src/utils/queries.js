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



