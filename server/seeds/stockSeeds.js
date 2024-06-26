const SP500Companies = require('./SP500companies.json');

const { Stock, Portfolio, User, WatchList, WatchListStock } = require('../models');
const { json } = require('sequelize');
const {faker} = require('@faker-js/faker');

const jsonString = JSON.stringify(SP500Companies)

const companies = JSON.parse(jsonString);


const stockSeeds = async (amount) => {
   const portfolios = await Portfolio.findAll();
   for(const portfolio of portfolios){
      for (let i = 0; i < amount; i++) {
         let r = Math.floor(Math.random() * companies.length);
         let stock = {
            stock_name: companies[r].name,
            stock_price: companies[r].price,
            stock_symbol: companies[r].ticker,
            stock_quantity: faker.number.int({min: 1, max: 10}),
            portfolio_id: portfolio.id,
            stock_purchase_date: faker.date.past(),
         }
         let watchListStock = {
            stock_symbol: companies[r].ticker,
            watchlist_id: portfolio.user_id,
         }
        await WatchListStock.create(watchListStock);
        await Stock.create(stock);
      }
   }

    console.log(`Seeded ${amount} stocks for ${portfolios.length} user(s)\n---------------------------------📈📈📈`)

}


module.exports = stockSeeds;