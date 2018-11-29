const whiteBoardComponents = document.getElementById("white-board").components["drawable-canvas"];
const colorPickers = document.getElementById("pen-tools").getElementsByTagName("a-circle");

for (colorPicker of colorPickers) {
  const color = colorPicker.attributes.color.value
  colorPicker.object3D.addEventListener("cursordown", () => {
    whiteBoardComponents.penColor = color;
  });
}
