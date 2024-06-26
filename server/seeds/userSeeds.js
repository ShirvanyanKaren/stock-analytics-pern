const { faker } = require('@faker-js/faker')
const {User, Portfolio, WatchList}= require('../models')


const userSeeds = async (amount) => {
    const users = []

    for (let i = 0; i < amount; i++) {
        const user = {
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password: "password"
        }
        users.push(user)
    }

    const uniqueUsers = [...new Set(users)]

    for (const user of uniqueUsers) {
        let newUser = await User.create(user)
        await User.update({
            portfolio_id: newUser.id,
        }, {
            where: {
                id: newUser.id,
            },
        });
        let thisUser = await User.findOne({ where: { username: user.username } })
        await Portfolio.create({
            user_id: thisUser.id,
            portfolio_name: `${user.username}'s Portfolio`,
            
        })
        await WatchList.create({
            user_id: thisUser.id,
            watchlist_name: `${user.username}'s Watchlist`,
        })
    }

    console.log(`Seeded ${uniqueUsers.length} users and portfolios\n---------------------------------🧑‍💻`)
}


module.exports = userSeeds