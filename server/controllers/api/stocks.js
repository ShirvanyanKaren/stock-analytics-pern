const { Stock, Portfolio } = require('../../models');
const router = require('express').Router();

router.get('/:portfolio_id', async (req, res) => {
    try {
        const stocks = await Stock.findAll({ where: { portfolio_id: req.params.portfolio_id } });
        res.json(stocks);
    } catch (err) {
        res.status(400).json(err);
    }
}
);


router.post('/', async (req, res) => {
    try {
        const { stock_quantity, stock_purchase_date, stock_name, stock_symbol, portfolio_id } = req.body;
        const findStock = await Stock.findOne({ where: { stock_symbol, portfolio_id } });
        if (findStock) {
            const newQuantity = findStock.stock_quantity + stock_quantity;
            await Stock.update({ stock_quantity: newQuantity }, { where: { stock_symbol, portfolio_id } });
            res.json(findStock);
        } else {
            const stock = await Stock.create({ portfolio_id, stock_quantity, stock_purchase_date, stock_name, stock_symbol });
            const portfolio = await Portfolio.findByPk(portfolio_id);
            const newStockId = stock.id;
            if (!portfolio.stock_id.includes(newStockId)) {
                await Portfolio.update({ stock_id: [...portfolio.stock_id, newStockId] }, { where: { id: portfolio_id } });
            }
            res.json(stock);
        }

    } catch (err) {
        res.status(400).json(err);
        
    }
}
);



router.get('/', async (req, res) => {
    try {
        const stocks = await Stock.findAll();
        console.log("all stocks")
        res.json(stocks);
    } catch (err) {
        res.status(400).json(err);
    }
}
);

module.exports = router;