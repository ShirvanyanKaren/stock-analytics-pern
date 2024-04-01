const User = require('./user');
const Portfolio = require('./portfolio');
const Stock = require('./stock');

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


module.exports = { User, Portfolio, Stock };