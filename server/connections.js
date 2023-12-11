// Hidden data
require('dotenv').config();

// Middleware
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');

// Express & Redirects
const express = require('express');
const session = require('express-session');
const expressHandlebars = require('express-handlebars');
const path = require('path');
const favicon = require('serve-favicon');

// Databases
const mongoose = require('mongoose');
const RedisStore = require('connect-redis').default;
const redis = require('redis');

// Servers
const http = require('http');
const SocketIO = require('socket.io');

const router = require('./router.js');

const app = express();
const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/Arena';

mongoose.connect(dbURI).catch((err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

// This will be run in server.js
// The reason for this is because redis needs to be connected before most of the codebase runs
module.exports.init = () => new Promise((resolve, reject) => {
  const redisClient = redis.createClient({
    url: process.env.REDISCLOUD_URL,
  });

  redisClient.on('error', (err) => console.log('Redis Client Error', err));

  redisClient.connect().then(() => {
    app.use(helmet({ // Delete this inner block once webpack is set up
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'script-src': ["'self'", 'https://cdn.socket.io'],
        },
      },
    }));

    app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted`)));
    app.use(favicon(path.resolve(`${__dirname}/../hosted/favicon.png`)));
    app.use(compression());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    const sessionMiddleware = session({
      key: 'sessionid',
      store: new RedisStore({
        client: redisClient,
      }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    });

    app.use(sessionMiddleware);

    app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
    app.set('view engine', 'handlebars');
    app.set('views', `${__dirname}/views`);

    router(app);

    // These will be used in server.js
    const createServer = () => {
      const server = http.Server(app);
      const io = SocketIO(server);
      io.engine.use(sessionMiddleware);

      return { server, io };
    };

    resolve({ createServer });
  }).catch(reject);
});

// module.exports = { app/* , redisClient */ };
