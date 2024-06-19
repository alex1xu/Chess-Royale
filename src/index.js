const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const Game = require("./game.js");
const User = require("./user.js");

const app = express();
// app.use(express.static("public"));
const httpServer = createServer(app);

const io = new Server(httpServer, {});

const TICK_RATE = 20;
const MAX_ELIXIR = 10;
const ELIXIR_RATE = 0.0125;

let users = {};
let rooms = {};

function clock() {
  for (const [code, room] of Object.entries(rooms)) {
    if (!room.game) continue;
    room.game.clock -= 1;
    io.in(code).emit("clock-state", room.game.clock);
    if (room.game.clock <= 0) endGame(room, { type: "draw" });
  }
}

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

function sendSystemMessage(message, code) {
  io.in(code).emit("receive-message", { message: message, team: -1 });
}

function startGame(room) {
  const code = room.code;
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

  io.in(code).emit("room-state", {
    msg: `${code}: Game started`,
    data: {
      [player1.id]: {
        team: 0,
      },
      [player2.id]: {
        team: 1,
      },
    },
    stage: "connect",
  });
  io.in(code).emit("pieces-state", game.pieces);
  sendSystemMessage("Game started", code);
}

function endGame(room, status) {
  const code = room.code;
  const player1 = room.users[0],
    player2 = room.users[1];
  if (player1) player1.game = undefined;
  if (player2) player2.game = undefined;
  room.game = undefined;

  if (status.type == "capture") {
    io.in(code).emit("room-state", {
      msg: `${code}: King captured - ${
        status.winner == 1 ? "Black" : "White"
      } wins!`,
      data: {
        winner: status.winner,
      },
      stage: "capture",
    });
  } else if (status.type == "draw") {
    io.in(code).emit("room-state", {
      msg: `${code}: Game over - Draw`,
      stage: "draw",
    });
  } else if (status.type == "quit") {
    io.in(code).emit("room-state", {
      msg: `${code}: Game over - Aborted`,
      stage: "draw",
    });
  }

  sendSystemMessage("Game ended", code);
}

async function main() {
  setInterval(tick, 1000 / TICK_RATE);
  setInterval(clock, 1000);
  // setInterval(() => {
  //   io.emit("rooms", rooms);
  // }, 5000);

  io.on("connect", (socket) => {
    io.emit("rooms", rooms);

    const user = new User({ id: socket.id });
    users[user.id] = user;
    socket.join(user.id);

    let roomNeeded = true;
    for (const [code, room] of Object.entries(rooms)) {
      if (room.users.length >= 2) continue;
      room.users.push(user);
      user.room = code;
      roomNeeded = false;
      socket.join(code);
      sendSystemMessage(`Player ${socket.id} joined the room`, room.code);
      io.in(room.code).emit("room-state", {
        msg: `${room.code}: Click ready`,
        stage: "queue",
      });
      break;
    }

    if (roomNeeded) {
      const room = {
        users: [user],
        code: user.id,
        ready: [],
      };
      rooms[user.id] = room;
      io.in(room.code).emit("room-state", {
        msg: `${room.code}: Waiting for an opponent`,
        stage: "queue",
      });
    }

    socket.on("move-piece", (input) => {
      const code = users[input.user].room;
      const game = rooms[code].game;

      //check for game instead of throwing errors

      const currentKey = `${input.piece.rank}-${input.piece.file}`;
      const currentPiece = game.pieces[currentKey];
      if (!currentPiece) return;
      const destinationKey = `${input.destinationRank}-${input.destinationFile}`;
      const destinationPiece = game.pieces[destinationKey];

      let elixir = game.elixirs[input.piece.team];
      const type = input.piece.type;
      const attackCost = destinationPiece ? 1 : 0;
      const distance = Math.max(
        Math.abs(input.piece.rank - input.destinationRank),
        Math.abs(input.piece.file - input.destinationFile)
      );
      if (type == "pawn" && elixir >= 1 + attackCost) elixir -= 1 + attackCost;
      else if (input.special == "castle" && elixir >= 4) elixir -= 4;
      else if (type == "king" && elixir >= 2 + attackCost)
        elixir -= 2 + attackCost;
      else if (type == "knight" && elixir >= 2 + attackCost)
        elixir -= 2 + attackCost;
      else if (
        (type == "rook" || type == "bishop") &&
        elixir >= distance + attackCost
      )
        elixir -= distance + attackCost;
      else if (type == "queen" && elixir >= distance + attackCost)
        elixir -= distance + attackCost;
      else return;

      game.elixirs[input.piece.team] = elixir;

      delete game.pieces[currentKey];

      if (destinationPiece) {
        if (destinationPiece.team == currentPiece.team) return;
        else {
          delete game.pieces[destinationKey];
          if (destinationPiece.type == "king")
            endGame(rooms[code], {
              type: "capture",
              winner: currentPiece.team,
            });
        }
      }

      if (
        currentPiece.type == "pawn" &&
        ((input.destinationRank == 1 && currentPiece.team == 1) ||
          (input.destinationRank == 8 && currentPiece.team == 0))
      ) {
        game.pieces[destinationKey] = {
          rank: input.destinationRank,
          file: input.destinationFile,
          type: "queen",
          team: currentPiece.team,
        };
      } else if (input.special == "castle") {
        if (input.side == "L") {
          delete game.pieces[`${currentPiece.rank}-${currentPiece.file - 4}`];
          game.pieces[`${currentPiece.rank}-${currentPiece.file - 2}`] = {
            rank: currentPiece.rank,
            file: currentPiece.file - 2,
            type: "rook",
            team: currentPiece.team,
          };
          game.pieces[`${currentPiece.rank}-${currentPiece.file - 3}`] = {
            rank: currentPiece.rank,
            file: currentPiece.file - 3,
            type: "king",
            team: currentPiece.team,
          };
        } else {
          delete game.pieces[`${currentPiece.rank}-${currentPiece.file + 3}`];
          game.pieces[`${currentPiece.rank}-${currentPiece.file + 1}`] = {
            rank: currentPiece.rank,
            file: currentPiece.file + 1,
            type: "rook",
            team: currentPiece.team,
          };
          game.pieces[`${currentPiece.rank}-${currentPiece.file + 2}`] = {
            rank: currentPiece.rank,
            file: currentPiece.file + 2,
            type: "king",
            team: currentPiece.team,
          };
        }
      } else {
        game.pieces[destinationKey] = {
          rank: input.destinationRank,
          file: input.destinationFile,
          type: currentPiece.type,
          team: currentPiece.team,
        };
      }

      io.in(code).emit("pieces-state", game.pieces);
    });

    socket.on("ready", () => {
      const room = rooms[users[socket.id].room];
      if (!room.ready.includes(socket.id)) room.ready.push(socket.id);
      sendSystemMessage(
        `Player ${socket.id} is ready (${room.ready.length}/2)`,
        room.code
      );
      if (room.ready.length >= 2 && !room.game) {
        startGame(room);
        room.ready = [];
      }
    });

    socket.on("send-message", (message) => {
      io.in(users[socket.id].room).emit("receive-message", message);
    });

    socket.on("disconnect", () => {
      endGame(rooms[users[socket.id].room], { type: "quit" });
      delete users[socket.id];
    });
  });

  app.use(express.static("public"));

  httpServer.listen(process.env.PORT || 5000);
}

main();
