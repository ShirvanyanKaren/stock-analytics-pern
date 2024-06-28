const { User, Portfolio, WatchList } = require('../../models');
const router = require('express').Router();
const authMiddleware = require('../../utils/auth');

router.post('/login', async (req, res) => {
    try {
        // find user by email or username depending on what was entered
        const user = req.body.email.length ? await User.findOne({ where: { email: req.body.email } }) : await User.findOne({ where: { username: req.body.username } });
        const validPassword =  user?.checkPassword(req.body.password); 
        if (!user && !validPassword) {
        res.status(400).json({ message: 'Incorrect email or password, please try again' });
        return;
        }
    
        const token = authMiddleware.signToken(user);
        res.json({ token, user });
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
    }
);

router.post('/signup', async (req, res) => {
    try {
        // check if user already exists
        const emailExists = await User.findOne({ where: { email: req.body.email } });
        const userExists = await User.findOne({ where: { username: req.body.username } });

        if (userExists || emailExists) {
        res.status(400).json({ message: userExists ? 'Username already exists' : 'Email already exists' });
        return;
        }
        const user = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        });

        const portfolio = await Portfolio.create({
        user_id: user.id,
        portfolio_name: `${user.username}'s Portfolio`,
        });
        
        const watchList = await WatchList.create({
        user_id: user.id,
        watchlist_name: `${user.username}'s Watchlist`,
        });

        await User.update({ portfolio_id: portfolio.id,}, {
        where: {
            id: user.id,
        },
        });
    
        const token = authMiddleware.signToken(user);
        res.json({ token, user });
    } catch (err) {

        res.status(400).json(err);
    }
    }
);


router.post('/logout', (req, res) => {
    if (req.session.loggedIn) {
        req.session.destroy(() => {
        res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
    }
);

router.get('/profile', authMiddleware.authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
        });
        res.json(user);
    } catch (err) {
        res.status(400).json(err);
    }
    }
);

router.get('/', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(400).json(err);
    }
    }
);

module.exports = router;
