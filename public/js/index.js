const whiteBoardComponents = document.getElementById("white-board").components["drawable-canvas"];
const colorPickers = document.getElementById("pen-tools").getElementsByTagName("a-circle");
const tick = document.getElementById("tick");

for (colorPicker of colorPickers) {
  console.log(colorPicker.object3D.el.appendChild)
  colorPicker.object3D.addEventListener("cursordown", function(){
    whiteBoardComponents.penColor = this.el.attributes.color.value;
    this.el.appendChild(tick)
    tick.object3D.position.set(-0.05,-0.05,0.45)
  });
}
