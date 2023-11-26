// Use this when switching to webpack
/*var canvas = require('./canvas.js');
var ctx = canvas.ctx;
var io = require('socket.io-client');*/

import { ctx } from './canvas.js';
import {io} from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js';

var socket;

// TODO: Check if any of these actually stay after creating a player. Type might not even exist
var player = {
    x: 25,
    y: 40,
    width: 5,
    height: 5,
    type: null,
};

var otherPlayers = [];

const setupSocket = (socket) => {

    socket.on('welcome', (settings, worldSize) => {
        player = settings;
        player.name = "Lumen"; // test, this will be modifiable later
        player.screenWidth = ctx.canvas.width;
        player.screenHeight = ctx.canvas.height;

        // Let the server know that the client can hear it's responses
        // This will let the server know to put the player in the game world
        socket.emit('connected', player);
    });


    socket.on('movePlayer', (playerData, otherPlayerData) => {
        if (player.type === 'player') {
            player.x = playerData.x;
            player.y = playerData.y;
            player.hue = playerData.hue;
        }

        otherPlayers = otherPlayerData;
    });
}


const startGame = (type) => {
    player.type = type;

    if (!socket) {
        var socket = io({ query: "type=" + type });
        setupSocket(socket);
    }

    // If the server recieves this, then the connection is successful and the player can spawn
    // The response will be the welcome call at the top of setupSocket
    socket.emit('respawn');
}

// This will probably be attatched to a button instead of being run immediately in the code
startGame('player');

ctx.fillStyle = "blue";
ctx.fillRect(50, 40, 190, 40);

