// connect to postgres database
const { Pool } = require('pg');
const dotenv = require('dotenv');
const Sequelize = require('sequelize');

dotenv.config();
const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
    })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PW,
        {
            host: 'localhost',
            dialect: 'postgres',
            port: 5432,
        }
    );

module.exports = sequelize;