const userSeeds = require('./userSeeds');
const stockSeeds = require('./stockSeeds')
const sequelize = require('../config/connection');

const seedDatabase = async () => {
    await sequelize.sync({ force: true });
    await userSeeds(10);
    await stockSeeds(10);
    process.exit(0);
    }

seedDatabase();