import Square from "./square.js";
import Piece from "./piece.js";

let BOARD_SIZE = 8;
let SHOW_MOVES = undefined;

export default class Board {
  constructor({ selector, dimensions }) {
    this.dimensions = dimensions;
    this.squares = [];
    this.pieces = [];
    this.element = document.querySelector(selector);
    this.element.classList.add(`board`);
    this.init();
  }

  init() {
    if (this.dimensions) {
      this.element.style.width = this.dimensions.width;
      this.element.style.height = this.dimensions.height;
    } else {
      this.element.style.width = `90vmin`;
      this.element.style.height = `90vmin`;
    }
    this.squares = Array.from({ length: 64 }, (_, index) => {
      const rank = BOARD_SIZE - Math.floor(index / BOARD_SIZE);
      const file = index % BOARD_SIZE;
      const isOdd = rank % 2 !== file % 2;
      const square = new Square({ isOdd, rank, file });
      this.element.appendChild(square.element);

      return square;
    });

    this.addPiece({
      rank: 7,
      file: 0,
      type: "pawn",
      team: 0,
    });
    this.addPiece({
      rank: 5,
      file: 2,
      type: "bishop",
      team: 0,
    });
    this.addPiece({
      rank: 0,
      file: 0,
      type: "rook",
      team: 1,
    });
    this.addPiece({
      rank: 5,
      file: 6,
      type: "queen",
      team: 1,
    });
    this.addPiece({
      rank: 7,
      file: 7,
      type: "king",
      team: 0,
    });
  }
  addPiece({ rank, file, type, team }) {
    const piece = new Piece({
      rank: rank,
      file: file,
      type: type,
      team: team,
      seeMoves: this.seeMoves.bind(this),
    });
    this.pieces.push(piece);
    this.gridToSquare(rank, file)?.placePiece(piece);
  }
  seeMoves(piece) {
    this.squares.map((square) => {
      square.clearMove();
    });
    if (piece == SHOW_MOVES) {
      SHOW_MOVES = undefined;
      return;
    }
    SHOW_MOVES = piece;

    if (piece.type == "pawn") {
      if (piece.team)
        this.gridToSquare(piece.rank + 1, piece.file)?.displayMove();
      else this.gridToSquare(piece.rank - 1, piece.file)?.displayMove();
    } else if (piece.type == "bishop") {
      for (let delta = 0; delta < BOARD_SIZE; delta++) {
        this.gridToSquare(
          piece.rank + delta,
          piece.file + delta
        )?.displayMove();
        this.gridToSquare(
          piece.rank + delta,
          piece.file - delta
        )?.displayMove();
        this.gridToSquare(
          piece.rank - delta,
          piece.file + delta
        )?.displayMove();
        this.gridToSquare(
          piece.rank - delta,
          piece.file - delta
        )?.displayMove();
      }
    } else if (piece.type == "knight") {
    } else if (piece.type == "rook") {
      for (let delta = 0; delta < BOARD_SIZE; delta++) {
        this.gridToSquare(piece.rank + delta, piece.file)?.displayMove();
        this.gridToSquare(piece.rank - delta, piece.file)?.displayMove();
        this.gridToSquare(piece.rank, piece.file + delta)?.displayMove();
        this.gridToSquare(piece.rank, piece.file - delta)?.displayMove();
      }
    } else if (piece.type == "queen") {
      for (let delta = 0; delta < BOARD_SIZE; delta++) {
        this.gridToSquare(
          piece.rank + delta,
          piece.file + delta
        )?.displayMove();
        this.gridToSquare(
          piece.rank + delta,
          piece.file - delta
        )?.displayMove();
        this.gridToSquare(
          piece.rank - delta,
          piece.file + delta
        )?.displayMove();
        this.gridToSquare(
          piece.rank - delta,
          piece.file - delta
        )?.displayMove();
        this.gridToSquare(piece.rank + delta, piece.file)?.displayMove();
        this.gridToSquare(piece.rank - delta, piece.file)?.displayMove();
        this.gridToSquare(piece.rank, piece.file + delta)?.displayMove();
        this.gridToSquare(piece.rank, piece.file - delta)?.displayMove();
      }
    } else if (piece.type == "king") {
      this.gridToSquare(piece.rank + 1, piece.file + 1)?.displayMove();
      this.gridToSquare(piece.rank + 1, piece.file - 1)?.displayMove();
      this.gridToSquare(piece.rank - 1, piece.file + 1)?.displayMove();
      this.gridToSquare(piece.rank - 1, piece.file - 1)?.displayMove();
      this.gridToSquare(piece.rank + 1, piece.file)?.displayMove();
      this.gridToSquare(piece.rank - 1, piece.file)?.displayMove();
      this.gridToSquare(piece.rank, piece.file + 1)?.displayMove();
      this.gridToSquare(piece.rank, piece.file - 1)?.displayMove();
    }
  }
  gridToSquare(rank, file) {
    if (rank < 0 || rank >= BOARD_SIZE) return undefined;
    if (file < 0 || file >= BOARD_SIZE) return undefined;
    const index = rank * 8 + file;
    if (index < 0 || index >= this.squares.length) return undefined;
    else return this.squares[index];
  }
}
