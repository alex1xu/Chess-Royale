import Board from "./board.js";

const socket = io();

socket.on("connect", () => {});

const board = new Board({
  selector: "#board",
  socket: socket,
});

const gifs = [
  "angry",
  "bored",
  "celebrate",
  "confused",
  "happy",
  "heheheha",
  "sad",
  "yawn",
  "cr",
  "excited",
  "frustrated",
  "hog",
  "kiss",
  "nope",
  "party",
  "queen",
  "scared",
  "sigh",
  "slurp",
  "sob",
  "blunder",
  "blunder2",
  "unbelievable",
];

socket.on("room-state", (state) => {
  document.querySelector(`#room-code`).textContent = `${state.msg}`;

  if (state.stage == "connect") {
    const data = state.data[socket.id];
    alert("info", "Opponent connected");
    board.CURRENT_TEAM = data.team;
    document.querySelector(`#room-code`).textContent = `${state.msg} - ${
      data.team == 1 ? "Black" : "White"
    }`;
    board.updateChessBoard();
  } else if (state.stage == "disconnect") {
    alert("error", "Opponent disconnected");
    ready.style.display = "flex";
  } else if (state.stage == "queue") alert("info", "You are #1 in queue");
  else if (state.stage == "capture") {
    if (state.data.winner == board.CURRENT_TEAM)
      alert("success", "King captured - Victory!");
    else alert("error", "King captured - Defeat!");
    ready.style.display = "flex";
  } else if (state.stage == "draw") {
    alert("info", "Game over - Draw!");
    ready.style.display = "flex";
  }
});

socket.on("pieces-state", (pieces) => {
  board.updatePiecesState(pieces);
});

export function alert(type, msg) {
  let alert = undefined;
  if (type == "error") alert = document.querySelector("#error");
  else if (type == "info") alert = document.querySelector("#info");
  else alert = document.querySelector("#success");
  alert.textContent = msg;
  alert.style.display = "flex";
  setTimeout(function () {
    alert.style.display = "none";
  }, 3000);
}

// const roomList = document.querySelector("#roomlist");
// socket.on("rooms", (rooms) => {
//   roomList.innerHTML = "";
//   const header = document.createElement(`h3`);
//   header.textContent = "Rooms: ";
//   roomList.appendChild(header);
//   for (const [code, room] of Object.entries(rooms)) {
//     const link = document.createElement(`a`);
//     link.textContent = code;
//     link.classList.add(`room-link`);
//     roomList.appendChild(link);
//   }
// });

const form = document.querySelector("#controls");
const messageInput = document.querySelector("#chat-input");
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const message = messageInput.value;
  messageInput.value = "";
  if (message === "") return;
  socket.emit("send-message", { message: message, team: board.CURRENT_TEAM });
});

socket.on("receive-message", (data) => {
  displayMessage(data.message, data.team);
});

const ready = document.querySelector("#ready");
ready.addEventListener("click", (e) => {
  e.preventDefault();

  ready.style.display = "none";
  ready.textContent = "Rematch";

  socket.emit("ready", "");
});

function displayMessage(message, team) {
  const div = document.createElement("div");

  let hasGif = undefined;
  for (const gif of gifs) {
    if (message.includes(`!${gif}`)) {
      hasGif = gif;
      break;
    }
  }

  if (hasGif) {
    const gif = document.createElement("img");
    gif.src = `assets/${hasGif}.gif`;
    gif.alt = `${hasGif} gif`;
    div.appendChild(gif);
  } else div.textContent = message;

  div.classList.add(`chat${team}`);
  document
    .getElementById("chatlog")
    .insertBefore(div, document.getElementById("chatlog").firstChild);
}

export default socket;
