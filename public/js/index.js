const socket = io();

const raycaster = new THREE.Raycaster();
const sim = new altspace.utilities.Simulation();
const camera = sim.camera;
const scene = sim.scene;
const renderer = sim.renderer;

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const geometry = new THREE.PlaneGeometry(1000, 1000);
const texture = new THREE.Texture(canvas);
const material = new THREE.MeshBasicMaterial({ map: texture });
const cube = new THREE.Mesh(geometry, material);

let mouseDown = false;
let localPlots = [];
let foreignPlots = [];

function init() {
  canvas.width = canvas.height = 1024;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  scene.add(cube);

  scene.addEventListener("cursormove", event => {
    raycaster.set(event.ray.origin, event.ray.direction);
  });

  cube.addEventListener("cursordown", () => {
    mouseDown = true;
  });
  ["cursorup", "cursorleave"].forEach(eventType =>
    cube.addEventListener(eventType, () => {
      mouseDown = false;
      localPlots.length != 0 && socket.emit("draw", localPlots);
      localPlots.length = 0;
    })
  );
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

  texture.needsUpdate = true;
  renderer.render(scene, camera);
}

init();
requestAnimationFrame(render);

socket.on("drawBroadcast", plots => {
  foreignPlots.push(plots);
});
