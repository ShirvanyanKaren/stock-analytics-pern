// connect to postgres database
const { Pool } = require('pg');
const dotenv = require('dotenv');
const Sequelize = require('sequelize');

dotenv.config();

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL)
    : new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PW,
    {
        host: 'localhost',
        dialect: 'postgres',
        port: 5500,
    }
);

module.exports = sequelize;





