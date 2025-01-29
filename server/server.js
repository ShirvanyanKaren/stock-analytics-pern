const express = require('express');
const path = require('path');
const cors = require('cors');
const sequelize = require('./config/connection');
const { authMiddleware } = require('./utils/auth');
const controllers = require('./controllers');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// cors middleware allow from https://2709-172-251-5-191.ngrok-free.app 
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "https://2709-172-251-5-191.ngrok-free.app");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

// app.use(authMiddleware);

app.use(controllers);

app.get('/port', (req, res) => {
  res.json({ port: PORT });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
} else {
  const childPython = spawn('uvicorn', ['main:app', '--reload'], { cwd: '../python' });

  childPython.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  childPython.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on http://localhost:${PORT}`);
    console.log("Path is:", path.join(__dirname, "../client/dist/index.html"));
    console.log("environment is", process.env.NODE_ENV)
    console.log(`Local time is ${new Date().toISOString()}`)
  });
});


