const { AuthenticationError } = require('../utils/auth');
const { User, Portfolio, Stock} = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return await User.findByPk(context.user.id);
      }
      throw new AuthenticationError('Not logged in');
    },
    user: async (parent, { username }) => {
      return await User.findOne({ where: { username: username } });
    },
    portfolio: async (parent, { user_id }) => {
      return await Portfolio.findAll({ where: { user_id: user_id } });
    },
    users: async () => {
      return await User.findAll();
    },
    portfolios: async () => {
      return await Portfolio.findAll();
    },
    stocks: async () => {
        return await Stock.findAll();
    },
    stock: async (parent, { portfolio_id }) => {
        return await Stock.findAll({ where: { portfolio_id: portfolio_id } });
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
        console.log(args);
      const user = await User.create({
        username: args.username,
        email: args.email,
        password: args.password,
      });
      

      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ where: { email: email } });
      if (!user || !user.checkPassword(password)) {
        throw new AuthenticationError('Incorrect Credentials');
      }

      const token = signToken(user);
      return { token, user };
    },
    addPortfolio: async (parent, args) => {
      return await Portfolio.create({
        user_id: args.user_id,
        portfolio_name: args.portfolio_name,
      });
    },
    addStocksPortfolio: async (parent, args) => {
      return await Stock.create({
        portfolio_id: args.portfolio_id,
        stock_quantity: args.quantity,
        purchase_date: args.purchase_date,
        stock_name: args.stock_name,
        stock_symbol: args.stock_symbol,
      });
    }, 
  },
};

module.exports = resolvers;
 