const socket = io();

AFRAME.registerComponent("drawable-canvas", {
  schema: { default: "" },

  init: function() {
    this.raycaster = new THREE.Raycaster();
    this.canvas = document.getElementById(this.data);
    this.ctx = this.canvas.getContext("2d");
    this.prevPoints = {};
    this.mouseDown = false;

    this.canvas.width = 1024;
    this.canvas.height = 512;
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.el.sceneEl.object3D.addEventListener("cursormove", event => {
      if (this.mouseDown) {
        const intersection = this.findCanvasIntersection(event);
        if (intersection) {
          const { x, y } = intersection;
          this.drawOnCanvas("self", "lineTo", x, y);
          socket.emit("draw", "lineTo", x, y);
        }
      }
    });

    this.el.object3D.addEventListener("cursordown", event => {
      const intersection = this.findCanvasIntersection(event);
      if (intersection) {
        const { x, y } = intersection;
        this.drawOnCanvas("self", "moveTo", x, y);
        socket.emit("draw", "moveTo", x, y);
      }
      this.mouseDown = true;
    });

    ["cursorup", "cursorleave"].forEach(eventType => {
      this.el.object3D.addEventListener(eventType, () => {
        this.mouseDown = false;
      });
    });

    socket.on("drawBroadcast", this.drawOnCanvas);
  },

  drawOnCanvas: function(user, type, x, y) {
    if (type === "lineTo") {
      this.ctx.lineCap = "round";
      this.ctx.lineWidth = 5;
      this.ctx.beginPath();
      this.ctx.moveTo(this.prevPoints[user].x, this.prevPoints[user].y);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    }
    this.prevPoints[user] = { x, y };
  },

  findCanvasIntersection: function(event) {
    this.raycaster.set(event.ray.origin, event.ray.direction);
    const intersection = this.raycaster.intersectObjects(
      this.el.sceneEl.object3D.children,
      true
    )[0];
    return intersection
      ? {
          x: this.canvas.width * intersection.uv.x,
          y: this.canvas.height - this.canvas.height * intersection.uv.y
        }
      : false;
  }
});
