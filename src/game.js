class Game {
  constructor({ id, player1, player2 }) {
    this.id = id;

    player1.team = 0;
    player2.team = 1;

    this.players = [player1, player2];
    this.elixirs = [2, 2];
    this.pieces = [];

    this.clock = 300;

    this.initGamePieces();
  }
  initGamePieces() {
    this.pieces = {
      "8-0": {
        rank: 8,
        file: 0,
        type: "rook",
        team: 1,
      },
      "8-1": {
        rank: 8,
        file: 1,
        type: "knight",
        team: 1,
      },
      "8-2": {
        rank: 8,
        file: 2,
        type: "bishop",
        team: 1,
      },
      "8-3": {
        rank: 8,
        file: 3,
        type: "queen",
        team: 1,
      },
      "8-4": {
        rank: 8,
        file: 4,
        type: "king",
        team: 1,
      },
      "8-5": {
        rank: 8,
        file: 5,
        type: "bishop",
        team: 1,
      },
      "8-6": {
        rank: 8,
        file: 6,
        type: "knight",
        team: 1,
      },
      "8-7": {
        rank: 8,
        file: 7,
        type: "rook",
        team: 1,
      },
      "7-0": {
        rank: 7,
        file: 0,
        type: "pawn",
        team: 1,
      },
      "7-1": {
        rank: 7,
        file: 1,
        type: "pawn",
        team: 1,
      },
      "7-2": {
        rank: 7,
        file: 2,
        type: "pawn",
        team: 1,
      },
      "7-3": {
        rank: 7,
        file: 3,
        type: "pawn",
        team: 1,
      },
      "7-4": {
        rank: 7,
        file: 4,
        type: "pawn",
        team: 1,
      },
      "7-5": {
        rank: 7,
        file: 5,
        type: "pawn",
        team: 1,
      },
      "7-6": {
        rank: 7,
        file: 6,
        type: "pawn",
        team: 1,
      },
      "7-7": {
        rank: 7,
        file: 7,
        type: "pawn",
        team: 1,
      },
      "1-0": {
        rank: 1,
        file: 0,
        type: "rook",
        team: 0,
      },
      "1-1": {
        rank: 1,
        file: 1,
        type: "knight",
        team: 0,
      },
      "1-2": {
        rank: 1,
        file: 2,
        type: "bishop",
        team: 0,
      },
      "1-3": {
        rank: 1,
        file: 3,
        type: "queen",
        team: 0,
      },
      "1-4": {
        rank: 1,
        file: 4,
        type: "king",
        team: 0,
      },
      "1-5": {
        rank: 1,
        file: 5,
        type: "bishop",
        team: 0,
      },
      "1-6": {
        rank: 1,
        file: 6,
        type: "knight",
        team: 0,
      },
      "1-7": {
        rank: 1,
        file: 7,
        type: "rook",
        team: 0,
      },
      "2-0": {
        rank: 2,
        file: 0,
        type: "pawn",
        team: 0,
      },
      "2-1": {
        rank: 2,
        file: 1,
        type: "pawn",
        team: 0,
      },
      "2-2": {
        rank: 2,
        file: 2,
        type: "pawn",
        team: 0,
      },
      "2-3": {
        rank: 2,
        file: 3,
        type: "pawn",
        team: 0,
      },
      "2-4": {
        rank: 2,
        file: 4,
        type: "pawn",
        team: 0,
      },
      "2-5": {
        rank: 2,
        file: 5,
        type: "pawn",
        team: 0,
      },
      "2-6": {
        rank: 2,
        file: 6,
        type: "pawn",
        team: 0,
      },
      "2-7": {
        rank: 2,
        file: 7,
        type: "pawn",
        team: 0,
      },
    };
  }
}

module.exports = Game;
