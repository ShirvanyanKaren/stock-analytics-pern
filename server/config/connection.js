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



// postgres://bldnzmviigksrq:332889e3062e2302bf458bc3d07040b9b12888b447422e5cf41e9ca415bfcc15@ec2-44-206-204-65.compute-1.amazonaws.com:5432/dcao9skcfluvkl

// psql --host=ec2-44-206-204-65.compute-1.amazonaws.com --port=5432 --username=bldnzmviigksrq --password --dbname=dcao9skcfluvkl

// 332889e3062e2302bf458bc3d07040b9b12888b447422e5cf41e9ca415bfcc15