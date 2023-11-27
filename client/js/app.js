// Use this when switching to webpack
/*var canvas = require('./canvas.js');
var ctx = canvas.ctx;
var io = require('socket.io-client');*/

import { ctx, mousePos } from './canvas.js';
import { io } from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js';

var loopHandler;
var playerSocket;
var socket

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
    // saved so that the update method can work
    playerSocket = socket;

    socket.on('welcome', (settings, worldSize) => {
        player = settings;
        player.name = "Lumen"; // test, this will be modifiable later
        player.screenWidth = ctx.canvas.width;
        player.screenHeight = ctx.canvas.height;

        // Let the server know that the client can hear it's responses
        // This will let the server know to put the player in the game world
        socket.emit('connected', player);
    });


    socket.on('movePlayer', (playerData) => {
        console.log(playerData);

        let index = playerData.findIndex((current) => current.id === playerData.id);

        if (index !== -1) {
            otherPlayers = playerData;
            playerData = otherPlayers.splice(index, 1);
        }

        if (player.type === 'player') {
            player.x = playerData.x;
            player.y = playerData.y;
            player.hue = playerData.hue;
        }

        console.log(otherPlayers);
    });
}


const gameLoop = () => {
    // request the next frame after this one finishes
    loopHandler = window.requestAnimationFrame(gameLoop);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#FF0000";

    // TODO: Create a draw method for circles

    if (otherPlayers) {
        otherPlayers.forEach((player) => {
            ctx.beginPath();
            ctx.arc(player.x, player.y, 5, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });
    }

    ctx.beginPath();
    ctx.arc(player.x, player.y, 25, 0, 2 * Math.PI);

    console.log(player);
    console.log(`(${player.x}, ${player.y})`);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();


    // The client should send it's current position back to the server. This only actually transmits movement input information
    socket.emit('recieveUpdate', mousePos);
}


const startGame = (type) => {
    player.type = type;

    if (!socket) {
        socket = io({ query: "type=" + type });
        setupSocket(socket);
    }

    // If the server recieves this, then the connection is successful and the player can spawn
    // The response will be the welcome call at the top of setupSocket
    socket.emit('respawn');

    // Start the animation loop
    gameLoop();
}

// This will probably be attatched to a button instead of being run immediately in the code
startGame('player');

/*ctx.fillStyle = "blue";
ctx.fillRect(50, 40, 190, 40);*/
