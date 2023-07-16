import socket from "./index.js";

export default class Piece {
  constructor({ rank, file, type, team, seeMoves }) {
    this.rank = rank;
    this.file = file;
    this.type = type;
    this.team = team;
    this.seeMoves = seeMoves;

    this.element = document.createElement(`img`);
    this.element.src = `/assets/${team === 0 ? "w" : "b"}${type}.png`;
    this.element.alt = `${team === 0 ? "w" : "b"}${type}`;
    this.element.classList.add(`piece`);
    this.element.classList.add(`grabbable`);
    if (team) this.element.classList.add(`player1`);
    else this.element.classList.add(`player0`);

    this.element.setAttribute(`data-type`, type);
    this.element.setAttribute(`data-team`, team);

    this.element.addEventListener("click", () => {
      this.seeMoves(this);
      // socket.emit("input", "nhere");
    });
  }
}
