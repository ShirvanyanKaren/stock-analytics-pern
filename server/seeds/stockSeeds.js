const SP500Companies = require('./SP500companies.json');

const { Stock, Portfolio, User} = require('../models');
const { json } = require('sequelize');
const {faker} = require('@faker-js/faker');

var jsonString = JSON.stringify(SP500Companies)

const companies = JSON.parse(jsonString);





const stockSeeds = async (amount) => {
   const portfolios = await Portfolio.findAll();
   for(const portfolio of portfolios){
      for (let i = 0; i < amount; i++) {
         let stock = {
            stock_name: companies[i].name,
            stock_price: companies[i].price,
            stock_symbol: companies[i].ticker,
            stock_quantity: faker.number.int({min: 1, max: 10}),
            portfolio_id: portfolio.id,
            stock_purchase_date: faker.date.past(),
         }
        await Stock.create(stock);
      }
   }

    console.log(`Seeded ${amount} stocks for ${portfolios.length} user(s)\n---------------------------------📈📈📈`)

}


module.exports = stockSeeds;