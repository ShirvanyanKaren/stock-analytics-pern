const {Model, DataTypes} = require('sequelize');

const sequelize = require('../config/connection.js');


const hstore = require('pg-hstore');



class Portfolio extends Model {}

Portfolio.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
          },
          portfolio_name: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          user_id: {
            type: DataTypes.INTEGER,
            references: {
              model: 'user',
              key: 'id',
            },
          },
          stock_id: {
            type: DataTypes.INTEGER,
            references: {
              model: 'stock',
              key: 'id',
            },
          },
    },
    {
        sequelize,
        timestamps: false,
        freezeTableName: true,
        underscored: true,
        modelName: 'portfolio',
      }
    
);


module.exports = Portfolio;

