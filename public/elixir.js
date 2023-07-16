export default class Elixir {
  constructor({ selector }) {
    this.element = document.querySelector(selector);
    this.element.classList.add(`elixir-bar`);
  }
  changeElixir(delta) {
    this.element.value+=delta;
  }
}

