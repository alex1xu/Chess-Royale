const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {});

const TICK_RATE = 20;

function tick() {
  for (const player of players) {
    const inputs = inputsMap[player.id];
    if (inputs) {
    }
  }
}

const inputsMap = {};
const players = [];

async function main() {
  io.on("connect", (socket) => {
    players.push({
      id: socket.id,
    });

    socket.on("inputs", (inputs) => {
      inputsMap[socket.id] = inputs;
    });
  });

  app.use(express.static("public"));

  httpServer.listen(5000);

  setInterval((tick) => {}, 1000 / TICK_RATE);
}

main();
