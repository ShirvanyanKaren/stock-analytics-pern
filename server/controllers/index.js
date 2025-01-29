const router = require('express').Router();
const apiRoutes = require('./api');
const oauthRoutes = require('./oauth');

router.use('/api', apiRoutes);
router.use('/api/oauth', oauthRoutes);

module.exports = router;

