const User = require('./user');
const Portfolio = require('./portfolio');
const Stock = require('./stock');
const WatchList = require('./watchList');
const WatchListStock = require('./watchListStock');

User.hasOne(Portfolio, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});

Portfolio.belongsTo(User, {
    foreignKey: 'user_id'
});

Portfolio.hasMany(Stock, {
    foreignKey: 'portfolio_id',
    onDelete: 'CASCADE'
});

Stock.belongsTo(Portfolio, {
    foreignKey: 'portfolio_id'
});

User.hasMany(WatchList, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});

WatchList.belongsTo(User, {
    foreignKey: 'user_id'
});

WatchList.hasMany(WatchListStock, {
    foreignKey: 'watchlist_id',
    onDelete: 'CASCADE'
});

WatchListStock.belongsTo(WatchList, {
    foreignKey: 'watchlist_id'
});




module.exports = { User, Portfolio, Stock, WatchList, WatchListStock };