const socket = io();

AFRAME.registerComponent("drawable-canvas", {
  schema: { default: "" },

  init: function() {
    // Try getting the current user from altspace
    if (altspace.inClient) {
      this.userPromise = altspace.getUser();
    } else {
      this.userPromise = Promise.resolve("not altspace user");
    }

    this.raycaster = new THREE.Raycaster();
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.prevPoints = {};
    this.penDown = false;
    this.el.object3D.children.find(o => o.type === "Mesh").material.map = this.texture;

    // Adjustable variables
    this.penColor = "#000000";
    this.penWidth = 5;

    // Initialize canvas
    this.canvas.width = 1024;
    this.canvas.height = 512;
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Event handlers
    this.penMoveHandler = event => {
      if (this.penDown) {
        const intersection = this.findPenPoint(event);
        if (intersection) this.drawAndBroadcast("lineTo", intersection.x, intersection.y);
      }
    };
    this.penDownHandler = event => {
      const intersection = this.findPenPoint(event);
      if (intersection) this.drawAndBroadcast("moveTo", intersection.x, intersection.y);
      this.penDown = true;
    };
    this.penOffHandler = () => {
      this.penDown = false;
    };

    // Wire up event handlers
    this.el.sceneEl.object3D.addEventListener("cursormove", this.penMoveHandler);
    this.el.object3D.addEventListener("cursordown", this.penDownHandler);
    ["cursorup", "cursorleave"].forEach(eventType =>
      this.el.object3D.addEventListener(eventType, this.penOffHandler)
    );

    // Listen for remote draw stream
    socket.on("drawBroadcast", this.draw.bind(this));
  },

  remove: function() {
    // Remove event listeners
    this.el.sceneEl.object3D.removeEventListener("cursormove", this.penMoveHandler);
    this.el.object3D.removeEventListener("cursordown", this.penDownHandler);
    ["cursorup", "cursorleave"].forEach(eventType =>
      this.el.object3D.removeEventListener(eventType, this.penOffHandler)
    );

    // Stop listening to remote draw stream
    socket.off("drawBroadcast");
  },

  draw: function(user, type, x, y, width, color) {
    if (type === "lineTo") {
      this.ctx.lineCap = "round";
      this.ctx.lineWidth = width;
      this.ctx.beginPath();
      this.ctx.moveTo(this.prevPoints[user].x, this.prevPoints[user].y);
      this.ctx.lineTo(x, y);
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }
    this.prevPoints[user] = { x, y };
    this.texture.needsUpdate = true;
  },

  drawAndBroadcast: function(type, x, y) {
    this.draw("self", type, x, y, this.penWidth, this.penColor);
    this.userPromise.then(user =>
      socket.emit("draw", user.userId, type, x, y, this.penWidth, this.penColor)
    );
  },

  findPenPoint: function(event) {
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
