const files = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default class Square {
  constructor({ isOdd, rank, file, clickSquare, elixir }) {
    this.rank = rank;
    this.file = file;
    this.occupied = false;
    this.movable = false;
    this.capturable = false;
    this.clickSquare = clickSquare;
    this.elixir = elixir;

    this.element = document.createElement(`div`);
    this.element.classList.add(`square`);
    if (isOdd) this.element.classList.add(`odd`);
    else this.element.classList.add(`even`);

    const label = document.createElement(`p`);
    label.textContent = `${files[file]}${rank}`;
    label.classList.add(`square-label`);
    this.element.appendChild(label);

    this.elixirCostDiv = document.createElement(`div`);
    this.elixirCostDiv.classList.add(`elixir-cost`);
    this.elixirCostDiv.style.display = "none";
    this.element.appendChild(this.elixirCostDiv);

    this.elixirCostDiv.appendChild(document.createElement(`p`));
    const elixirImage = document.createElement(`img`);
    elixirImage.setAttribute("src", "elixir-texture-small.png");
    elixirImage.setAttribute("alt", "elixir cost");
    elixirImage.style.width = "15px";
    elixirImage.style.height = "15px";
    this.elixirCostDiv.appendChild(elixirImage);

    this.element.setAttribute(`data-rank`, rank);
    this.element.setAttribute(`data-file`, file);

    this.element.addEventListener("click", () => {
      this.clickSquare(this);
    });
  }
  placePiece(piece) {
    this.element.appendChild(piece.element);
    this.occupied = true;
    this.piece = piece;
  }
  removePiece() {
    this.element.removeChild(this.element.lastChild);
    this.occupied = false;
    this.piece = undefined;
    this.movable = false;
    this.capturable = false;
    this.elixirCostDiv.style.display = "none";
  }
  displayMove(cost) {
    this.element.classList.add("display-move");
    this.movable = true;

    this.elixirCostDiv.style.display = "flex";
    this.elixirCostDiv.children[0].textContent = `x${cost} `;
    if (cost > this.elixir.elixir) this.elixirCostDiv.classList.add("error");
    else this.elixirCostDiv.classList.remove("error");
  }
  displayCapture(cost) {
    this.element.classList.add("display-capture");
    this.capturable = true;

    this.elixirCostDiv.style.display = "flex";
    this.elixirCostDiv.children[0].textContent = `x${cost} `;
    if (cost > this.elixir.elixir) this.elixirCostDiv.classList.add("error");
    else this.elixirCostDiv.classList.remove("error");
  }
  clearDisplay() {
    this.element.classList.remove("display-move");
    this.element.classList.remove("display-capture");
    this.movable = false;
    this.capturable = false;
    this.elixirCostDiv.style.display = "none";
  }
}
