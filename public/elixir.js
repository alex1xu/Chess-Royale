export default class Elixir {
  constructor({ selector, board }) {
    this.elixir = 2;
    this.maxElixir = 10;
    this.board = board;
    this.element = document.querySelector(selector);
    this.element.classList.add(`elixir-bar`);
    this.element.setAttribute("value", this.elixir);
    this.element.setAttribute("max", this.maxElixir);

    this.label = document.createElement(`p`);
    this.label.textContent = `2`;
    this.label.classList.add(`elixir-label`);
    this.element.parentElement.appendChild(this.label);

    for (let i = 1; i < this.maxElixir; i++) {
      const hr = document.createElement(`hr`);
      hr.classList.add(`elixir-hr`);
      hr.style.left = `${(100 / this.maxElixir) * i}%`;
      this.element.parentElement.appendChild(hr);
    }
  }
  updateElixir(elixir) {
    if (Math.abs(elixir - Math.floor(elixir)) <= 0.1) {
      this.label.classList.add("shake");
      if (this.board.CURRENT_PIECE)
        this.board.seeMoves(this.board.CURRENT_PIECE);
    } else this.label.classList.remove("shake");

    this.elixir = elixir;
    this.element.value = elixir;
    this.label.textContent = Math.floor(elixir);
  }
}
