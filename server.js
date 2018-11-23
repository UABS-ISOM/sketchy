const express = require("express");
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const app = express();

app.use(express.static("public"));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", function(req, res) {
  res.render("index");
});

io.on("connection", function(socket) {
  socket.on("draw", (x, y) => {
    io.emit("drawBroadcast", x, y);
  });
  // socket.on('soundUpdate', function (data) {
  //     let newData = {
  //         latitude: data.latitude,
  //         longitude: data.longitude,
  //         decibels: data.decibels
  //     }
  //     for (let [index, o] of heatmapData.entries()) {
  //         if (o.latitude == newData.latitude && o.longitude == newData.longitude) {
  //             heatmapData.splice(index);
  //         }
  //     }
  //     heatmapData.push(newData);
  //     io.emit('soundBroadcast', {
  //         max: 70,
  //         data: heatmapData
  //     });
  // });
});

const port = process.env.PORT || 3000;

http.listen(port);
