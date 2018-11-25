const socket = io();

const raycaster = new THREE.Raycaster();
const sim = new altspace.utilities.Simulation();
const scene = sim.scene;

const boardSize = { x: 1024, y: 512 };

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const boardTexture = new THREE.CanvasTexture(canvas);
const board = new THREE.Mesh(
  new THREE.PlaneGeometry(boardSize.x, boardSize.y),
  new THREE.MeshBasicMaterial({ map: boardTexture })
);

let mouseDown = false;
let prevPoint = {};

function drawOnCanvas(user, type, x, y) {
  if (type === "lineTo") {
    ctx.lineCap = "round";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(prevPoint[user].x, prevPoint[user].y);
    ctx.lineTo(x, y);
    ctx.stroke();
    boardTexture.needsUpdate = true;
  }
  prevPoint[user] = { x, y };
}

function findCanvasIntersection(event) {
  raycaster.set(event.ray.origin, event.ray.direction);
  const intersection = raycaster.intersectObjects(scene.children)[0];
  const x = canvas.width * intersection.uv.x;
  const y = canvas.height - canvas.height * intersection.uv.y;
  return { x, y };
}

function init() {
  canvas.width = boardSize.x;
  canvas.height = boardSize.y;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  scene.add(board);

  scene.addEventListener("cursormove", event => {
    if (mouseDown) {
      const { x, y } = findCanvasIntersection(event);
      drawOnCanvas("self", "lineTo", x, y);
      socket.emit("draw", "lineTo", x, y);
    }
  });

  board.addEventListener("cursordown", event => {
    const { x, y } = findCanvasIntersection(event);
    drawOnCanvas("self", "moveTo", x, y);
    socket.emit("draw", "moveTo", x, y);
    mouseDown = true;
  });

  ["cursorup", "cursorleave"].forEach(eventType =>
    board.addEventListener(eventType, () => {
      mouseDown = false;
    })
  );

  socket.on("drawBroadcast", drawOnCanvas);
}

init();
