import Board from "./board.js";

const socket = io(`ws://localhost:5000`);

socket.on("connect", () => {});

const board = new Board({
  selector: "#board",
  socket: socket,
});

socket.on("room-state", (state) => {
  document.querySelector(`#room-code`).textContent = `${state.msg}`;
  if (state.data) {
    const data = state.data[socket.id];
    board.CURRENT_TEAM = data.team;
    document.querySelector(`#room-code`).textContent = `${state.msg} - ${
      data.team == 1 ? "Black" : "White"
    }`;
    board.updateChessBoard();
  }
});

socket.on("pieces-state", (pieces) => {
  board.updatePiecesState(pieces);
});

export default socket;
