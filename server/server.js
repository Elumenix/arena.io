require('dotenv').config();

// Middleware
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');

// Express & File Redirects
const express = require('express');
const expressHandlebars = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const favicon = require('serve-favicon');

const app = express();

// Databases
const mongoose = require('mongoose');
const RedisStore = require('connect-redis').default;
const redis = require('redis');

// IO & various
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Player = require('./player');

const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/Arena';

mongoose.connect(dbURI).catch((err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

const redisClient = redis.createClient({
  url: process.env.REDISCLOUD_URL,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// All actual server setup is done after connection to the redis database
redisClient.connect().then(() => {
  app.use(helmet({ // The inner block can be deleted after webpack is implemented
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "https://cdn.socket.io"],
      },
    },
  }));
  app.use(express.static(path.resolve(`${__dirname}/../client`))); // Serve all client files
  app.use(favicon(path.resolve(`${__dirname}/../hosted/favicon.png`))); // Serve favicon correctly
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(session({
    key: 'sessionid',
    store: new RedisStore({
      client: redisClient,
    }),
    secret: process.env.Session_Secret,
    resave: false,
    saveUninitialized: false,
  }));

  app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
  app.set('view engine', 'handlebars');
  app.set('views', `${__dirname}/../views`);

  const sockets = {};
  const playerData = [];

  const addPlayer = (socket) => {
    const currentPlayer = new Player(socket.id);

    // This will actually run after respawn is called
    socket.on('connected', (playerInfo) => {
      console.log(`Player '${playerInfo.name}' has connected.`);

      // return Math.floor(Math.random() * (to - from)) + from;
      currentPlayer.init(
        Math.floor(Math.random() * 600) - 300,
        Math.floor(Math.random() * 600) - 300,
      );

      let len = playerData.length;

      // Don't let the same player connect to the server twice
      while (len--) {
        if (playerData[len].id === currentPlayer.id) {
          console.log('This player is already connected. Rejecting new connection.');
          socket.disconnect();
          return;
        }
      }

      // Player is allowed to join the game
      console.log(`'${playerInfo.name}' has joined the game!`);
      sockets[playerInfo.id] = socket;
      currentPlayer.clientData(playerInfo);
      playerData.push(currentPlayer);
    });

    socket.on('respawn', () => {
      let len = playerData.length;
      let existed = false;

      // If the player was already in the game, then remove them from the current players
      while (len--) {
        if (playerData[len].id === currentPlayer.id) {
          existed = playerData.splice(len, 1) != null;
          break;
        }
      }

      socket.emit('welcome', currentPlayer, {
        width: 5000,
        height: 5000,
      });

      if (existed) {
        console.log(`'${currentPlayer.name}' has respawned!`);
      }
    });

    // The server recieves the players current location from the client and updates it internally
    socket.on('recieveUpdate', (target) => {
      // This will be used to kick inactive sockets later
      currentPlayer.lastUpdate = new Date().getTime();

      // console.log(`Current: ${currentPlayer.x}, Target: ${target.x}`);
      // No need to force the server to update information if it isn't necessary
      if (target.x !== currentPlayer.x || target.y !== currentPlayer.y) {
        currentPlayer.target = target;
      }
    });

    socket.on('windowResized', (screenSize) => {
      currentPlayer.screenWidth = screenSize.screenWidth;
      currentPlayer.screenHeight = screenSize.screenHeight;
    });

    // More Player functions
  };

  const addSpectator = (socket) => {
    socket.emit('Error Aversion');
  };

  io.on('connection', (socket) => {
    const { type } = socket.handshake.query;
    // console.log('User has connected: ', type);
    switch (type) {
      case 'player':
        addPlayer(socket);
        break;
      case 'spectator':
        addSpectator(socket);
        break;
      default:
        console.log('Unknown user type, not doing anything.');
    }
  });

  // Sends the current known location of all players
  // and the game board to all currently connected clients
  const sendUpdates = () => {
    // Update spectators
    playerData.forEach((player) => {
      player.move();
      sockets[player.id].emit('movePlayer', playerData);
    });
  };

  setInterval(sendUpdates, 25);

  const ipaddress = process.env.IP || process.env.NODE_IP || '0.0.0.0';
  const serverport = process.env.PORT || process.env.NODE_PORT || 3000;
  http.listen(serverport, ipaddress);
  console.log(`Listening on ${ipaddress}:${serverport}`);
});
