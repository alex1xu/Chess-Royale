const files = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default class Square {
  constructor({ isOdd, rank, file }) {
    this.rank = rank;
    this.file = file;

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
  }
  placePiece(piece) {
    this.element.appendChild(piece.element);
  }
  removePiece(piece) {
    this.element.removeChild(piece.element);
  }
  displayMove() {
    this.element.classList.add("display-move");
  }
  clearMove() {
    this.element.classList.remove("display-move");
  }
}
