const { AuthenticationError } = require("../utils/auth");
const { User, Portfolio, Stock } = require("../models");
const { signToken } = require("../utils/auth");
const port = process.env.PORT || 8000;
const axios = require("axios");


const resolvers = {
  Query: {
    me: async (parent, args, { context }) => {
      context.user = await User.findByPk(context.user.id);
      console.log(context.user);
      if (context.user) {
        return await User.findByPk(context.user.id);
      }
      throw new AuthenticationError("Not logged in");
    },
    user: async (parent, { username: username }) => {
      console.log(username);
      return await User.findOne({ where: { username: username } });
    },
    userFindByPk: async (parent, { id }) => {
      console.log(id);
      return await User.findByPk(id);
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
    getStockData: async (parent, { symbol, start, end }) => {
      const response = await axios.get(`http:////127.0.0.1:${port}/stockgraph`, 
      {
        params : {
          symbol: symbol,
          start: start,
          end: end,
        },
      });
      console.log(response.data);
      return response.data;

    },
    getStockInfo: async (parent, {symbol}) => {
      console.log(symbol);
      const response = await axios.get(`http:////127.0.0.1:${port}/stockinfo`,
      {
        params : {
          symbol: symbol,
        },
      });
      console.log(response.data);
      return response.data;
  },
  getLinReg: async (parent, {stocks, index, start, end}) => {
    const response = await axios.get(`http:////127.0.0.1:${port}/linreg`,
    {
      params : {
        stocks: stocks,
        index: index,
        start: start,
        end: end,
    
      }
    });
    console.log(response.data);
    return response.data;
  },
  getStockSearch: async (parent, {query}) => {
    const response = await axios.get(`https://eodhd.com/api/query-search-extended/?q=${query}&api_token=${process.env.API_KEY}`);
    console.log(response.data);
    return response.data;
  },
  getStockWeights: async (parent, {stocks}) => {
    console.log(stocks);
    const stockJson = JSON.stringify(stocks);
    const response = await axios.get(`http:////127.0.0.1:${port}/stockweights`,
    {
      params : {
        stocks: stockJson,
      },
    });
    console.log(response.data);
    return response.data;
  },
  getPort: async () => {
    const port =  process.env.PORT || 8000; 
    console.log(port);
    return { port };
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

      const portfolio = await Portfolio.create({
        user_id: user.id,
        portfolio_name: `${user.username}'s Portfolio`,
        stock_id: [],
      });

      await User.update(
        {
          portfolio_id: portfolio.id,
        },
        {
          where: {
            id: user.id,
          },
        }
      );

      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ where: { email: email } });
      if (!user || !user.checkPassword(password)) {
        throw new AuthenticationError("Incorrect Credentials");
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
      console.log(args);
      const findStock = await Stock.findOne({
        where: {
          stock_symbol: args.stock_symbol,
          portfolio_id: args.portfolio_id,
        },
      });
      if (findStock) {
        const newQuantity = findStock.stock_quantity + args.stock_quantity;
        await Stock.update(
          {
            stock_quantity: newQuantity,
          },
          {
            where: {
              stock_symbol: args.stock_symbol,
              portfolio_id: args.portfolio_id,
            },
          }
        );
        return findStock;
      } else {
        const stock = await Stock.create({
          portfolio_id: args.portfolio_id,
          stock_quantity: args.stock_quantity,
          stock_purchase_date: args.stock_purchase_date,
          stock_name: args.stock_name,
          stock_symbol: args.stock_symbol,
        });
        const portfolio = await Portfolio.findByPk(args.portfolio_id);
        const newStockId = stock.id;
        console.log(newStockId);
        console.log(portfolio.stock_id);
        if (!portfolio.stock_id.includes(newStockId)) {
          await Portfolio.update(
            {
              stock_id: [...portfolio.stock_id, newStockId],
            },
            {
              where: {
                id: args.portfolio_id,
              },
            }
          );
          return stock;
        }
      }
    },
  },
};

module.exports = resolvers;
