const router = require('express').Router();
const userRoutes = require('./users');
const portfolioRoutes = require('./portfolios');
const stockRoutes = require('./stocks');
const watchListRoutes = require('./watchList');

router.use('/users', userRoutes);
router.use('/portfolios', portfolioRoutes);
router.use('/stocks', stockRoutes);
router.use('/watchlist', watchListRoutes);

module.exports = router;