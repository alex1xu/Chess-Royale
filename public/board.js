import Square from "./square.js";
import Piece from "./piece.js";
import Elixir from "./elixir.js";

let BOARD_SIZE = 8;
let CURRENT_PIECE = undefined;
let CURRENT_TEAM = 0

export default class Board {
  constructor({ selector, dimensions }) {
    this.dimensions = dimensions; 
    this.squares = [];
    this.pieces = {};
    this.element = document.querySelector(selector);
    this.element.classList.add(`board`);
    this.init();

    this.elixir = new Elixir({
      selector: "#elixir",
    });
  }

  init() {
    if (this.dimensions) {
      this.element.style.width = this.dimensions.width;
      this.element.style.height = this.dimensions.height;
    } else {
      this.element.style.width = `80vmin`;
      this.element.style.height = `80vmin`;
    }
    this.squares = Array.from({ length: 64 }, (_, index) => {
      const rank = BOARD_SIZE - Math.floor(index / BOARD_SIZE);
      const file = index % BOARD_SIZE;
      const isOdd = rank % 2 !== file % 2;
      const square = new Square({ isOdd, rank, file,
        clickSquare: this.clickSquare.bind(this),
      });
      this.element.appendChild(square.element);

      return square;
    });

    this.addPiece({
      rank: 8,
      file: 0,
      type: "pawn",
      team: 1,
    });
    this.addPiece({
      rank: 7,
      file: 1,
      type: "pawn",
      team: 0,
    });
    this.addPiece({
      rank: 6,
      file: 2,
      type: "bishop",
      team: 0,
    });
    this.addPiece({
      rank: 1,
      file: 0,
      type: "rook",
      team: 1,
    });
    this.addPiece({
      rank: 6,
      file: 6,
      type: "queen",
      team: 1,
    });
    this.addPiece({
      rank: 8,
      file: 7,
      type: "king",
      team: 0,
    });
    this.addPiece({
      rank: 5,
      file: 4,
      type: "knight",
      team: 1,
    });
  }
  addPiece({ rank, file, type, team }) {
    const piece = new Piece({
      rank: rank,
      file: file,
      type: type,
      team: team,
    });
    this.pieces[piece.id]=piece;
    this.gridToSquare(rank, file)?.placePiece(piece);
    return piece
  }
  removePiece(piece) {
    delete this.pieces[piece.id]
    this.gridToSquare(piece.rank, piece.file)?.removePiece();
  }
  clickSquare(clickedSquare) {
    if (clickedSquare.piece == CURRENT_PIECE) {
      CURRENT_PIECE = undefined;
      this.hideMoves()
    } else if (clickedSquare?.piece?.team==CURRENT_TEAM) {
        this.seeMoves(clickedSquare.piece)
        CURRENT_PIECE=clickedSquare.piece
    } else if (CURRENT_PIECE&&(clickedSquare.movable||clickedSquare.capturable)) {
      this.removePiece(CURRENT_PIECE)
      if(clickedSquare.capturable) this.removePiece(clickedSquare.piece)
      const piece=this.addPiece({rank:clickedSquare.rank,file:clickedSquare.file,type:CURRENT_PIECE.type,team:CURRENT_PIECE.team})
      this.elixir.changeElixir(-10)
      CURRENT_PIECE=piece
      this.seeMoves(piece)
    } else {
      CURRENT_PIECE=undefined
      this.hideMoves()
    }
  }
  hideMoves() {
    this.squares.map((square) => {
      square.clearDisplay();
    });
  }
  seeMoves(piece) {
    this.hideMoves()

    if (piece.type == "pawn") {
      this.checkDirection(piece,1,0,1)
    } else if (piece.type == "bishop") {
      this.checkDirection(piece,1,1)
      this.checkDirection(piece,1,-1)
      this.checkDirection(piece,-1,1)
      this.checkDirection(piece,-1,-1)
    } else if (piece.type == "knight") {
      this.checkDirection(piece,2,1,1)
      this.checkDirection(piece,2,-1,1)
      this.checkDirection(piece,1,2,1)
      this.checkDirection(piece,-1,-2,1)
      this.checkDirection(piece,-2,1,1)
      this.checkDirection(piece,-2,-1,1)
      this.checkDirection(piece,1,-2,1)
      this.checkDirection(piece,-1,-2,1)
    } else if (piece.type == "rook") {
      this.checkDirection(piece,1,0)
      this.checkDirection(piece,-1,0)
      this.checkDirection(piece,0,1)
      this.checkDirection(piece,0,-1)
    } else if (piece.type == "queen") {
      this.checkDirection(piece,1,1)
      this.checkDirection(piece,1,-1)
      this.checkDirection(piece,-1,1)
      this.checkDirection(piece,-1,-1)
      this.checkDirection(piece,1,0)
      this.checkDirection(piece,-1,0)
      this.checkDirection(piece,0,1)
      this.checkDirection(piece,0,-1)
    } else if (piece.type == "king") {
      this.checkDirection(piece,1,1,1)
      this.checkDirection(piece,1,-1,1)
      this.checkDirection(piece,-1,1,1)
      this.checkDirection(piece,-1,-1,1)
      this.checkDirection(piece,1,0,1)
      this.checkDirection(piece,-1,0,1)
      this.checkDirection(piece,0,1,1)
      this.checkDirection(piece,0,-1,1)
    }
  }
  checkDirection(piece,rankDelta,fileDelta,max=BOARD_SIZE) {
    const rank=piece.rank,file=piece.file,team=piece.team

    if (piece.type=="pawn") {
      const square=this.gridToSquare(rank+(team?-1:1), file)
      const squareLeft=this.gridToSquare(rank+(team?-1:1), file-1)
      const squareRight=this.gridToSquare(rank+(team?-1:1), file+1)
      if(squareLeft&&squareLeft.occupied&&squareLeft.piece.team!=team) squareLeft.displayCapture()
      if(squareRight&&squareRight.occupied&&squareRight.piece.team!=team) squareRight.displayCapture()
      if (square&&!square.occupied) square.displayMove();
      return;
    }

    for (let delta = 1; delta <= max; delta++) {
      const square=this.gridToSquare(rank+delta*rankDelta, file+delta*fileDelta)
      if (square&&square.occupied&&square.piece.team!=team) {
        square.displayCapture();
        return
      }
      else if(square&&!square.occupied) square.displayMove();
      else return;
    }
  }
  gridToSquare(rank, file) {
    if (rank < 1 || rank > BOARD_SIZE) return undefined;
    if (file < 0 || file >= BOARD_SIZE) return undefined;
    const index = (BOARD_SIZE - rank) * BOARD_SIZE + file
    if (index < 0 || index >= this.squares.length) return undefined;
    return this.squares[index]
  }
}
