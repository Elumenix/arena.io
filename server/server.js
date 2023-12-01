// connections will set up the database connections for the server
const { init } = require('./connections');
const Player = require('./player');

// Connect to all the databases, then continue
init().then(({ createServer }) => {
  // The game servers get created
  const { server, io } = createServer();

  const sockets = {};
  const playerData = [];

  // Individual player functions are within this block
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
    // This isn't implemented yet
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
  server.listen(serverport, ipaddress);
  console.log(`Listening on ${ipaddress}:${serverport}`);
}).catch(console.error);
