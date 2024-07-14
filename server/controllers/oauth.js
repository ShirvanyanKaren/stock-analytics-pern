const { User, Portfolio, WatchList } = require('../models');
const router = require('express').Router();
const { OAuth2Client } = require('google-auth-library');
const authMiddleware = require('../utils/auth');
const { URLSearchParams } = require('url');
const axios = require('axios');
const { get } = require('http');

const createClient = () => new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.REDIRECT_URI);

const getUser = async (userData) => {
    let user;
    if (userData.email || userData.username)
        user = userData.email
            ? await User.findOne({ where: { email: userData.email } })
            : await User.findOne({ where: { username: userData.username } });
    if (!user) {
        user = await User.create({
            username: userData.name,
            email: userData.email || userData.username + '@twitter.com',
            password: Math.random().toString(36).substring(7),
            avatar: userData.picture || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
        });
        await Portfolio.create({
            user_id: user.id,
            portfolio_name: `${user.username}'s Portfolio`,
        });
        await WatchList.create({
            user_id: user.id,
            watchlist_name: `${user.username}'s Watchlist`,
        });
    }
    return user;
};

router.post('/google', async (req, res) => {
    try {
        const oAuth2Client = createClient();
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
            prompt: 'consent',
        });
        res.json({ url: authUrl });
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
});

router.get('/google-callback', async (req, res) => {
    const code = req.query.code;
    try {
        console.log(process.env.REDIRECT_URI);
        const oAuth2Client = createClient();
        const { tokens } = await oAuth2Client.getToken(code);
        await oAuth2Client.setCredentials(tokens);
        const { access_token: accessToken } = oAuth2Client.credentials;
        const { data: userData } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        let user;
        if (userData.email) user = await getUser(userData);
        else throw new Error('No email found in Google response');
        const token = authMiddleware.signToken(user);
        res.redirect(`${process.env.LOGIN_REDIRECT_URI}?token=${token}`);
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
});

router.post('/twitter', async (req, res) => {
    try {
        const authorizeUrl = 'https://twitter.com/i/oauth2/authorize';
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: process.env.TWITTER_CLIENT_ID,
            client_secret: process.env.TWITTER_CLIENT_SECRET,
            redirect_uri: process.env.TWITTER_REDIRECT_URI,
            scope: 'tweet.read users.read offline.access',
            state: 'random_string',
            code_challenge: 'challenge',
            code_challenge_method: 'plain',
        });
        const url = `${authorizeUrl}?${params.toString()}`;
        res.json({ url: url });
    } catch (err) {
        res.status(400).json(err);
    }
});

router.get('/twitter-callback', async (req, res) => {
    const code = req.query.code;
    try {
        const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.TWITTER_REDIRECT_URI,
            client_id: process.env.TWITTER_CLIENT_ID,
            client_secret: process.env.TWITTER_CLIENT_SECRET,
            code_verifier: 'challenge',
        });
        const response = await axios.post(tokenUrl, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(
                    `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`,
                ).toString('base64')}`,
            },
        });
        const accessToken = response.data.access_token;
        const {
            data: { data: userData },
        } = await axios.get('https://api.twitter.com/2/users/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        let user;
        if (userData.username) user = await getUser(userData);
        else throw new Error('No username found in Twitter response');
        const token = authMiddleware.signToken(user);
        res.redirect(`${process.env.LOGIN_REDIRECT_URI}?token=${token}`);
    } catch (err) {
        res.status(400).json(err);
    }
});

module.exports = router;
