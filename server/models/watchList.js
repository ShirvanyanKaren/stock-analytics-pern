const {Model, DataTypes} = require('sequelize');
const connection = require('../config/connection.js');

class WatchList extends Model {}

WatchList.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
          },
          watchlist_name: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          metrics: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {
                "stockPerformance": {
                    "open": true,
                    "dayHigh": true,
                    "dayLow": true,
                    "regularMarketPreviousClose": true,
                    "regularMarketOpen": true,
                    "regularMarketDayLow": true,
                    "regularMarketDayHigh": true,
                    "dividendRate": true,
                    "marketCap": true,
                    "bid": true,
                    "ask": true

                },
                "ratios": {
                    "shortRatio": true,
                    "pegRatio": true,
                    "priceToBook": true,
                    "priceToSales": true,

                },
                "financials": {
                }
                }

        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'user',
                key: 'id',
            },
        },
        
    },
    {
        sequelize: connection,
        timestamps: false,
        freezeTableName: true,
        underscored: true,
        modelName: 'watchlist',
    }
);

module.exports = WatchList;
