const SP500Companies = require('./SP500companies.json');

const { Stock, Portfolio, User, WatchList, WatchListStock } = require('../models');
const { json } = require('sequelize');
const {faker} = require('@faker-js/faker');

const jsonString = JSON.stringify(SP500Companies)

const companies = JSON.parse(jsonString);

const randomStocks = (amount) => {
   let stocks = new Set();
   while(stocks.size < amount){
      let r = Math.floor(Math.random() * companies.length);
      stocks.add(companies[r]);
   }
   return Array.from(stocks);
}


const stockSeeds = async (amount) => {
   const portfolios = await Portfolio.findAll();
   for(const portfolio of portfolios){
      const stocks = randomStocks(amount);
      for (let i = 0; i < amount; i++) {
         let stock = {
            stock_name: stocks[i].name,
            stock_price: stocks[i].price,
            stock_symbol: stocks[i].ticker,
            stock_quantity: faker.number.int({min: 1, max: 10}),
            portfolio_id: portfolio.id,
            stock_purchase_date: faker.date.past(),
         }
         let watchListStock = {
            stock_symbol: stocks[i].ticker,
            watchlist_id: portfolio.user_id,
         }
        await WatchListStock.create(watchListStock);
        await Stock.create(stock);
      }
   }

    console.log(`Seeded ${amount} stocks for ${portfolios.length} user(s)\n---------------------------------📈📈📈`)

}


module.exports = stockSeeds;