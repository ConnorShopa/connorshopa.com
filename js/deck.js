// Phones: the project list is a stacked deck of cards, driven by dragging (no scrolling element, so nothing to snap or
// fight). The card in the middle is the current project (it opens on the first in the list); the cards that follow are
// stacked behind it, each peeking out a little lower and smaller, with a small grey copy of its logo. Dragging up (or
// wheeling down) slides the current card away and brings the next one forward; dragging down brings the previous one
// back from above. It loops, and settles on a card when let go. Logos are grey until their card is the current one.
(function () {
  var failed = function (e) { document.documentElement.classList.add("deckFail"); if (window.console) console.error("deck:", e); };
  try { init(); } catch (e) { failed(e); }
  // safety net: if the deck has not put a card in front a moment after loading, fall back to a plain scrolling list
  window.addEventListener("load", function () {
    setTimeout(function () {
      var l = document.getElementById("projectList");
      if (l && window.matchMedia("(max-width: 700px)").matches && !l.querySelector("li.isActive")) failed("no card in front");
    }, 2500);
  });
  function init() {
  var list = document.getElementById("projectList");
  if (!list) return;
  var header = document.querySelector(".hero > header");
  var mq = window.matchMedia("(max-width: 700px)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var cards = [];
  Array.prototype.forEach.call(list.children, function (li) {
    if (li.tagName !== "LI" || li.classList.contains("row-break")) return;
    var a = li.querySelector("a");
    if (!a) return;
    li.classList.add("deckCard");
    li.style.setProperty("--card", a.getAttribute("data-bubble") || "#FFFFFF");
    var pk = document.createElement("span"); // a small copy of the logo for the part of the card that peeks out
    pk.className = "peek"; pk.setAttribute("aria-hidden", "true");
    pk.innerHTML = a.innerHTML;
    li.appendChild(pk);
    cards.push(li);
  });
  var N = cards.length;
  if (N < 3) return;

  var PEEK = 56;   // how much of each card behind shows below the one in front, in px
  var STEP = 150;  // dragging this far moves one card
  var heights = [], dirty = true;
  var pos = 0, target = 0, vel = 0, anim = 0, dragging = false, moved = false;
  var lastT = 0;

  function measureHeader() {
    if (!header || !mq.matches) return;
    document.documentElement.style.setProperty("--hdrH", Math.ceil(header.getBoundingClientRect().bottom + 12) + "px");
  }
  function measure() { heights = cards.map(function (li) { return li.offsetHeight || 100; }); dirty = false; }

  // style writes are skipped when nothing changed; a value something else wiped (GSAP sets scale / translate to "none")
  // is written again
  function put(li, prop, val) {
    var c = li.__v || (li.__v = {}), cur = li.style[prop];
    if (c[prop] !== val || (val !== "" && (cur === "" || cur === "none"))) { li.style[prop] = val; c[prop] = val; }
  }
  function putVar(li, val) { var c = li.__v || (li.__v = {}); if (c.dim !== val) { li.style.setProperty("--dim", val); c.dim = val; } }
  function putPk(li, val) { var c = li.__v || (li.__v = {}); if (c.pk !== val) { li.style.setProperty("--pk", val); c.pk = val; } }
  function wrap(k) { return ((k + N / 2) % N + N) % N - N / 2; }

  function render() {
    if (!mq.matches) return;
    if (dirty) measure();
    var p = ((pos % N) + N) % N, j = Math.floor(p), f = p - j;
    var Hc = heights[j] + (heights[(j + 1) % N] - heights[j]) * f; // the height of the card in front, blended while moving
    var best = -1, bestA = 9;
    for (var i = 0; i < N; i++) {
      var li = cards[i], H = heights[i], k = wrap(i - pos), a = Math.abs(k);
      if (a < bestA) { bestA = a; best = i; }
      var y, s, op, dim, z;
      if (k >= 0) {
        // still to come: stacked behind the front card, lower and smaller
        var kk = Math.min(k, 3.4);
        s = 1 - 0.05 * kk;
        y = Hc / 2 + PEEK * kk - (H * s) / 2;
        op = kk <= 2.4 ? 1 : Math.max(0, 1 - (kk - 2.4));
        dim = Math.min(kk * 0.15, 0.4);
        z = 100 - Math.round(kk * 10);
      } else {
        // passed: slides up and away, fading (and comes back down the same way)
        s = 1 - 0.06 * Math.min(a, 1);
        y = -a * (H + 60) * 0.9;
        op = Math.max(0, 1 - a * 1.15);
        dim = Math.min(a * 0.6, 0.7);
        z = 106 - Math.round(a * 10);
      }
      put(li, "scale", s.toFixed(4));
      put(li, "translate", "0 " + (y - H / 2).toFixed(1) + "px");
      put(li, "opacity", op.toFixed(3));
      put(li, "zIndex", String(z));
      put(li, "visibility", op < 0.02 ? "hidden" : "");
      putVar(li, dim.toFixed(2));
      putPk(li, Math.max(0, Math.min(1, (k - 0.15) / 0.5)).toFixed(2)); // the logo fades into its small copy as the card goes behind
    }
    for (var m = 0; m < N; m++) cards[m].classList.toggle("isActive", m === best && bestA < 0.3);
  }

  // ---- movement ----
  function frame(t) {
    var dt = Math.min((t - lastT) / 1000, 0.05); lastT = t;
    if (!dragging) {
      var d = target - pos;
      pos += d * (1 - Math.exp(-dt * 11));          // an ease-out settle onto the target card
      if (Math.abs(target - pos) < 0.0008) { pos = target; render(); anim = 0; return; }
    }
    render();
    anim = requestAnimationFrame(frame);
  }
  function kick() { if (!anim) { lastT = performance.now(); anim = requestAnimationFrame(frame); } }
  function goTo(t) { target = t; if (reduce) { pos = t; render(); return; } kick(); }
  function settle(v) { goTo(Math.round(pos + Math.max(-2.5, Math.min(2.5, v * 0.1)))); }

  // ---- drag (touch, pen or mouse) ----
  var sy = 0, sp = 0, hist = [];
  list.addEventListener("pointerdown", function (e) {
    if (!mq.matches || (e.pointerType === "mouse" && e.button !== 0)) return;
    dragging = true; moved = false; sy = e.clientY; sp = pos; hist = [{ t: e.timeStamp, p: pos }];
    target = pos;
    try { list.setPointerCapture(e.pointerId); } catch (x) {}
    kick();
  });
  list.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var dy = e.clientY - sy;
    if (Math.abs(dy) > 6) moved = true;
    pos = sp - dy / STEP;
    hist.push({ t: e.timeStamp, p: pos });
    while (hist.length > 2 && e.timeStamp - hist[0].t > 100) hist.shift();
  });
  function release(e) {
    if (!dragging) return;
    dragging = false;
    var h0 = hist[0], h1 = hist[hist.length - 1], v = 0;
    if (h0 && h1 && h1.t > h0.t) v = ((h1.p - h0.p) / (h1.t - h0.t)) * 1000; // cards per second
    settle(moved ? v : 0);
  }
  list.addEventListener("pointerup", release);
  list.addEventListener("pointercancel", release);
  // a drag is not a tap; tapping a card behind the front one brings it forward instead of opening it
  list.addEventListener("click", function (e) {
    if (!mq.matches) return;
    var li = e.target.closest && e.target.closest("li.deckCard");
    if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; return; }
    if (li && !li.classList.contains("isActive")) {
      e.preventDefault(); e.stopPropagation();
      var i = cards.indexOf(li), k = wrap(i - Math.round(pos));
      goTo(Math.round(pos) + k);
    }
  }, true);
  // a wheel or trackpad (a narrow desktop window)
  var wheelT = 0;
  list.addEventListener("wheel", function (e) {
    if (!mq.matches) return;
    e.preventDefault();
    target = pos = pos + e.deltaY / (STEP * 1.6);
    render();
    clearTimeout(wheelT); wheelT = setTimeout(function () { settle(0); }, 120);
  }, { passive: false });

  function refresh() {
    if (mq.matches) { measureHeader(); dirty = true; render(); }
    else cards.forEach(function (li) { li.__v = null; li.style.scale = li.style.translate = li.style.opacity = li.style.zIndex = li.style.visibility = ""; li.style.removeProperty("--dim"); li.style.removeProperty("--pk"); li.classList.remove("isActive"); });
  }
  window.addEventListener("resize", refresh);
  window.addEventListener("load", function () { refresh(); setTimeout(refresh, 1200); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  if (mq.addEventListener) mq.addEventListener("change", refresh);
  if (window.ResizeObserver) { var ro = new ResizeObserver(function () { dirty = true; render(); }); cards.forEach(function (li) { ro.observe(li); }); if (header) ro.observe(header); }
  cards.forEach(function (li) { Array.prototype.forEach.call(li.querySelectorAll("img"), function (img) { if (!img.complete) img.addEventListener("load", refresh); }); });
  // something else (a pop-in, say) wiping the cards' transforms: put them back
  if (window.MutationObserver) new MutationObserver(function () { if (!anim) render(); }).observe(list, { attributes: true, attributeFilter: ["style"], subtree: true });
  refresh();
  setTimeout(refresh, 600);
  }
})();
