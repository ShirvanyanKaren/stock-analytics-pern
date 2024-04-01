// const {Model, DataTypes} = require('sequelize');

// const sequelize = require('../config/connection.js');

// class Holding_Asset extends Model{} 

// Holding_Asset.init(
//     {
//         id: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//             primaryKey: true, 
//             autoIncrement: true
//         },
//         asset_id: {
//             type: DataTypes.INTEGER, 
//             references: {
//                 model: 'asset',
//                 key: 'id'
//             }
//         },
//         holding_date: {
//             type: DataTypes.DATE,
//         }
//     }
// )