/* builds the layered 3D body for every .clayPhone: an extruded stack with rounded (bevelled) top and bottom edges,
   the face, and two knurled side buttons */
(function () {
  var N = 22;          // layers through the thickness
  var D = 0.08;        // thickness, in phone widths
  var E = 0.03;       // how far the bevel pulls in at the very top/bottom edge, in phone widths
  var B = 0.024;       // height of each bevel, in phone widths
  var R = 0.2;         // the body's corner radius
  function mix(a, b, t) { return Math.round(a + (b - a) * t); }
  function build(el) {
    var screen = el.innerHTML;
    var parts = '<i class="shadow"></i>';
    for (var i = 0; i < N; i++) {
      var z = (i / (N - 1)) * D, inset = 0, shade;
      if (z > D - B) { var t = (z - (D - B)) / B; inset = E * (1 - Math.sqrt(Math.max(0, 1 - t * t))); shade = 'top'; }
      else if (z < B) { var t2 = (B - z) / B; inset = E * (1 - Math.sqrt(Math.max(0, 1 - t2 * t2))); shade = 'bot'; }
      var c;
      if (shade === 'top') { var u = (z - (D - B)) / B; c = 'rgb(' + mix(86, 236, u) + ',' + mix(86, 234, u) + ',' + mix(90, 229, u) + ')'; }
      else if (shade === 'bot') c = 'rgb(70,70,74)';
      else c = (i % 2 ? '#4d4d51' : '#434346');
      parts += '<i class="slab" style="inset:calc(var(--cw) * ' + inset.toFixed(4) + ');border-radius:calc(var(--cw) * ' + Math.max(0.02, R - inset).toFixed(4) + ');background:' + c + ';transform:translateZ(calc(var(--cw) * ' + z.toFixed(4) + '))"></i>';
    }
    parts += '<div class="face"><i class="bezel"><i class="screen">' + screen + '</i><i class="notch"></i></i></div>';
    [0.27, 0.44].forEach(function (p) {
      var s = '', W = 0.04, steps = 7;
      for (var k = 0; k < steps; k++) {
        var x = 0.012 - k * 0.009, last = k === steps - 1;
        s += '<i class="' + (last ? 'top' : '') + '" style="transform:translate3d(calc(var(--cw) * ' + (x - 0.0).toFixed(4) + '),0,calc(var(--cw) * ' + (D / 2 + W / 2).toFixed(4) + ')) rotateY(90deg)"></i>';
      }
      parts += '<div class="cbtn" style="top:calc(var(--cw) * 2.08 * ' + p + ')">' + s + '</div>';
    });
    el.innerHTML = parts;
  }
  Array.prototype.forEach.call(document.querySelectorAll(".clayPhone"), build);
})();
