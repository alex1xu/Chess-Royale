const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const Game = require("./game.js");
const User = require("./user.js");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {});

const TICK_RATE = 20;
const MAX_ELIXIR = 12;
const ELIXIR_RATE = 0.01;

let users = {};
let rooms = {};
let tickInterval = undefined;

function tick() {
  for (const [code, room] of Object.entries(rooms)) {
    if (!room.game) continue;
    room.game.elixirs[0] = Math.min(
      room.game.elixirs[0] + ELIXIR_RATE,
      MAX_ELIXIR
    );
    room.game.elixirs[1] = Math.min(
      room.game.elixirs[1] + ELIXIR_RATE,
      MAX_ELIXIR
    );
    io.in(code).emit("elixirs-state", room.game.elixirs);
  }
}

async function main() {
  io.on("connect", (socket) => {
    const user = new User({ id: socket.id });
    users[user.id] = user;
    socket.join(user.id);

    let roomNeeded = true;
    for (const [code, room] of Object.entries(rooms)) {
      if (room.users.length >= 2) continue;
      room.users.push(user);
      user.room = code;
      roomNeeded = false;

      const player1 = room.users[0],
        player2 = room.users[1];
      const game = new Game({
        id: room.code,
        player1: player1,
        player2: player2,
      });
      player1.game = game;
      player2.game = game;
      room.game = game;

      socket.join(code);
      io.in(code).emit("room-state", {
        msg: `${code}: Game connected`,
        data: {
          [player1.id]: {
            team: 0,
          },
          [player2.id]: {
            team: 1,
          },
        },
      });
      io.in(code).emit("pieces-state", game.pieces);
      tickInterval = setInterval(tick, 1000 / TICK_RATE);
      break;
    }

    if (roomNeeded) {
      const room = {
        users: [user],
        code: user.id,
      };
      rooms[user.id] = room;
      io.in(room.code).emit("room-state", {
        msg: `${room.code}: Waiting for opponent`,
      });
    }

    socket.on("move-piece", (input) => {
      const game = rooms[users[input.user].room].game;

      let elixir = game.elixirs[input.piece.team];
      const type = input.piece.type;
      const distance = Math.max(
        Math.abs(input.piece.rank - input.destinationRank),
        Math.abs(input.piece.file - input.destinationFile)
      );
      if (type == "pawn" && elixir >= 1) elixir -= 1;
      else if (type == "king" && elixir >= 2) elixir -= 2;
      else if (type == "knight" && elixir >= 2) elixir -= 2;
      else if ((type == "rook" || type == "bishop") && elixir >= distance)
        elixir -= distance;
      else if (type == "queen" && elixir >= distance) elixir -= distance;
      else return;
      game.elixirs[input.piece.team] = elixir;

      const currentKey = `${input.piece.rank}-${input.piece.file}`;
      const currentPiece = game.pieces[currentKey];
      if (!currentPiece) return;
      delete game.pieces[currentKey];

      const destinationKey = `${input.destinationRank}-${input.destinationFile}`;
      const destinationPiece = game.pieces[destinationKey];
      if (destinationPiece) {
        if (destinationPiece.team == currentPiece.team) return;
        else delete game.pieces[destinationKey];
      }
      game.pieces[destinationKey] = {
        rank: input.destinationRank,
        file: input.destinationFile,
        type: currentPiece.type,
        team: currentPiece.team,
      };

      io.in(rooms[users[input.user].room].code).emit(
        "pieces-state",
        game.pieces
      );
    });

    socket.on("disconnect", () => {
      delete users[socket.id];
      clearInterval(tickInterval);
    });
  });

  app.use(express.static("public"));

  httpServer.listen(5000);
}

main();
