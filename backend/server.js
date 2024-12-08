const { Server } = require("http");
const express = require("express");
const socketIO = require("socket.io");
const cors = require('cors');
const CORS_OPTIONS = require('./src/constants/cors');

const Game = require('./src/classes/Game.js');
const { PORT, NODE_ENV } = require('./src/constants/env');

const FRAME_TIME = Math.floor(1000 / 40);

const app = express();
const server = Server(app);
const io = socketIO(server, { cors: CORS_OPTIONS, pingInterval: 1000 });
const game = new Game(io, { maxConnections: 8 });

app.use(cors(CORS_OPTIONS));
app.use(express.static("public"));

let lastUpdateTime = performance.now();

function gameLoop() {
    const now = performance.now();
    const deltaTime = now - lastUpdateTime;

    if (game) {
        game.update(deltaTime);
        game.sendState();
    }

    lastUpdateTime = now;
    setTimeout(gameLoop, FRAME_TIME);
}

gameLoop();

server.listen(PORT, () => console.log(`Listening on port ${PORT} on ${NODE_ENV} environnement`));