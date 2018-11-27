const socket = io();

const raycaster = new THREE.Raycaster();
const scene = document.querySelector("a-scene").object3D;

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const boardTexture = new THREE.CanvasTexture(canvas);
const board = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 4),
  new THREE.MeshBasicMaterial({ map: boardTexture, side: THREE.DoubleSide})
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
  canvas.width = 1024;
  canvas.height = 512;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  board.position.set(0, 0, 0);
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
