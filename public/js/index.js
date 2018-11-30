const whiteBoardComponents = document.getElementById("white-board").components["drawable-canvas"];
const penTools = document.getElementById("pen-tools");
const colorPickers = penTools.getElementsByClassName("color");
const eraserButton = penTools.querySelector(".eraser");
const penWidthIncreaseButton = penTools.querySelector(".increase-pen-width");
const penWidthDecreaseButton = penTools.querySelector(".decrease-pen-width");
const tick = penTools.querySelector(".tick");

for (colorPicker of colorPickers) {
  if (colorPicker.attributes.color.value === whiteBoardComponents.penColor) {
    const [x, y, z] = colorPicker.object3D.position.toArray();
    tick.object3D.position.set(x, y, z + 0.01);
  }
  colorPicker.object3D.addEventListener("cursordown", function() {
    whiteBoardComponents.penColor = this.el.attributes.color.value;
    const [x, y, z] = this.position.toArray();
    tick.object3D.position.set(x, y, z + 0.01);
  });
}

eraserButton.object3D.addEventListener("cursordown", function() {
  console.log("erase")
  whiteBoardComponents.penColor = "white";
});

penWidthIncreaseButton.object3D.addEventListener("cursordown", function() {
  console.log("+")
  if (whiteBoardComponents.penWidth < 30) whiteBoardComponents.penWidth += 1;
});

penWidthDecreaseButton.object3D.addEventListener("cursordown", function(){
  console.log("-")
  if (whiteBoardComponents.penWidth > 1) whiteBoardComponents.penWidth -= 1;
});
