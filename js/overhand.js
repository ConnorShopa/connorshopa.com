/* Overhand: the "trade anything for anything" words as a pile of bubbles.
   They are pulled toward the middle of the pit, can't overlap each other (each one is a capsule),
   and the mouse pushes them away a little. */
(function () {
  var GIVE = ["renders", "business plans", "subscriptions", "ux flows"], GET = ["product", "money", "mentorship", "ideas"]; // the two sides of the trade, with "for" between
  // fill, text colour, size (font px), taken from the reference
  var STYLES = [
    ["#FDE9A8", "#0B1620"], ["#E4F9DC", "#0B1620"], ["#F5C97F", "#0B1620"], ["#FFDC5A", "#0B1620"],
    ["#9BE8E8", "#0B1620"], ["#E1E5E9", "#0B1620"], ["#9B96F6", "#0B1620"], ["#F07B7B", "#fff"],
    ["#7FB4F6", "#0B1620"], ["#6A5CDF", "#fff"], ["#FF4B4B", "#fff"], ["#98DAF8", "#0B1620"],
    ["#6A7075", "#fff"], ["#FFE49C", "#0B1620"], ["#2F3436", "#fff"], ["#B8BEC4", "#0B1620"],
  ];
  var SIZES = [15, 17, 19, 21, 16, 18, 20, 17, 22, 16, 18, 15, 19, 17, 20, 16];
  var GAP = 12, REACH = 120, PUSH = 2.6; // mouse radius (px) and strength
  var pit = null, bubs = [], mouse = { x: -9999, y: -9999 }, raf = 0, ready = false, visible = false;

  function build() {
    pit = document.querySelector(".ohPit");
    if (!pit) return;
    // each side is its words repeated, so it reads as "any of these for any of those"
    function three(w) { return w.concat(w.slice().reverse(), w.slice(2), w.slice(0, 2)); } // every word exactly three times
    var left = three(GIVE), right = three(GET), list = [];
    left.forEach(function (w, k) { list.push([w, -1, k]); });
    right.forEach(function (w, k) { list.push([w, 1, k]); });
    list.splice(left.length, 0, ["for", 0, 0]);
    list.forEach(function (it, i) {
      var s = STYLES[it[2] % STYLES.length], el = document.createElement("span"), fs = SIZES[it[2] % SIZES.length]; // same colours and sizes on both sides
      el.className = "ohBub";
      el.textContent = it[0];
      if (it[1] === 0) { // "for": plain text in the middle, not a bubble
        el.className = "ohBub ohFor"; fs = 30;
      } else { el.style.background = s[0]; el.style.color = s[1]; }
      el.style.fontSize = fs + "px";
      if (it[1] !== 0) el.style.padding = Math.round(fs * 0.62) + "px " + Math.round(fs * 2) + "px";
      pit.appendChild(el);
      bubs.push({ el: el, side: it[1], fixed: it[1] === 0, x: 0, y: 0, vx: 0, vy: 0, hw: 0, r: 0 });
    });
    [-1, 1].forEach(function (side) { // each pile is titled "anything"
      var h = document.createElement("span");
      h.className = "ohLabel"; h.textContent = "anything"; h.setAttribute("data-side", side);
      pit.appendChild(h);
    });
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

  // each side of the trade gathers around its own centre, left and right of the middle
  function armX() { return Math.min(pit.offsetWidth * 0.3, 330); }

  function measure() {
    if (!pit.offsetWidth) return false;
    bubs.forEach(function (b, i) {
      var w = b.el.offsetWidth, h = b.el.offsetHeight;
      b.r = h / 2; b.hw = Math.max(0, w / 2 - h / 2); b.w = w; b.h = h;
      if (!ready) { // scatter around the middle on first layout
        var a = i * 2.4, d = 60 + (i % 5) * 26;
        b.x = b.side * armX() + Math.cos(a) * d; b.y = Math.sin(a) * d * 0.9; b.vx = b.vy = 0;
      }
    });
    pit.querySelectorAll(".ohLabel").forEach(function (h) {
      h.style.left = (pit.offsetWidth / 2 + h.getAttribute("data-side") * armX()) + "px";
    });
    ready = true; return true;
  }

  // capsules are horizontal segments [x-hw, x+hw] at y with radius r: push two apart when they overlap
  function collide(a, b) {
    var a0 = a.x - a.hw, a1 = a.x + a.hw, b0 = b.x - b.hw, b1 = b.x + b.hw, pa, pb;
    var lo = Math.max(a0, b0), hi = Math.min(a1, b1);
    if (lo <= hi) { pa = pb = (lo + hi) / 2; }
    else if (a1 < b0) { pa = a1; pb = b0; } else { pa = a0; pb = b1; }
    var dx = pa - pb, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy), min = a.r + b.r + GAP;
    if (d >= min) return;
    var nx, ny;
    if (d < 0.001) { nx = 0; ny = 1; d = 0; } else { nx = dx / d; ny = dy / d; }
    if (a.fixed && b.fixed) return;
    var push = a.fixed || b.fixed ? min - d : (min - d) / 2;
    if (!a.fixed) { a.x += nx * push; a.y += ny * push; }
    if (!b.fixed) { b.x -= nx * push; b.y -= ny * push; }
  }

  function step() {
    var n = bubs.length, i, j, b, k, ax = armX(), barrier = 0;
    for (i = 0; i < n; i++) if (bubs[i].fixed) barrier = bubs[i].w / 2 + 28;
    for (i = 0; i < n; i++) {
      b = bubs[i];
      if (b.fixed) { b.x = b.y = b.vx = b.vy = 0; continue; }
      b.vx += (b.side * ax - b.x) * (b.side ? 0.0015 : 0.02); b.vy += -b.y * 0.0065; // gravity to the middle (a touch stronger vertically: a flatter pile)
      var dx = b.x - mouse.x, dy = b.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < REACH && d > 0.5) { var f = (1 - d / REACH) * PUSH; b.vx += dx / d * f; b.vy += dy / d * f; }
      b.vx *= 0.86; b.vy *= 0.86;
      b.x += b.vx; b.y += b.vy;
    }
    for (k = 0; k < 4; k++) for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) collide(bubs[i], bubs[j]);
    var W = pit.offsetWidth / 2, H = pit.offsetHeight / 2;
    for (i = 0; i < n; i++) { // stay inside the pit
      b = bubs[i];
      if (b.fixed) { b.el.style.transform = "translate(" + (W - b.w / 2).toFixed(1) + "px," + (H - b.h / 2).toFixed(1) + "px)"; continue; }
      var mx = W - b.hw - b.r, my = H - b.r;
      // "for" is a wall: the left pile can't cross to the right of it, nor the right pile to the left
      var wall = barrier + b.hw + b.r;
      if (b.side < 0 && b.x > -wall) b.x = -wall; if (b.side > 0 && b.x < wall) b.x = wall;
      if (b.x > mx) b.x = mx; if (b.x < -mx) b.x = -mx; if (b.y > my) b.y = my; if (b.y < -my) b.y = -my;
      b.el.style.transform = "translate(" + (W + b.x - b.w / 2).toFixed(1) + "px," + (H + b.y - b.h / 2).toFixed(1) + "px)";
    }
  }

  function loop() {
    raf = 0;
    if (!visible) return;
    if (!ready && !measure()) { raf = requestAnimationFrame(loop); return; }
    step();
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!raf) raf = requestAnimationFrame(loop); }

  function init() { build(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ready = false; }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
