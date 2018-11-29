const whiteBoardComponents = document.getElementById("white-board").components["drawable-canvas"];
const colorPickers = document.getElementById("pen-tools").getElementsByClassName("color")
const tick = document.getElementById("tick");

for (colorPicker of colorPickers) {
  if (colorPicker.attributes.color.value === whiteBoardComponents.penColor) {
    const [x, y, z] = colorPicker.object3D.position.toArray()
    tick.object3D.position.set(x,y,z+0.1)
  }
  colorPicker.object3D.addEventListener("cursordown", function(){
    whiteBoardComponents.penColor = this.el.attributes.color.value;
    tick.object3D.position.set(-0.05,-0.05,0.45)
  });
}
