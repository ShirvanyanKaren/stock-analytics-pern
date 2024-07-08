const {Model, DataTypes} = require('sequelize');

const sequelize = require('../config/connection.js');

class WatchListStock extends Model {}

WatchListStock.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
          },
          stock_symbol: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          watchlist_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'watchlist',
                key: 'id',
            },
            },
    },
    {
        sequelize,
        timestamps: false,
        freezeTableName: true,
        underscored: true,
        modelName: 'watch',
      }
);

module.exports = WatchListStock;