const typeDefs = ` 
    type User {
        id: ID
        username: String
        email: String
        password: String
    }
    type Portfolio {
        id: ID
        user_id: ID
        stock_id: ID
        quantity: Int
    }
    type Auth {
        token: ID
        user: User
    }
    type Query {
        me: User
        user(username: String!): User
        portfolio(user_id: ID!): [Portfolio]
        users: [User]
    }
    type Mutation {
        login(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        addPortfolio(user_id: ID!, stock_id: ID!, quantity: Int!): Portfolio
    }
`;

module.exports = typeDefs;