const { GraphQLScalarType } = require('graphql');


const typeDefs = ` 
    scalar JSON 
    scalar Object

    type User {
        id: ID
        username: String
        email: String
        password: String
        portfolio_id: ID
        portfolios: Portfolio 
    }
    type Portfolio {
        portfolio_name: String
        id: ID
        user_id: ID
        stock_id: ID
    }
    type Stock { 
        id: ID
        stock_name: String
        stock_symbol: String
        stock_purchase_date: String
        stock_quantity: Int
        portfolio_id: ID
    } 
    type StockData {
        stockData: JSON
    }
    type StockInfo {
        symbol: JSON
    }
    type LinReg {
        linReg: JSON
    }
    type StockSearch {
        stockSearch: JSON
    }
    type StockWeights {
        stockWeights: Object
    }
    type Auth {
        token: ID!
        user: User
    }

    type Port {
        port: Int
    }

    type Query {
        me: User
        user(username: String!): User
        userFindByPk(id: ID!, context: Int): User
        portfolio(user_id: ID!): [Portfolio]
        users: [User]
        portfolios: [Portfolio]
        stock(portfolio_id: ID!): [Stock]
        stocks: [Stock]
        getStockData(symbol: String!, start: String!, end: String!): StockData
        getStockInfo(symbol: String!): StockInfo
        getLinReg(stocks: String!, index: String!, start: String!, end: String!): LinReg
        getStockSearch(query: String!): StockSearch
        getStockWeights(stocks: Object!): StockWeights
        getPort: Port
    }
    type Mutation {
        login(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        addPortfolio(user_id: ID!, portfolio_name: String!): Portfolio
        addStocksPortfolio(portfolio_id: ID!, stock_name: String!, stock_symbol: String!, stock_quantity: Int!, stock_purchase_date: String!): Stock
    }
`;

module.exports = typeDefs;