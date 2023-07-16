import Board from "./board.js";

const socket = io(`ws://localhost:5000`);

socket.on("connect", () => {
  console.log("connected");
});

const board = new Board({
  selector: "#board",
});

export default socket;
