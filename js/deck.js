// Phones: the project list is a wheel of cards, driven by dragging (no scrolling element, so nothing to snap or fight).
// The card in the middle is the current project (it opens on the first in the list); the ones before it curve away
// above and the ones after it below, shrinking, tilting back and fading like the drum of a picker. Dragging up (or
// wheeling down) turns it forward, dragging down turns it back; it loops, and settles on a card when let go.
// Logos are grey until their card is the current one.
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
    // the card in front is the colour of its project view's card (so the card opens out of and closes back into the same colour)
    var vw = document.getElementById("view-" + a.getAttribute("data-view"));
    li.style.setProperty("--card", (vw && vw.style.getPropertyValue("--view-bg")) || a.getAttribute("data-bubble") || "#F4F4F4");
    cards.push(li);
  });
  var N = cards.length;
  if (N < 3) return;

  var STEP = 150;  // dragging this far moves one card
  var GAP = -3;    // the space between neighbouring cards (edge to edge), the same all the way round; negative = they overlap like a stack
  var heights = [], dirty = true;
  var spread = 1, introRaf = 0, pos = 0, target = 0, vel = 0, anim = 0, dragging = false, moved = false;
  var lastT = 0;

  function measureHeader() {
    if (!header || !mq.matches) return;
    document.documentElement.style.setProperty("--hdrH", Math.ceil(header.getBoundingClientRect().bottom + 12) + "px");
  }
  // a few cards are a little bigger or smaller than the rest while they are in focus (1 = the same as the others)
  var adj = cards.map(function (li) {
    if (li.querySelector(".drawlText")) return 1.3;
    var a = li.querySelector("a"), v = a && a.getAttribute("data-view");
    return v === "touchtunes" ? 0.88 : 1;
  });
  var RADIUS = 0.25; // a card's corner radius as a share of its own height, so every card is rounded the same amount
  function measure() {
    heights = cards.map(function (li) { var h = li.offsetHeight || 100; li.style.borderRadius = Math.round(h * RADIUS) + "px"; return h; });
    dirty = false;
  }

  // style writes are skipped when nothing changed; a value something else wiped (GSAP sets scale / translate to "none")
  // is written again
  function put(li, prop, val) {
    var c = li.__v || (li.__v = {}), cur = li.style[prop];
    if (c[prop] !== val || (val !== "" && (cur === "" || cur === "none"))) { li.style[prop] = val; c[prop] = val; }
  }
  function putVar(li, val) { var c = li.__v || (li.__v = {}); if (c.dim !== val) { li.style.setProperty("--dim", val); c.dim = val; } }
  function putPk(li, val) { var c = li.__v || (li.__v = {}); if (c.pk !== val) { li.style.setProperty("--pk", val); c.pk = val; } }
  // ---- the floating "View" button: ready only while a project is settled in focus ----
  var viewBtn = document.createElement("button");
  viewBtn.type = "button"; viewBtn.className = "deckView"; viewBtn.textContent = "Open"; viewBtn.disabled = true;
  viewBtn.setAttribute("aria-label", "Open the project in focus");
  document.body.appendChild(viewBtn);
  var wheeling = false, fromBtn = false, gallery = false;
  // ---- the round button next to it: switch between the stacked carousel and a plain scrolling gallery ----
  var modeBtn = document.createElement("button");
  modeBtn.type = "button"; modeBtn.className = "deckMode";
  modeBtn.innerHTML = '<svg class="icGrid" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></svg>' +
    '<svg class="icStack" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="7" y="3.5" width="10" height="4" rx="2"/><rect x="4.5" y="9.5" width="15" height="5.5" rx="2.75"/><rect x="7" y="17" width="10" height="4" rx="2"/></svg>';
  modeBtn.setAttribute("aria-label", "Switch to the gallery view");
  document.body.appendChild(modeBtn);
  function clearCardStyles() {
    cards.forEach(function (li) { li.__v = null; li.style.scale = li.style.translate = li.style.opacity = li.style.zIndex = li.style.visibility = ""; li.style.removeProperty("--dim"); li.style.rotate = ""; li.style.borderRadius = ""; li.classList.remove("isActive"); });
  }
  // The gallery is a justified "art wall": the cards are packed into rows that each fill the width exactly. For a row of
  // n cards with width : height ratios r1..rn and a gap g, the row height that makes them fill a width W is
  //     h = (W - g(n - 1)) / (r1 + ... + rn)
  // and every card is scaled to that height (so it keeps its shape). Cards are added to a row until its height drops to
  // the row's target, keeping whichever count lands nearest it; the targets vary row to row along a golden-ratio
  // sequence, so the wall has a hung, uneven rhythm instead of a grid.
  var spacer = null;
  function layoutGallery() {
    if (!gallery) return;
    var M = 24, W = list.clientWidth - M * 2, g = 22, base = 70, i = 0, row = 0, y = 18, tops = [];
    var nat = cards.map(function (li) { return { w: li.offsetWidth || 100, h: li.offsetHeight || 60 }; });
    var place = function (from, to, h, stretch) {
      var widths = [], total = 0, k;
      for (k = from; k < to; k++) { widths[k - from] = nat[k].w / nat[k].h * h; total += widths[k - from]; }
      total += g * (to - from - 1);
      var x = M + (stretch ? 0 : (W - total) / 2);
      for (k = from; k < to; k++) {
        var li = cards[k], f = h / nat[k].h;
        li.style.scale = String(f); li.style.translate = x.toFixed(1) + "px " + y.toFixed(1) + "px";
        li.style.borderRadius = Math.round(nat[k].h * RADIUS) + "px";
        li.style.setProperty("--i", String(k));
        tops[k] = y; x += widths[k - from] + g;
      }
      y += h + g;
    };
    while (i < N) {
      var target = base * (0.92 + 0.16 * (((row + 1) * 0.6180339887) % 1)); // 0.92x .. 1.08x of the base height: the rows stay close in size
      var sum = 0, n = 0, prevH = Infinity, j2 = i;
      for (; j2 < N; j2++) {
        sum += nat[j2].w / nat[j2].h; n++;
        var h = (W - g * (n - 1)) / sum;
        if (h <= target) {
          // the row is full: keep this card, or leave it for the next row, whichever lands nearer the target height
          if (n > 1 && (Math.abs(prevH - target) < Math.abs(h - target) || h < target * 0.88)) { n--; h = prevH; } else { j2++; }
          prevH = h; break;
        }
        prevH = h;
      }
      if (j2 >= N && n === N - i && prevH > target) { /* ran out of cards before the row filled: keep its natural look */ }
      var rowH = prevH, stretch = true;
      if (rowH > target * 1.08) { rowH = target * 1.08; stretch = false; } // a row never grows past the target: it is centred instead, so cards stay close in size
      place(i, j2 > i ? j2 : i + 1, rowH, stretch); i = j2 > i ? j2 : i + 1;
      row++;
    }
    if (!spacer) { spacer = document.createElement("div"); spacer.className = "deckSpacer"; list.appendChild(spacer); }
    spacer.style.top = (y + 130) + "px";
    return tops;
  }
  function setGallery(on) {
    if (on === gallery) return;
    var root = document.documentElement;
    list.style.transition = "opacity .18s ease"; list.style.opacity = "0";
    setTimeout(function () {
      if (on) {
        gallery = true; cancelAnimationFrame(anim); anim = 0;
        clearCardStyles();
        root.classList.add("deckGallery");
        var cur = ((Math.round(target) % N) + N) % N, tops = layoutGallery();
        var curH = cards[cur].offsetHeight * parseFloat(cards[cur].style.scale || 1);
        list.scrollTop = Math.max(0, tops[cur] - (list.clientHeight - curH) / 2);
      } else {
        gallery = false;
        root.classList.remove("deckGallery");
        clearCardStyles(); if (spacer) { spacer.remove(); spacer = null; }
        dirty = true; render();
      }
      modeBtn.setAttribute("aria-label", on ? "Switch to the stacked view" : "Switch to the gallery view");
      list.style.opacity = "1"; updateBtn();
      setTimeout(function () { list.style.transition = ""; list.style.opacity = ""; }, 220);
    }, reduce ? 0 : 180);
  }
  modeBtn.addEventListener("click", function (e) { e.stopPropagation(); setGallery(!gallery); });
  function focusCard() { return cards[((Math.round(target) % N) + N) % N]; }
  function updateBtn() {
    // ready the moment a card is chosen (as the finger lifts), not once it has finished sliding into place
    var ready = mq.matches && !dragging && !wheeling && spread >= 1 && !gallery;
    modeBtn.classList.toggle("shown", mq.matches && spread >= 1);
    if (ready) {
      viewBtn.classList.add("shown");
      viewBtn.style.setProperty("--btn", focusCard().style.getPropertyValue("--card") || "#F4F4F4"); // the colour of its card
    }
    viewBtn.classList.toggle("ready", ready);
    viewBtn.disabled = !ready;
  }
  viewBtn.addEventListener("click", function (e) {
    e.stopPropagation(); // (the page closes a project on any click outside its card: this one opens it)
    var a = focusCard().querySelector("a");
    moved = false; // (a swipe's flag must not swallow this tap)
    if (a && !viewBtn.disabled) { fromBtn = true; a.click(); fromBtn = false; }
  });
  function wrap(k) { return ((k + N / 2) % N + N) % N - N / 2; }

  // how big a card is by how many places it is from the front (the front card is 1.3x, then they drop away)
  function scaleAt(k) { var a = Math.abs(k); return 0.2 + 1.1 / (1 + (a * a) / 0.49); } // front 1.3x; the rest are smaller
  function render() {
    if (!mq.matches || gallery) return;
    if (dirty) measure();
    var b = Math.floor(pos), f = pos - b, ks = [], sc = [], ys = [], i, n;
    for (i = 0; i < N; i++) { ks[i] = wrap(i - pos); sc[i] = scaleAt(ks[i]) * (1 + (adj[i] - 1) * Math.max(0, 1 - Math.abs(ks[i]))); }
    // the cards are laid out one after the other, each a fixed gap from the one before (measured between the edges of
    // the cards as they are drawn, i.e. after scaling), so the distance between neighbours is the same everywhere
    var d = function (x, z) { return (heights[x] * sc[x] + heights[z] * sc[z]) / 2 + GAP; };
    var ib = ((b % N) + N) % N, inext = (ib + 1) % N;
    ys[ib] = -f * d(ib, inext);
    var half = Math.ceil(N / 2);
    for (n = 1; n <= half; n++) { var q = (ib + n) % N, pq = (ib + n - 1) % N; ys[q] = ys[pq] + d(pq, q); }
    for (n = 1; n < N - half; n++) { var q2 = ((ib - n) % N + N) % N, nq = (q2 + 1) % N; ys[q2] = ys[nq] - d(q2, nq); }
    for (i = 0; i < N; i++) ys[i] *= spread;
    var best = -1, bestA = 9;
    for (i = 0; i < N; i++) {
      var li = cards[i], H = heights[i], a = Math.abs(ks[i]);
      if (a < bestA) { bestA = a; best = i; }
      var op = Math.max(0, 1 - Math.pow(a / 3.4, 2.2)) * Math.min(1, spread * 1.6);
      put(li, "scale", (sc[i] * (0.5 + 0.5 * spread)).toFixed(4));
      put(li, "translate", "0 " + (ys[i] - H / 2).toFixed(1) + "px");
      put(li, "rotate", "");
      put(li, "opacity", op.toFixed(3));
      put(li, "zIndex", String(100 - Math.round(a * 10)));
      put(li, "visibility", op < 0.02 ? "hidden" : "");
      putVar(li, Math.min(a * 0.12, 0.35).toFixed(2));
    }
    for (var m = 0; m < N; m++) cards[m].classList.toggle("isActive", m === best && bestA < 0.3);
    updateBtn();
  }

  // ---- movement ----
  function frame(t) {
    var dt = Math.min((t - lastT) / 1000, 0.05); lastT = t;
    if (!dragging) {
      var d = target - pos;
      pos += d * (1 - Math.exp(-dt * 11));          // an ease-out settle onto the target card
      if (Math.abs(target - pos) < 0.0008) { pos = target; render(); anim = 0; updateBtn(); return; }
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
    if (!mq.matches || gallery || (e.pointerType === "mouse" && e.button !== 0)) return;
    dragging = true; moved = false; updateBtn(); sy = e.clientY; sp = pos; hist = [{ t: e.timeStamp, p: pos }];
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
    settle(moved ? v : 0); updateBtn();
    setTimeout(function () { moved = false; }, 60); // a click right after a swipe is swallowed; later taps are not
  }
  list.addEventListener("pointerup", release);
  list.addEventListener("pointercancel", release);
  // a drag is not a tap; tapping a card behind the front one brings it forward instead of opening it
  list.addEventListener("click", function (e) {
    if (!mq.matches || gallery || fromBtn) return;
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
    if (!mq.matches || gallery) return;
    e.preventDefault();
    wheeling = true; updateBtn();
    target = pos = pos + e.deltaY / (STEP * 1.6);
    render();
    clearTimeout(wheelT); wheelT = setTimeout(function () { wheeling = false; settle(0); updateBtn(); }, 120);
  }, { passive: false });

  function refresh() {
    if (mq.matches) { measureHeader(); dirty = true; render(); }
    else cards.forEach(function (li) { li.__v = null; li.style.scale = li.style.translate = li.style.opacity = li.style.zIndex = li.style.visibility = ""; li.style.removeProperty("--dim"); li.style.rotate = ""; li.style.borderRadius = ""; li.classList.remove("isActive"); });
  }
  var lastW = window.innerWidth;
  window.addEventListener("resize", function () {
    // (phones also fire "resize" when the address bar slides away while scrolling: only a change of width re-lays the gallery)
    var widthChanged = window.innerWidth !== lastW; lastW = window.innerWidth;
    refresh(); if (widthChanged) layoutGallery();
  });
  if (mq.addEventListener) mq.addEventListener("change", function () { if (!mq.matches) { viewBtn.classList.remove("shown", "ready"); viewBtn.disabled = true; modeBtn.classList.remove("shown"); if (gallery) { gallery = false; document.documentElement.classList.remove("deckGallery"); } } });
  // on load the cards grow in from the middle and spread out to their places
  function intro() {
    if (introRaf || spread >= 1) return;
    var t0 = 0;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 700, 1);
      spread = 1 - Math.pow(1 - p, 3);
      render();
      introRaf = p < 1 ? requestAnimationFrame(step) : 0;
    };
    introRaf = requestAnimationFrame(step);
  }
  if (mq.matches && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) { spread = 0; setTimeout(function () { if (spread < 1 && !introRaf) { spread = 1; render(); } }, 3500); }
  window.addEventListener("load", function () { refresh(); setTimeout(refresh, 1200); setTimeout(intro, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  if (mq.addEventListener) mq.addEventListener("change", refresh);
  if (window.ResizeObserver) { var ro = new ResizeObserver(function () { dirty = true; render(); layoutGallery(); }); cards.forEach(function (li) { ro.observe(li); }); if (header) ro.observe(header); }
  cards.forEach(function (li) { Array.prototype.forEach.call(li.querySelectorAll("img"), function (img) { if (!img.complete) img.addEventListener("load", refresh); }); });
  // something else (a pop-in, say) wiping the cards' transforms: put them back
  if (window.MutationObserver) new MutationObserver(function () { if (!anim) render(); }).observe(list, { attributes: true, attributeFilter: ["style"], subtree: true });
  refresh();
  setTimeout(refresh, 600);
  }
})();
