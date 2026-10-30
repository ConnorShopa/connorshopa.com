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
  var REACH = 120, PUSH = 2.6; // mouse radius (px) and strength
  var pit = null, bubs = [], mouse = { x: -9999, y: -9999 }, raf = 0, ready = false, visible = false;

  function build() {
    pit = document.querySelector(".ohPit");
    if (!pit) return;
    // each side is its words repeated, so it reads as "any of these for any of those"
    var left = GIVE.concat(GIVE.slice().reverse(), GIVE.slice(1), GIVE.slice(0, 2)),
        right = GET.concat(GET.slice().reverse(), GET.slice(1), GET.slice(0, 2)),
        list = [];
    left.forEach(function (w) { list.push([w, -1]); });
    right.forEach(function (w) { list.push([w, 1]); });
    list.splice(left.length, 0, ["for", 0]);
    list.forEach(function (it, i) {
      var s = STYLES[i % STYLES.length], el = document.createElement("span"), fs = SIZES[i % SIZES.length];
      el.className = "ohBub";
      el.textContent = it[0];
      if (it[1] === 0) { // "for": a dark pill in the middle, set a little larger
        el.style.background = "#1B2430"; el.style.color = "#FFDD55"; fs = 24;
      } else { el.style.background = s[0]; el.style.color = s[1]; }
      el.style.fontSize = fs + "px";
      el.style.padding = Math.round(fs * 0.62) + "px " + Math.round(fs * 1.25) + "px";
      pit.appendChild(el);
      bubs.push({ el: el, side: it[1], x: 0, y: 0, vx: 0, vy: 0, hw: 0, r: 0 });
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
  function armX() { return Math.min(pit.offsetWidth * 0.26, 220); }

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
    ready = true; return true;
  }

  // capsules are horizontal segments [x-hw, x+hw] at y with radius r: push two apart when they overlap
  function collide(a, b) {
    var a0 = a.x - a.hw, a1 = a.x + a.hw, b0 = b.x - b.hw, b1 = b.x + b.hw, pa, pb;
    var lo = Math.max(a0, b0), hi = Math.min(a1, b1);
    if (lo <= hi) { pa = pb = (lo + hi) / 2; }
    else if (a1 < b0) { pa = a1; pb = b0; } else { pa = a0; pb = b1; }
    var dx = pa - pb, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy), min = a.r + b.r + 2;
    if (d >= min) return;
    var nx, ny;
    if (d < 0.001) { nx = 0; ny = 1; d = 0; } else { nx = dx / d; ny = dy / d; }
    var push = (min - d) / 2;
    a.x += nx * push; a.y += ny * push; b.x -= nx * push; b.y -= ny * push;
  }

  function step() {
    var n = bubs.length, i, j, b, k, ax = armX();
    for (i = 0; i < n; i++) {
      b = bubs[i];
      b.vx += (b.side * ax - b.x) * (b.side ? 0.0035 : 0.02); b.vy += -b.y * 0.0065; // gravity to the middle (a touch stronger vertically: a flatter pile)
      var dx = b.x - mouse.x, dy = b.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < REACH && d > 0.5) { var f = (1 - d / REACH) * PUSH; b.vx += dx / d * f; b.vy += dy / d * f; }
      b.vx *= 0.86; b.vy *= 0.86;
      b.x += b.vx; b.y += b.vy;
    }
    for (k = 0; k < 4; k++) for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) collide(bubs[i], bubs[j]);
    var W = pit.offsetWidth / 2, H = pit.offsetHeight / 2;
    for (i = 0; i < n; i++) { // stay inside the pit
      b = bubs[i];
      var mx = W - b.hw - b.r, my = H - b.r;
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
