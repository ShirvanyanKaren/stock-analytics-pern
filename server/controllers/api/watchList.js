const { WatchList, WatchListStock, User } = require('../../models');
const router = require('express').Router();

router.get('/', async (req, res) => {
    try {
        const watchLists = await WatchList.findAll({
            include: [
                {
                    model: WatchListStock,
                    attributes: ['stock_symbol',],
                },

            ],
        });
        const watchListData = watchLists.map((watchlist) => watchlist.get({ plain: true }));
        for(const watchList of watchListData){
            watchList.watches = watchList.watches.reduce((acc, stock) => {
                acc.push(stock.stock_symbol);
                return acc;
            }, []);
        }
        res.json(watchListData);
    } catch (err) {
        res.status(400).json(err);
    }
}
);

router.get('/:user_id', async (req, res) => {
    try {
        const watchLists = await WatchList.findAll({
            where: { 
                user_id: req.params.user_id,
             },
            include: [
                {
                    model: WatchListStock,
                    attributes: ['stock_symbol',],
                },

            ],
        });
        if (!watchLists) return res.status(404).json({ message: 'No WatchList not found' });
        const result = {};
        for(const watchList of watchLists){
            result[watchList.watchlist_name] = watchList.get({ plain: true });
            result[watchList.watchlist_name].watches = watchList.watches.reduce((acc, stock) => {
                acc.push(stock.stock_symbol);
                return acc;
            }, []);
        }
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/:user_id', async (req, res) => {
    try {
        const findWatchList = await WatchList.findOne({
            where: {
                user_id: req.params.user_id,
                watchlist_name: req.body.watchlist_name,
            },
        });
        if (findWatchList) return res.status(400).json({ message: 'WatchList already exists' });
        const watchList = await WatchList.create({
            user_id: req.params.user_id,
            watchlist_name: req.body.watchlist_name,
        });
        res.json(watchList);
    } catch (err) {
        res.status(400).json(err);
    }
}
);

router.delete('/:user_id', async (req, res) => {
    try {
        const watchList = await WatchList.destroy({
            where: {
                user_id: req.params.user_id,
                id: req.body.watchlist_id
            },
        });
        res.json(watchList);
    } catch (err) {
        res.status(400).json(err);
    }
}
);

router.post('/stock/:watchlist_id', async (req, res) => {
    try {
        const foundStock = await WatchListStock.findOne({
            where: {
                watchlist_id: req.params.watchlist_id,
                stock_symbol: req.body.stock_symbol,
            },
        });
        if (foundStock) return res.status(400).json({ message: 'Stock already in watchlist' });
        const watchListStock = await WatchListStock.create({
            watchlist_id: req.params.watchlist_id,
            stock_symbol: req.body.stock_symbol,
        });
        res.json(watchListStock);
    } catch (err) {
        res.status(400).json(err);
    }
}
);

router.delete('/stock/:watchlist_id', async (req, res) => {
    try {
        const watchList = await WatchListStock.destroy({
            where: {
                watchlist_id: req.params.watchlist_id,
                stock_symbol: req.body.stock_symbol
            },
        });
        res.json(watchList);
    } catch (err) {
        res.status(400).json(err);
    }
}
);



module.exports = router;


