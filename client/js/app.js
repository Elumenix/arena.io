// Use this when switching to webpack
/*var canvas = require('./canvas.js');
var ctx = canvas.ctx;
var io = require('socket.io-client');*/

import { ctx, mousePos } from './canvas.js';
import { io } from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js';

var loopHandler;
var playerSocket;
var socket;
var screenWidth;
var screenHeight;

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

        // Have the player be initialized by the screensize rather than world size
        player.screenWidth = screenWidth;
        player.screenHeight = screenHeight;


        // TODO: Have this be sent by the server
        //screenWidth = 5000;
        //screenHeight = 5000;

        // Let the server know that the client can hear it's responses
        // This will let the server know to put the player in the game world
        socket.emit('connected', player);
    });


    socket.on('movePlayer', (playerData) => {
        //console.log(player.id)
        //console.log(playerData);

        let index = playerData.findIndex((current) => current.id === player.id);

        if (index !== -1) {
            otherPlayers = playerData;
            playerData = otherPlayers.splice(index, 1);
        }

        player = playerData[0];
        //console.log(player);

        /*if (player.type === 'player') {
            player.x = playerData.x;
            player.y = playerData.y;
            player.hue = playerData.hue;
        }*/

        //console.log(otherPlayers);
    });
}


const gameLoop = () => {
    // request the next frame after this one finishes
    loopHandler = window.requestAnimationFrame(gameLoop);

    // establish borders
    let borders = { // Position of the borders on the screen
        left: screenWidth / 2 - player.x,
        right: screenWidth / 2 + 5000 - player.x,
        top: screenHeight / 2 - player.y,
        bottom: screenHeight / 2 + 5000 - player.y
    }


    // Draw Background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, screenWidth, screenHeight);


    // draw borders
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000'
    ctx.beginPath()
    ctx.moveTo(borders.left, borders.top);
    ctx.lineTo(borders.right, borders.top);
    ctx.lineTo(borders.right, borders.bottom);
    ctx.lineTo(borders.left, borders.bottom);
    ctx.closePath()
    ctx.stroke();

    // Draw grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";
    ctx.globalAlpha = 0.15;
    ctx.beginPath();

    for (let x = -player.x; x < screen.width; x += screen.height / 18) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, screen.height);
    }

    for (let y = -player.y; y < screen.height; y += screen.height / 18) {
        ctx.moveTo(0, y);
        ctx.lineTo(screen.width, y);
    }

    ctx.stroke();
    ctx.globalAlpha = 1;



    // Draw other players
    ctx.fillStyle = "#FF0000";
    // TODO: Create a draw method for circles

    if (otherPlayers) {
        otherPlayers.forEach((opponent) => {
            ctx.beginPath();
            ctx.arc(opponent.x - player.x + screenWidth / 2, opponent.y - player.y + screenHeight / 2, 5, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });
    }


    // draw current player
    ctx.beginPath();
    ctx.arc(screenWidth / 2, screenHeight / 2, 5, 0, 2 * Math.PI);
    //console.log(`(${player.x}, ${player.y})`);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();


    // The client should send it's current position back to the server. This only actually transmits movement input information
    socket.emit('recieveUpdate', mousePos);
}


const startGame = (type) => {
    player.type = type;
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;

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
