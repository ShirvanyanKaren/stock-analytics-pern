const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const path = require("path");
const { authMiddleware } = require("./utils/auth.js");
const { typeDefs, resolvers } = require("./schemas");
const cors = require("cors");
const sequelize = require("./config/connection");
const { spawn } = require("child_process");


const PORT = process.env.PORT || 3001;
const app = express();


const server = new ApolloServer({
  typeDefs,
  resolvers,
});
console.log(process.env.DB_PW, process.env.DB_NAME, process.env.DB_USER, process.env.DATABASE_URL)

const startApolloServer = async () => {
  await server.start();


  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: authMiddleware,
    })
  );

  app.get('/port', (req, res) => {
    res.json({ port: port });
  });

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));
    console.log("Path is:", path.join(__dirname, "../client/dist/index.html"));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });
  } else {
    const childPython = spawn("uvicorn", ["main:app", "--reload"], {cwd: "../python"});
    childPython
    childPython.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    }
    );
    childPython.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    }
    );
  }
  //npx kill port 3000
  //


    await sequelize.sync({ force: false });
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on http://localhost:${PORT}`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
      console.log("Path is:", path.join(__dirname, "../client/dist/index.html"));
      console.log("environment is", process.env.NODE_ENV)
    });
    
};

startApolloServer();
