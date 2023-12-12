// connections will set up the database connections for the server
const { init } = require('./connections');
const Player = require('./player');
const Explosion = require('./explosion');

// Credit for the basic setup of a socket server can be found here: https://github.com/owenashurst/agar.io-clone/blob/master/

// Connect to all the databases, then continue
init().then(({ createServer }) => {
  // The game servers get created
  const { server, io } = createServer();

  const sockets = {};
  const playerData = [];
  const explosions = [];
  let lastUpdate = new Date().getTime();

  // Individual player functions are within this block
  const addPlayer = (socket) => {
    const currentPlayer = new Player(socket.request.session.account._id);

    // This will actually run after respawn is called
    socket.on('connected', (playerInfo) => {
      console.log(`Player '${socket.request.session.account.username}' has connected.`);

      // return Math.floor(Math.random() * (to - from)) + from;
      currentPlayer.init(
        Math.floor(Math.random() * 5000),
        Math.floor(Math.random() * 5000),
      );

      let len = playerData.length;

      // Don't let the same player connect to the server twice
      while (len--) {
        if (playerData[len].name === socket.request.session.account.username) {
          console.log('This player is already connected. Rejecting new connection.');
          socket.disconnect();
          return;
        }
      }

      // Player is allowed to join the game
      console.log(`'${socket.request.session.account.username}' has joined the game!`);
      sockets[playerInfo.id] = socket;
      currentPlayer.clientData(playerInfo);
      currentPlayer.name = socket.request.session.account.username;
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
    playerData.forEach((player) => {
      sockets[player.id].emit('movePlayer', playerData, explosions);
    });
  };

  const tickPlayer = (currentPlayer) => {
    // Time limit for player sending updates
    // Disconnect them from the game if they stop responding
    if (currentPlayer.lastUpdate < new Date().getTime() - 5000) {
      const index = playerData.indexOf(currentPlayer);
      if (index !== -1) {
        playerData.splice(index, 1);
      }

      sockets[currentPlayer.id].emit('kick', 'Last heartbeat received over 5 seconds ago.');
      console.log(`Player '${currentPlayer.name}' has disconnected.`);
      sockets[currentPlayer.id].disconnect();
    } else {
      currentPlayer.move();

      const playerRadiusSq = currentPlayer.radius * currentPlayer.radius;

      explosions.forEach((bomb) => {
        if (bomb.size <= 20 || bomb.opacity <= 0.5) {
          return;
        }

        const dx = bomb.x - currentPlayer.x;
        const dy = bomb.y - currentPlayer.y;
        const distSq = dx * dx + dy * dy;
        const bombSizeSq = bomb.size * bomb.size;

        // confirmed collision
        if (distSq < playerRadiusSq + bombSizeSq) {
          sockets[currentPlayer.id].emit('death');
          console.log(`${currentPlayer.name} has perished.`);

          // Remove player from game world
          const index = playerData.indexOf(currentPlayer);
          if (index !== -1) {
            playerData.splice(index, 1);
          }
        }
      });
    }
  };

  const tickGame = () => {
    const deltaTime = (new Date().getTime() - lastUpdate) / 1000;

    explosions.forEach((currentExplosion) => {
      // if explosion has finished, remove from list
      if (currentExplosion.update(deltaTime)) {
        const index = explosions.indexOf(currentExplosion);
        if (index !== -1) {
          explosions.splice(index, 1);
        }
      }
    });

    // Only spawn new explosions if players are in the game, don't wear down server
    if (playerData.length > 0) {
      if (Math.random() * 100 > 0.66) { // ~ 20 spawn per second {
        explosions.push(new Explosion());
      }
    }

    playerData.forEach((player) => {
      tickPlayer(player);
    });

    lastUpdate = new Date().getTime();
  };

  setInterval(sendUpdates, 25);
  setInterval(tickGame, 1000 / 60);

  const ipaddress = process.env.IP || process.env.NODE_IP || '0.0.0.0';
  const serverport = process.env.PORT || process.env.NODE_PORT || 3000;
  server.listen(serverport, ipaddress);
  console.log(`Listening on ${ipaddress}:${serverport}`);
}).catch(console.error);
