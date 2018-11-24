const socket = io();

const raycaster = new THREE.Raycaster();
const sim = new altspace.utilities.Simulation();
const scene = sim.scene;

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const boardTexture = new THREE.CanvasTexture(canvas);
const board = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshBasicMaterial({ map: boardTexture }));

let mouseDown = false;
let localPlots = [];
let foreignPlots = [];

function init() {
  canvas.width = canvas.height = 1024;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  board.position.set(10, 10, 10);
  scene.add(board);

  scene.addEventListener("cursormove", event => {
    raycaster.set(event.ray.origin, event.ray.direction);
  });

  board.addEventListener("cursordown", () => {
    mouseDown = true;
  });
  
  ["cursorup", "cursorleave"].forEach(eventType =>
    board.addEventListener(eventType, () => {
      mouseDown = false;
      localPlots.length != 0 && socket.emit("draw", localPlots);
      localPlots.length = 0;
    })
  );

  socket.on("drawBroadcast", plots => {
    foreignPlots.push(plots);
  });  
}

function drawOnCanvas(plots) {
  ctx.beginPath();
  ctx.moveTo(plots[0].x, plots[0].y);

  for (var i = 1; i < plots.length; i++) {
    ctx.lineTo(plots[i].x, plots[i].y);
  }
  ctx.stroke();
}

function render() {
  requestAnimationFrame(render);
  intersection = raycaster.intersectObjects(scene.children)[0] || null;
  if (mouseDown) {
    localPlots.push({
      x: canvas.width * intersection.uv.x,
      y: canvas.height - canvas.height * intersection.uv.y
    });
    drawOnCanvas(localPlots);
  }

  while (foreignPlots.length != 0) {
    drawOnCanvas(foreignPlots.pop());
  }

  boardTexture.needsUpdate = true;
}

init();
requestAnimationFrame(render);