const express = require("express");
const app = require("express")();
const path = require("path");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const cookieParser = require("cookie-parser");
const logger = require("morgan");

app.use(express.static("public"));
app.use("/scripts", [
  express.static(path.join(__dirname, "/node_modules/three/build")),
  express.static(path.join(__dirname, "/node_modules/aframe/build")),
  express.static(path.join(__dirname, "/node_modules/altspace/dist/"))
]);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", function(req, res) {
  res.render("index");
});

io.on("connection", function(socket) {
  socket.on("draw", (user, type, x, y, width, pen) => {
    console.log(user, type, x, y, width, pen);
    socket.broadcast.emit("drawBroadcast", socket.id, type, x, y, width, pen);
  });
});

const port = process.env.PORT || 3000;

http.listen(port);
