/* Overhand: "Trade anything for anything" as two circles of bubbles, a Venn diagram like the logo.
   Each circle is packed with as many different words as fit, around a fixed "anything"; "for" sits fixed in the
   overlap. Bubbles are pulled to their slot, can't overlap, and the mouse pushes them away a little. */
(function () {
  var WORDS = ["renders", "business plans", "subscriptions", "ux flows", "product", "money", "mentorship", "ideas", "logos", "code", "feedback", "photos", "time", "skills", "advice", "equity",
    "illustrations", "websites", "apps", "prototypes", "copywriting", "branding", "strategy", "research", "podcasts", "music", "videos", "animations", "tutoring", "lessons",
    "coaching", "contacts", "intros", "tools", "templates", "fonts", "icons", "mockups", "reviews", "audits", "pitch decks", "data", "hosting", "favors", "recipes", "art", "books", "tickets"];
  var STYLES = [
    ["#FDE9A8", "#0B1620"], ["#E4F9DC", "#0B1620"], ["#F5C97F", "#0B1620"], ["#FFDC5A", "#0B1620"],
    ["#9BE8E8", "#0B1620"], ["#E1E5E9", "#0B1620"], ["#9B96F6", "#0B1620"], ["#F07B7B", "#fff"],
  ];
  var GAP = 8, REACH = 120, PUSH = 2.6;
  var pit = null, bubs = [], anchors = [], circles = [], active = [], mouse = { x: -9999, y: -9999 }, raf = 0, ready = false, visible = false, forEl = null, R = 0, wallX = 0;

  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function mk(text, cls, bg, fg) {
    var el = document.createElement("span");
    el.className = cls; el.textContent = text;
    if (bg) { el.style.background = bg; el.style.color = fg; }
    pit.appendChild(el);
    return el;
  }

  function build() {
    pit = document.querySelector(".ohPit");
    if (!pit) return;
    ["ohCircle ohL", "ohCircle ohR", "ohCircle ohLens"].forEach(function (c) { var d = document.createElement("div"); d.className = c; pit.appendChild(d); circles.push(d); });
    // colours: spread evenly over the group in a random order; a word is never the same colour in both groups
    var left = shuffle(WORDS.map(function (_, i) { return i % STYLES.length; })), colours = { "-1": left, "1": left.map(function (c) { return (c + 1 + Math.floor(Math.random() * (STYLES.length - 1))) % STYLES.length; }) };
    [-1, 1].forEach(function (side) {
      shuffle(WORDS.map(function (_, i) { return i; })).forEach(function (i, order) {
        var s = STYLES[colours[side][i]];
        var b = { el: mk(WORDS[i], "ohBub", s[0], s[1]), side: side, order: order, x: 0, y: 0, vx: 0, vy: 0, sx: 0, sy: 0, off: false };
        b.scale = [0.85, 0.95, 1, 1, 1.1, 1.2][Math.floor(Math.random() * 6)]; // some bubbles larger, some smaller
        bubs.push(b);
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

  function measureAll() {
    bubs.forEach(function (b) { b.el.style.display = ""; b.w = b.el.offsetWidth; b.h = b.el.offsetHeight; b.r = b.h / 2; b.hw = Math.max(0, b.w / 2 - b.r); });
    anchors.forEach(function (a) { a.w = a.el.offsetWidth; a.h = a.el.offsetHeight; });
    forEl.w = forEl.offsetWidth; forEl.h = forEl.offsetHeight;
  }
  function setSize(fs, big) {
    bubs.forEach(function (b) { var f = fs * b.scale; b.el.style.fontSize = f.toFixed(1) + "px"; b.el.style.padding = Math.round(f * 0.55) + "px " + Math.round(f * 1.5) + "px"; });
    anchors.forEach(function (a) { a.el.style.fontSize = Math.round(big * 0.2) + "px"; });
    forEl.style.fontSize = Math.round(big * 0.14) + "px";
  }

  // pack each circle with rows of words (as many as fit), "anything" in the middle of the middle row
  function layout() {
    var W = pit.offsetWidth / 2, H = pit.offsetHeight / 2, r0 = Math.min(H - 6, W * 0.62);
    setSize(Math.max(9, r0 / 21), r0); measureAll();
    var lens = forEl.w + 36;
    R = Math.min(r0, (W + lens / 2) / 2 - 2);
    var fs = Math.max(9, R / 21), ax = R - lens / 2;
    setSize(fs, R); measureAll();
    lens = forEl.w + 36; ax = R - lens / 2; wallX = forEl.w / 2 + 12;
    var maxH = 0; bubs.forEach(function (b) { maxH = Math.max(maxH, b.h); });
    var pitch = maxH + GAP * 0.8, half = Math.floor((R - maxH / 2) / pitch);
    active = [];
    [-1, 1].forEach(function (side) {
      var queue = bubs.filter(function (b) { return b.side === side; }).sort(function (a, b) { return a.order - b.order; }), any = anchors.filter(function (a) { return a.side === side; })[0];
      function fill(lo, hi, y) { // greedily take words that fit [lo, hi], centre them
        var got = [], used = 0, room = hi - lo, i = 0;
        if (room <= 40) return;
        while (i < queue.length && i < 12) {
          var b = queue[i], need = b.w + (got.length ? GAP : 0);
          if (used + need <= room) { got.push(b); used += need; queue.splice(i, 1); i = 0; } else i++;
        }
        var x = (lo + hi) / 2 - used / 2;
        got.forEach(function (b) { b.sx = side * ax + x + b.w / 2; b.sy = y; x += b.w + GAP; active.push(b); });
      }
      for (var k = -half; k <= half; k++) {
        var y = k * pitch, d = R - 4, c = Math.sqrt(Math.max(0, d * d - Math.pow(Math.abs(y) + maxH / 2, 2)));
        var lo = -c, hi = c, inner = ax - wallX - 4; // "for" and the overlap are kept clear
        if (side < 0) hi = Math.min(hi, inner); else lo = Math.max(lo, -inner);
        if (k === 0) { var aw = any.w + 2 * GAP; fill(lo, -aw / 2, y); fill(aw / 2, hi, y); } else fill(lo, hi, y);
      }
      any.x = side * ax; any.y = 0;
    });
    bubs.forEach(function (b) { b.off = active.indexOf(b) < 0; b.el.style.display = b.off ? "none" : ""; });
    active.forEach(function (b) { if (!ready || b.sx === undefined) return; });
    if (!ready) active.forEach(function (b) { b.x = b.sx + (Math.random() - .5) * 160; b.y = b.sy + (Math.random() - .5) * 160; b.vx = b.vy = 0; });
    forEl.x = 0; forEl.y = 0;
    // the Venn circles, like the logo: indigo, red, and pink where they overlap
    var L = circles[0], Rt = circles[1], Ln = circles[2], d2 = R * 2;
    [L, Rt, Ln].forEach(function (c) { c.style.width = c.style.height = d2 + "px"; c.style.top = (H - R) + "px"; });
    L.style.left = (W - ax - R) + "px"; Rt.style.left = (W + ax - R) + "px"; Ln.style.left = (W + ax - R) + "px";
    Ln.style.clipPath = "circle(" + R + "px at " + (R - 2 * ax) + "px " + R + "px)";
    ready = true;
  }

  // capsules are horizontal segments [x-hw, x+hw] at y with radius r
  function gap(a, b, pad) {
    var a0 = a.x - a.hw, a1 = a.x + a.hw, b0 = b.x - b.hw, b1 = b.x + b.hw, pa, pb;
    var lo = Math.max(a0, b0), hi = Math.min(a1, b1);
    if (lo <= hi) { pa = pb = (lo + hi) / 2; } else if (a1 < b0) { pa = a1; pb = b0; } else { pa = a0; pb = b1; }
    var dx = pa - pb, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy), min = a.r + b.r + pad;
    return { dx: dx, dy: dy, d: d, min: min };
  }
  function collide(a, b) {
    var g = gap(a, b, GAP * 0.35);
    if (g.d >= g.min) return;
    var nx = g.d < 0.001 ? 0 : g.dx / g.d, ny = g.d < 0.001 ? 1 : g.dy / g.d, push = (g.min - g.d) / 2;
    a.x += nx * push; a.y += ny * push; b.x -= nx * push; b.y -= ny * push;
  }

  function step() {
    var n = active.length, i, j, k, b, W = pit.offsetWidth / 2, H = pit.offsetHeight / 2;
    for (i = 0; i < n; i++) {
      b = active[i];
      b.vx += (b.sx - b.x) * 0.02; b.vy += (b.sy - b.y) * 0.02; // pulled to its slot
      var dx = b.x - mouse.x, dy = b.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < REACH && d > 0.5) { var f = (1 - d / REACH) * PUSH; b.vx += dx / d * f; b.vy += dy / d * f; }
      b.vx *= 0.82; b.vy *= 0.82; b.x += b.vx; b.y += b.vy;
    }
    var fixed = anchors.concat([forEl]);
    for (k = 0; k < 4; k++) {
      for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) collide(active[i], active[j]);
      for (i = 0; i < n; i++) fixed.forEach(function (fx) { // the words "anything" and "for" don't move; bubbles go round them
        var ghost = { x: fx.x, y: fx.y, hw: Math.max(0, fx.w / 2 - fx.h / 2), r: fx.h / 2 + 8 }, bb = active[i], g = gap(bb, ghost, 2);
        if (g.d < g.min) { var nx = g.d < 0.001 ? 0 : g.dx / g.d, ny = g.d < 0.001 ? 1 : g.dy / g.d; bb.x += nx * (g.min - g.d); bb.y += ny * (g.min - g.d); }
      });
    }
    for (i = 0; i < n; i++) {
      b = active[i];
      var m = wallX + b.hw + b.r; // "for" is a wall: neither circle's bubbles cross the middle
      if (b.side < 0 && b.x > -m) b.x = -m; if (b.side > 0 && b.x < m) b.x = m;
      var ex = W - b.hw - b.r, ey = H - b.r; // and nothing leaves the pit
      if (b.x > ex) b.x = ex; if (b.x < -ex) b.x = -ex; if (b.y > ey) b.y = ey; if (b.y < -ey) b.y = -ey;
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
