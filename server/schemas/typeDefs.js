const typeDefs = ` 
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
    type Auth {
        token: ID!
        user: User
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
    }
    type Mutation {
        login(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        addPortfolio(user_id: ID!, portfolio_name: String!): Portfolio
        addStocksPortfolio(portfolio_id: ID!, stock_name: String!, stock_symbol: String!, quantity: Int!, purchase_date: String ): Stock
    }
`;

module.exports = typeDefs;