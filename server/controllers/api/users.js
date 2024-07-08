const { User, Portfolio, WatchList } = require('../../models');
const router = require('express').Router();
const { GoogleAuth } = require('google-auth-library');
const authMiddleware = require('../../utils/auth');
const axios = require('axios');

router.post('/login', async (req, res) => {
    try {
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

router.get('/google-auth', async (req, res) => {
    console.log(process.env.GOOGLE_CLIENT_ID);
   const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&response_type=code&scope=openid%20email%20profile&redirect_uri=${process.env.REDIRECT_URI}`;
   res.redirect(url);
}
);

router.get('/google-auth/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const { data } = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code',
        });
       const { access_token, id_token } = data;

       const { data: userData } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
        });
        console.log(userData);
        let user;
        if (userData.email) {
            user = await User.findOne({ where: { email: userData.email } });
            if (user?.avatar !== userData.picture) {
            user = await User.update({ avatar: userData.picture }, { where: { email: userData.email } });
            }
        } else {
            throw new Error('No email found in Google response');
        }
        if (!user) {
            user = await User.create({
            username: userData.name,
            email: userData.email,
            password: Math.random().toString(36).substring(7),
            avatar: userData.picture,
            });
            const portfolio = await Portfolio.create({
            user_id: user.id,
            portfolio_name: `${user.username}'s Portfolio`,
            });
            const watchList = await WatchList.create({
            user_id: user.id,
            watchlist_name: `${user.username}'s Watchlist`,
            });
        }
        const token = authMiddleware.signToken(user);
        console.log(token);
        res.redirect(`${process.env.LOGIN_REDIRECT_URI}?token=${token}`);
    }
    catch (err) {
        res.status(400).json(err);
    }
    }
);


router.post('/signup', async (req, res) => {
    try {
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

router.put('/:id', authMiddleware.authMiddleware, async (req, res) => {
    try {
        const user = await User.update(req.body, {
        individualHooks: true,
        where: {
            id: req.params.id,
        },
        });
        if (!user[0]) {
        res.status(404).json({ message: 'No user found with this id' });
        return;
        }
        res.json(user);
    } catch (err) {
        res.status(400).json(err);
    }
    }
);

module.exports = router;
