import { ctx } from './canvas.js';
var io = require('socekt.io-client');
var socket;

var player = {
    x: 25,
    y: 40,
    width: 5,
    height: 5,
    type: null,
};

startGame('player');


const startGame = (type) => {
    player.type = type;

    if (!socket) {
        var socket = io({ query: "type=" + type });
        setupSocket(socket);
    }
}


const setupSocket = (socket) => {
    socket.on('movePlayer', (playerPosition) => {

    });


}

ctx.fillStyle = "blue";
ctx.fillRect(50, 40, 190, 40);

