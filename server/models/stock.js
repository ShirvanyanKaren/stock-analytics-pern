const {Model, DataTypes} = require('sequelize');

const sequelize = require('../config/connection.js');

class Stock extends Model {}

Stock.init(
{
    id: {   
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    stock_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stock_symbol: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stock_purchase_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    stock_quantity: {  
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    portfolio_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'portfolio',
            key: 'id',
        },
    },
},
{
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'stock',
  }

);

module.exports = Stock;