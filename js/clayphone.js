/* builds the layered 3D body for every .clayPhone: an extruded stack under the face, plus the side buttons */
(function () {
  var N = 26;
  function build(el) {
    var parts = '<i class="shadow"></i>';
    for (var i = 0; i < N; i++) parts += '<i class="slab" style="transform:translateZ(calc(var(--depth) * ' + (i / (N - 1)).toFixed(3) + '))"></i>';
    var screen = el.innerHTML; // whatever is inside becomes the screen content (an img, a video...)
    parts += '<div class="face"><i class="bezel"><i class="screen">' + screen + '</i><i class="notch"></i></i></div>';
    [[0.26], [0.42]].forEach(function (b) {
      var s = '';
      for (var k = 0; k < 6; k++) s += '<i style="transform:translateZ(calc(var(--cw) * ' + (-0.02 + k * 0.008).toFixed(3) + '))"></i>';
      s += '<i class="top" style="transform:translateZ(calc(var(--cw) * 0.034))"></i>';
      parts += '<div class="cbtn" style="top:calc(var(--cw) * 2.08 * ' + b[0] + ')">' + s + '</div>';
    });
    el.innerHTML = parts;
  }
  Array.prototype.forEach.call(document.querySelectorAll(".clayPhone"), build);
})();
