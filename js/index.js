var XMLNS = "http://www.w3.org/2000/svg";
var canvas = new Canvas (document.getElementById("mainSVG"));

canvas.draw(canvas.load());

document.getElementById("save").addEventListener("click", function(e){
  canvas.save();
})