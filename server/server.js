const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const path = require("path");
const { authMiddleware } = require("./utils/auth.js");
const { typeDefs, resolvers } = require("./schemas");
const cors = require("cors");
const sequelize = require("./config/connection");
const axios = require("axios");

const PORT = process.env.PORT || 5000;
const app = express();

const FINNHUB_API_KEY = 'cl1dmlhr01qkvip7mcn0cl1dmlhr01qkvip7mcng';

app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  try {
    const response = await axios.get(`https://finnhub.io/api/v1/search?q=${query}&token=${FINNHUB_API_KEY}`);
    const companies = response.data.result;
    res.json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


const server = new ApolloServer({
  typeDefs,
  resolvers,
});




const startApolloServer = async () => {
  await server.start();


  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.get

  app.use(
    "/graphql",
    cors(),
    expressMiddleware(server, {
      context: authMiddleware,
    })
  );

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });
  }

    await sequelize.sync({ force: false });
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on http://localhost:3000`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
    
};

startApolloServer();
