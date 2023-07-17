import Square from "./square.js";
import Piece from "./piece.js";
import Elixir from "./elixir.js";

let BOARD_SIZE = 8;

export default class Board {
  constructor({ selector, socket }) {
    this.squares = [];
    this.pieces = {};
    this.socket = socket;
    this.element = document.querySelector(selector);
    this.element.classList.add(`board`);
    this.CURRENT_PIECE = undefined;
    this.CURRENT_TEAM = 0;
    this.init();

    this.elixir = new Elixir({
      selector: "#elixir",
      board: this,
    });
    socket.on("elixirs-state", (elixirs) => {
      this.elixir.updateElixir(elixirs[this.CURRENT_TEAM]);
    });
  }

  init() {
    this.element.style.width = `80vmin`;
    this.element.style.height = `80vmin`;
    this.updateChessBoard(this.CURRENT_TEAM);
  }
  updateChessBoard() {
    this.element.innerHTML = "";
    if (this.CURRENT_TEAM == 1) {
      this.squares = Array.from({ length: 64 }, (_, index) => {
        const rank = Math.floor(index / BOARD_SIZE) + 1;
        const file = BOARD_SIZE - (index % BOARD_SIZE) - 1;
        const isOdd = rank % 2 !== file % 2;
        const square = new Square({
          isOdd,
          rank,
          file,
          clickSquare: this.clickSquare.bind(this),
          elixir: this.elixir,
        });
        this.element.appendChild(square.element);

        return square;
      });
    } else {
      this.squares = Array.from({ length: 64 }, (_, index) => {
        const rank = BOARD_SIZE - Math.floor(index / BOARD_SIZE);
        const file = index % BOARD_SIZE;
        const isOdd = rank % 2 !== file % 2;
        const square = new Square({
          isOdd,
          rank,
          file,
          clickSquare: this.clickSquare.bind(this),
          elixir: this.elixir,
        });
        this.element.appendChild(square.element);

        return square;
      });
    }
  }
  updatePiecesState(pieces) {
    this.clearBoard();
    for (const [id, piece] of Object.entries(pieces)) {
      this.addPiece({
        rank: piece.rank,
        file: piece.file,
        type: piece.type,
        team: piece.team,
      });
    }
  }
  addPiece({ rank, file, type, team }) {
    const piece = new Piece({
      rank: rank,
      file: file,
      type: type,
      team: team,
    });
    this.pieces[piece.id] = piece;
    this.gridToSquare(rank, file)?.placePiece(piece);
    return piece;
  }
  removePiece(piece) {
    delete this.pieces[piece.id];
    this.gridToSquare(piece.rank, piece.file)?.removePiece();
  }
  clickSquare(clickedSquare) {
    if (clickedSquare.piece == this.CURRENT_PIECE) {
      this.CURRENT_PIECE = undefined;
      this.hideMoves();
    } else if (clickedSquare?.piece?.team == this.CURRENT_TEAM) {
      this.seeMoves(clickedSquare.piece);
      this.CURRENT_PIECE = clickedSquare.piece;
    } else if (
      this.CURRENT_PIECE &&
      (clickedSquare.movable || clickedSquare.capturable)
    ) {
      this.socket.emit("move-piece", {
        user: this.socket.id,
        piece: this.CURRENT_PIECE,
        destinationRank: clickedSquare.rank,
        destinationFile: clickedSquare.file,
      });
      this.CURRENT_PIECE = undefined;
    } else {
      this.CURRENT_PIECE = undefined;
      this.hideMoves();
    }
  }
  hideMoves() {
    this.squares.map((square) => {
      square.clearDisplay();
    });
  }
  clearBoard() {
    this.squares.map((square) => {
      square.clearDisplay();
      if (square.occupied) square.removePiece(square);
    });
  }
  seeMoves(piece) {
    this.hideMoves();

    if (piece.type == "pawn") {
      this.checkDirection(piece, 1, 0, 1);
    } else if (piece.type == "bishop") {
      this.checkDirection(piece, 1, 1);
      this.checkDirection(piece, 1, -1);
      this.checkDirection(piece, -1, 1);
      this.checkDirection(piece, -1, -1);
    } else if (piece.type == "knight") {
      this.checkDirection(piece, 2, 1, 1);
      this.checkDirection(piece, 2, -1, 1);
      this.checkDirection(piece, 1, 2, 1);
      this.checkDirection(piece, -1, 2, 1);
      this.checkDirection(piece, -2, 1, 1);
      this.checkDirection(piece, -2, -1, 1);
      this.checkDirection(piece, 1, -2, 1);
      this.checkDirection(piece, -1, -2, 1);
    } else if (piece.type == "rook") {
      this.checkDirection(piece, 1, 0);
      this.checkDirection(piece, -1, 0);
      this.checkDirection(piece, 0, 1);
      this.checkDirection(piece, 0, -1);
    } else if (piece.type == "queen") {
      this.checkDirection(piece, 1, 1);
      this.checkDirection(piece, 1, -1);
      this.checkDirection(piece, -1, 1);
      this.checkDirection(piece, -1, -1);
      this.checkDirection(piece, 1, 0);
      this.checkDirection(piece, -1, 0);
      this.checkDirection(piece, 0, 1);
      this.checkDirection(piece, 0, -1);
    } else if (piece.type == "king") {
      this.checkDirection(piece, 1, 1, 1);
      this.checkDirection(piece, 1, -1, 1);
      this.checkDirection(piece, -1, 1, 1);
      this.checkDirection(piece, -1, -1, 1);
      this.checkDirection(piece, 1, 0, 1);
      this.checkDirection(piece, -1, 0, 1);
      this.checkDirection(piece, 0, 1, 1);
      this.checkDirection(piece, 0, -1, 1);
    }
  }
  checkDirection(piece, rankDelta, fileDelta, max = BOARD_SIZE) {
    const rank = piece.rank,
      file = piece.file,
      team = piece.team;

    if (piece.type == "pawn") {
      const square = this.gridToSquare(rank + (team ? -1 : 1), file);
      const squareLeft = this.gridToSquare(rank + (team ? -1 : 1), file - 1);
      const squareRight = this.gridToSquare(rank + (team ? -1 : 1), file + 1);
      const squareForward = this.gridToSquare(rank + (team ? -2 : 2), file);
      if (squareLeft && squareLeft.occupied && squareLeft.piece.team != team)
        squareLeft.displayCapture(1);
      if (squareRight && squareRight.occupied && squareRight.piece.team != team)
        squareRight.displayCapture(1);
      if (square && !square.occupied) square.displayMove(1);
      if (
        ((rank == 2 && team == 0) || (rank == 7 && team == 1)) &&
        squareForward &&
        !squareForward.occupied
      )
        squareForward.displayMove(1);
      return;
    }

    for (let delta = 1; delta <= max; delta++) {
      const square = this.gridToSquare(
        rank + delta * rankDelta,
        file + delta * fileDelta
      );
      let cost = delta;
      if (piece.type == "king") cost = 2;
      else if (piece.type == "knight") cost = 2;
      if (square && square.occupied && square.piece.team != team) {
        square.displayCapture(cost);
        return;
      } else if (square && !square.occupied) square.displayMove(cost);
      else return;
    }
  }
  gridToSquare(rank, file) {
    if (rank < 1 || rank > BOARD_SIZE) return undefined;
    if (file < 0 || file >= BOARD_SIZE) return undefined;

    let index = (BOARD_SIZE - rank) * BOARD_SIZE + file;
    if (this.CURRENT_TEAM === 1)
      index = (rank - 1) * BOARD_SIZE + (BOARD_SIZE - file) - 1;
    if (index < 0 || index >= this.squares.length) return undefined;

    return this.squares[index];
  }
}
