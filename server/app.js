// require('dotenv').config();

const path = require('path');
const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
// const mongoose = require('mongoose');

/* const compression = require('compression');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser'); */
/* const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis'); */

// const router = require('./router.js');

// const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/Arena';

const addPlayer = (socket) => {

};

const addSpectator = (socket) => {

};

io.on('connection', (socket) => {
  const { type } = socket.handshake.query;
  console.log('User has connected: ', type);
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

// mongoose.connect(dbURI).catch((err) => {
/* if (err) {
    console.log('Could not connect to database');
    throw err;
  } */

// Everything under here should be deleted when redis is initialized
app.get('/', (req, res) => {
  res.sendFile(path.resolve('client/index.html'));
});

// });

/* const redisClient = redis.createClient({
  url: process.env.REDISCLOUD_URL,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err)); */

/* redisClient.connect().then(() => {
  const app = express();

  app.use(helmet());
  app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
  //app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
  //app.use(compression());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(session({
    key: 'sessionid',
    store: new RedisStore({
      client: redisClient,
    }),
    secret: 'Domo Arigato',
    resave: false,
    saveUninitialized: false,
  }));

  app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
  app.set('view engine', 'handlebars');
  app.set('views', `${__dirname}/../views`);

  router(app);

  app.listen(port, (err) => {
    if (err) { throw err; }
    console.log(`Listening on port ${port}`);
  });
}); */

const ipaddress = process.env.IP || process.env.NODE_IP || '0.0.0.0';
const serverport = process.env.PORT || process.env.NODE_PORT || 3000;
http.listen(serverport, ipaddress);
console.log(`Listening on ${ipaddress}:${serverport}`);
