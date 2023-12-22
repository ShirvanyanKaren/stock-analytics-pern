const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const path = require("path");
const { authMiddleware } = require("./utils/auth.js");
const { typeDefs, resolvers } = require("./schemas");
const cors = require("cors");
const sequelize = require("./config/connection");
const { spawn } = require("child_process");


const PORT = process.env.PORT || 5000;
const app = express();


const childPython = spawn("python", ["../main.py"]);

childPython.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
}

);

childPython.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
}
);

childPython.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
}
);

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
