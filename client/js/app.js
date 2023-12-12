import { ShowGameWindow } from '../menu.jsx';
import { ctx, mousePos } from './canvas.js';
var io = require('socket.io-client');


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
var explosions = [];
var score = 0;
var finalScore = 0;

const setupSocket = (socket) => {
    // saved so that the update method can work
    playerSocket = socket;

    function handleDisconnect() {
        console.log("You were disconnected from the server.");
        socket.close();

        document.querySelector('#content').hidden = false;
    }

    socket.on('connect_error', handleDisconnect);
    socket.on('disconnect', handleDisconnect);

    socket.on('welcome', (settings, worldSize) => {
        player = settings;

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

    window.onresize = () => {
        ctx.canvas.width = player.screenWidth = screenWidth = window.innerWidth;
        ctx.canvas.height = player.screenHeight = screenHeight = window.innerHeight;

        socket.emit('windowResized', { screenWidth: screenWidth, screenHeight: screenHeight });
    };


    socket.on('movePlayer', (playerData, booms) => {
        let index = playerData.findIndex((current) => current.id === player.id);

        if (index !== -1) {
            otherPlayers = playerData;
            playerData = otherPlayers.splice(index, 1);
        }

        player = playerData[0];
        score = Math.round((Date.now() - player.startTime) / 100);
        explosions = booms;
    });

    socket.on('kick', (reason) => {
        console.log(`You were kicked.\nReason: ${reason}`);
        socket.close();
    });

    socket.on('death', () => {
        setTimeout(() => {
            document.querySelector('#content').hidden = false;
            loopHandler = null;

            fetch('/updateHighScore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: player.name, score: score }),
            })
                .then((response) => response.json())
                .then((data) => {
                    finalScore = data.score;
                    ShowGameWindow();
                });


            document.querySelector('#scoreWindow').hidden = false;
            document.querySelector('#gameOver').hidden = false;
        });
    }, 1000);
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
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.globalAlpha = 0.15;
    ctx.beginPath();

    for (let x = -player.x; x < screen.width; x += screen.height / 15) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, screen.height);
    }

    for (let y = -player.y; y < screen.height; y += screen.height / 15) {
        ctx.moveTo(0, y);
        ctx.lineTo(screen.width, y);
    }

    ctx.stroke();
    ctx.globalAlpha = 1;



    // Draw other players
    // TODO: Create a draw method for circles

    if (otherPlayers) {
        otherPlayers.forEach((opponent) => {
            ctx.beginPath();
            ctx.arc(opponent.x - player.x + screenWidth / 2, opponent.y - player.y + screenHeight / 2, opponent.radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fillStyle = opponent.color;
            ctx.fill();
            ctx.stroke();
        });
    }


    // draw current player
    ctx.beginPath();
    ctx.arc(screenWidth / 2, screenHeight / 2, player.radius, 0, 2 * Math.PI);
    //console.log(`(${player.x}, ${player.y})`);
    ctx.closePath();
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.stroke();


    // draw explosions
    explosions.forEach((bomb) => {
        ctx.fillStyle = bomb.color;
        ctx.beginPath();
        ctx.arc(bomb.x - player.x + screenWidth / 2, bomb.y - player.y + screenHeight / 2,
            bomb.size, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = `${bomb.color}${bomb.opacity}`;
        ctx.fill();
    });


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


        // If the server recieves this, then the connection is successful and the player can spawn
        // The response will be the welcome call at the top of setupSocket
        socket.emit('respawn');

        // Start the animation loop
        gameLoop();
    }
    else {
        // Simply respawn the player
        socket.emit('respawn');
    }
}

const changeFinalScore = (newValue) => {
    finalScore = newValue;
}

export {
    startGame,
    changeFinalScore,
    playerSocket,
    score,
    finalScore,
    player,
}
