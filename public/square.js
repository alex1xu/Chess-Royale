const files = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default class Square {
  constructor({ isOdd, rank, file,clickSquare }) {
    this.rank = rank;
    this.file = file;
    this.occupied=false
    this.movable=false
    this.capturable=false
    this.clickSquare=clickSquare

    this.element = document.createElement(`div`);
    this.element.classList.add(`square`);
    if (isOdd) this.element.classList.add(`odd`);
    else this.element.classList.add(`even`);

    const label = document.createElement(`p`);
    label.textContent = `${files[file]}${rank}`;
    label.classList.add(`square-label`);
    this.element.appendChild(label);

    this.element.setAttribute(`data-rank`, rank);
    this.element.setAttribute(`data-file`, file);

    this.element.addEventListener("click", () => {
      this.clickSquare(this);
    });
  }
  placePiece(piece) {
    this.element.appendChild(piece.element);
    this.occupied=true
    this.piece=piece
  }
  removePiece() {
    this.element.removeChild(this.element.lastChild);
    this.occupied=false
    this.piece=undefined
    this.movable=false
    this.capturable=false
  }
  displayMove() {
    this.element.classList.add("display-move");
    this.movable=true
  }
  displayCapture() {
    this.element.classList.add("display-capture");
    this.capturable=true
  }
  clearDisplay() {
    this.element.classList.remove("display-move");
    this.element.classList.remove("display-capture");
    this.movable=false
    this.capturable=false
  }
}
