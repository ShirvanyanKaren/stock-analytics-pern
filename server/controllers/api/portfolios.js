const { Portfolio, Stock } = require('../../models');
const router = require('express').Router();


router.get('/:user_id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      attributes: ['id', 'portfolio_name'],
      where: { user_id: req.params.user_id },
      include: [
        {
          model: Stock,
          attributes: ['stock_symbol', 'stock_quantity', /* 'could include purchase date'*/],
        },
      ],
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    const portfolioData = portfolio.get({ plain: true });
    portfolioData.stocks = portfolioData.stocks.reduce((acc, stock) => {
        acc[stock.stock_symbol] = stock.stock_quantity;
        return acc;
      }, {});
    res.json(portfolioData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:user_id', async (req, res) => {
    try {
        const portfolio = await Portfolio.create({
            user_id: req.params.user_id,
            portfolio_name: req.body.portfolio_name,
        });
        res.json(portfolio);
    } catch (err) {
        res.status(400).json(err);
    }
});

router.get('/', async (req, res) => {
    try {
        const portfolios = await Portfolio.findAll();
        res.json(portfolios);
    } catch (err) {
        res.status(400).json(err);
    }
});

module.exports = router;
