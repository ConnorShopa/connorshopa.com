/* Overhand: "Trade anything for anything" as two round piles of bubbles.
   Each pile has the same eight words around a fixed "anything"; "for" sits fixed between the piles and is a wall.
   Every bubble is pulled toward a slot in its pile (rows that make a circle), can't overlap its neighbours,
   and the mouse pushes bubbles away a little before they settle back. */
(function () {
  var ALL = ["renders", "business plans", "subscriptions", "ux flows", "product", "money", "mentorship", "ideas"];
  var STYLES = [
    ["#FDE9A8", "#0B1620"], ["#E4F9DC", "#0B1620"], ["#F5C97F", "#0B1620"], ["#FFDC5A", "#0B1620"],
    ["#9BE8E8", "#0B1620"], ["#E1E5E9", "#0B1620"], ["#9B96F6", "#0B1620"], ["#F07B7B", "#fff"],
  ];
  var ROWS = [1, 2, 3, 2, 1]; // items per row, top to bottom; the middle row's centre is "anything" (so 2 bubbles + the word)
  var GAP = 10, REACH = 120, PUSH = 2.6, FS = 22;
  var pit = null, bubs = [], anchors = [], mouse = { x: -9999, y: -9999 }, raf = 0, ready = false, visible = false, forEl = null;

  function mk(text, cls, bg, fg) {
    var el = document.createElement("span");
    el.className = cls; el.textContent = text;
    if (bg) { el.style.background = bg; el.style.color = fg; el.style.fontSize = FS + "px"; el.style.padding = Math.round(FS * 0.62) + "px " + Math.round(FS * 2) + "px"; }
    pit.appendChild(el);
    return el;
  }

  function build() {
    pit = document.querySelector(".ohPit");
    if (!pit) return;
    [-1, 1].forEach(function (side) {
      ALL.forEach(function (w, i) {
        var k = side < 0 ? i : (i + 4) % 8, s = STYLES[k];
        bubs.push({ el: mk(w, "ohBub", s[0], s[1]), side: side, x: 0, y: 0, vx: 0, vy: 0, sx: 0, sy: 0 });
      });
      anchors.push({ el: mk("anything", "ohBub ohFor ohAny"), side: side });
    });
    forEl = mk("for", "ohBub ohFor");
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }, { threshold: 0 }).observe(pit);
    } else { visible = true; start(); }
    document.addEventListener("pointermove", function (e) {
      var r = pit.getBoundingClientRect();
      mouse.x = e.clientX - r.left - r.width / 2; mouse.y = e.clientY - r.top - r.height / 2;
    }, { passive: true });
    document.addEventListener("pointerleave", function () { mouse.x = mouse.y = -9999; });
    window.addEventListener("resize", function () { ready = false; });
  }

  function armX() { return Math.min(pit.offsetWidth * 0.3, 330); }

  // work out each bubble's slot: rows of a circle, the widest words in the middle rows
  function layout() {
    var ax = armX();
    bubs.forEach(function (b) { b.w = b.el.offsetWidth; b.h = b.el.offsetHeight; b.r = b.h / 2; b.hw = Math.max(0, b.w / 2 - b.r); });
    anchors.forEach(function (a) { a.w = a.el.offsetWidth; a.h = a.el.offsetHeight; });
    forEl.w = forEl.offsetWidth; forEl.h = forEl.offsetHeight;
    var pitch = 0; bubs.forEach(function (b) { pitch = Math.max(pitch, b.h); }); pitch += GAP;
    [-1, 1].forEach(function (side) {
      var mine = bubs.filter(function (b) { return b.side === side; }).sort(function (a, b) { return b.w - a.w; });
      var anyW = anchors.filter(function (a) { return a.side === side; })[0].w;
      // order of filling: middle row (2), the rows either side of it (2 + 2), the top and bottom (1 + 1), widest first
      var order = [[2, 0], [1, 0], [1, 1], [3, 0], [3, 1], [0, 0], [4, 0]]; // row, index
      var rows = [[], [], [], [], []], i = 0;
      rows[2] = [mine[0], mine[1]]; rows[1] = [mine[2], mine[3]]; rows[3] = [mine[4], mine[5]]; rows[0] = [mine[6]]; rows[4] = [mine[7]];
      rows.forEach(function (row, ri) {
        var items = ri === 2 ? [row[0], { w: anyW, any: true }, row[1]] : row;
        var total = items.reduce(function (s, it) { return s + it.w; }, 0) + GAP * (items.length - 1), x = -total / 2;
        items.forEach(function (it) {
          it.cx = x + it.w / 2; x += it.w + GAP;
          if (!it.any) { it.sx = side * ax + it.cx; it.sy = (ri - 2) * pitch; if (!ready) { it.x = it.sx + (Math.random() - .5) * 200; it.y = it.sy + (Math.random() - .5) * 200; it.vx = it.vy = 0; } }
          else it.ax = side * ax + it.cx;
        });
        if (ri === 2) anchors.filter(function (a) { return a.side === side; })[0].x = items[1].ax;
      });
    });
    ready = true;
  }

  // capsules are horizontal segments [x-hw, x+hw] at y with radius r: push two apart when they overlap
  function collide(a, b) {
    var a0 = a.x - a.hw, a1 = a.x + a.hw, b0 = b.x - b.hw, b1 = b.x + b.hw, pa, pb;
    var lo = Math.max(a0, b0), hi = Math.min(a1, b1);
    if (lo <= hi) { pa = pb = (lo + hi) / 2; }
    else if (a1 < b0) { pa = a1; pb = b0; } else { pa = a0; pb = b1; }
    var dx = pa - pb, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy), min = a.r + b.r + GAP * 0.4, nx, ny;
    if (d >= min) return;
    if (d < 0.001) { nx = 0; ny = 1; d = 0; } else { nx = dx / d; ny = dy / d; }
    var push = (min - d) / 2;
    a.x += nx * push; a.y += ny * push; b.x -= nx * push; b.y -= ny * push;
  }

  function step() {
    var n = bubs.length, i, j, k, b, W = pit.offsetWidth / 2, H = pit.offsetHeight / 2;
    for (i = 0; i < n; i++) {
      b = bubs[i];
      b.vx += (b.sx - b.x) * 0.02; b.vy += (b.sy - b.y) * 0.02; // pulled to its slot in the pile
      var dx = b.x - mouse.x, dy = b.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < REACH && d > 0.5) { var f = (1 - d / REACH) * PUSH; b.vx += dx / d * f; b.vy += dy / d * f; }
      b.vx *= 0.82; b.vy *= 0.82; b.x += b.vx; b.y += b.vy;
    }
    var wall = forEl.w / 2 + 28;
    for (k = 0; k < 3; k++) for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) collide(bubs[i], bubs[j]);
    for (i = 0; i < n; i++) {
      b = bubs[i];
      var m = wall + b.hw + b.r; // "for" is a wall: neither pile crosses the middle
      if (b.side < 0 && b.x > -m) b.x = -m; if (b.side > 0 && b.x < m) b.x = m;
      b.el.style.transform = "translate(" + (W + b.x - b.w / 2).toFixed(1) + "px," + (H + b.y - b.h / 2).toFixed(1) + "px)";
    }
    anchors.forEach(function (a) { a.el.style.transform = "translate(" + (W + a.x - a.w / 2).toFixed(1) + "px," + (H - a.h / 2).toFixed(1) + "px)"; });
    forEl.style.transform = "translate(" + (W - forEl.w / 2).toFixed(1) + "px," + (H - forEl.h / 2).toFixed(1) + "px)";
  }

  function loop() {
    raf = 0;
    if (!visible) return;
    if (!ready) { if (!pit.offsetWidth) { raf = requestAnimationFrame(loop); return; } layout(); }
    step();
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!raf) raf = requestAnimationFrame(loop); }

  function init() { build(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ready = false; }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
