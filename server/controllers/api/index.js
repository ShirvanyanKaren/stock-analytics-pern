const router = require('express').Router();
const userRoutes = require('./users');
const portfolioRoutes = require('./portfolios');
const stockRoutes = require('./stocks');

router.use('/users', userRoutes);
router.use('/portfolios', portfolioRoutes);
router.use('/stocks', stockRoutes);

module.exports = router;