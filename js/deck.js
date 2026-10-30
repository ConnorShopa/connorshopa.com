// Phones: the project list is a looping deck of cards. The deck scrolls (snapping one card at a time); as it moves,
// the cards behind the current one stay piled up (each peeking out a little lower, with a small grey copy of its
// logo), the ones passed ride up and fade, and the logo of the card in the middle turns to colour. One "Open project"
// button sits at the bottom of the screen and opens whichever card is in the middle.
(function () {
  var list = document.getElementById("projectList");
  if (!list) return;
  var header = document.querySelector(".hero > header");
  var hero = document.querySelector(".hero");
  var mq = window.matchMedia("(max-width: 700px)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var first = null; // the first project in the list: the deck opens with it in the middle

  function cardsAll() { return Array.prototype.filter.call(list.children, function (li) { return li.tagName === "LI" && li.classList.contains("deckCard"); }); }
  function shown() { return cardsAll().filter(function (li) { return li.offsetHeight > 0; }); }

  // each card: its colour (the link's bubble colour) and a small copy of its logo for the part that peeks out
  Array.prototype.forEach.call(list.children, function (li) {
    if (li.tagName !== "LI" || li.classList.contains("row-break")) return;
    var a = li.querySelector("a");
    if (!a) return;
    li.classList.add("deckCard");
    if (!first) first = li;
    li.style.setProperty("--card", a.getAttribute("data-bubble") || "#FFFFFF");
    var pk = document.createElement("span");
    pk.className = "peek"; pk.setAttribute("aria-hidden", "true");
    pk.innerHTML = a.innerHTML;
    li.appendChild(pk);
  });

  // the one button, fixed at the bottom of the screen
  var btn = document.createElement("button");
  btn.type = "button"; btn.className = "openBtn"; btn.textContent = "Open project"; btn.tabIndex = -1;
  (hero || document.body).appendChild(btn);
  var activeLink = null;
  btn.addEventListener("click", function () { if (activeLink) activeLink.click(); });
  function linkOf(li) {
    var a = li && li.querySelector("a");
    return a && !a.classList.contains("noLink") && a.getAttribute("href") ? a : null;
  }

  function measureHeader() {
    if (!header || !mq.matches) return;
    document.documentElement.style.setProperty("--hdrH", Math.ceil(header.getBoundingClientRect().bottom + 12) + "px");
  }
  function middle() { return list.scrollTop + window.innerHeight / 2 - list.getBoundingClientRect().top; } // the middle of the device
  function centre(li) { list.scrollTop = li.offsetTop + li.offsetHeight / 2 - (window.innerHeight / 2 - list.getBoundingClientRect().top); }

  // the deck loops: while it is at rest, cards are moved from one end to the other until the middle card is back in the
  // middle of the pile, and the scroll position is adjusted by exactly the height that moved, so nothing visibly
  // changes. (Never while a finger is down or the deck is coasting: changing the scroll position then would stop it.)
  var recent = [];
  function loop() {
    var vis = shown();
    if (vis.length < 6) return;
    var mid = middle(), idx = 0, bd = 1e9, target = Math.floor(vis.length / 2), guard = 0;
    vis.forEach(function (li, i) { var d = Math.abs(li.offsetTop + li.offsetHeight / 2 - mid); if (d < bd) { bd = d; idx = i; } });
    if (idx >= target - 1 && idx <= target + 1) return;    // already in the middle of the pile: nothing to move
    var now = Date.now(); recent = recent.filter(function (t) { return now - t < 2000; });
    if (recent.length >= 3) return;                         // moving cards over and over: something is fighting it, so stop
    recent.push(now);
    list.style.scrollSnapType = "none";                    // (snapping would re-snap to the wrong card while the cards are moved)
    while (idx < target - 1 && guard++ < 20) {   // too close to the top: bring the last card round to the front
      var ref = vis[0], y0 = ref.offsetTop, last = vis.pop();
      list.insertBefore(last, ref); vis.unshift(last); idx++;
      list.scrollTop += ref.offsetTop - y0;
    }
    while (idx > target + 1 && guard++ < 40) {   // too close to the bottom: send the first card round to the back
      var f = vis.shift(), ref2 = vis[0], y1 = ref2.offsetTop;
      list.appendChild(f); vis.push(f); idx--;
      list.scrollTop += ref2.offsetTop - y1;
    }
    if (landed) requestAnimationFrame(function () { list.style.scrollSnapType = ""; });
  }
  var touching = false, idleT = 0;
  function idle() { clearTimeout(idleT); idleT = setTimeout(function () { if (!touching && mq.matches) { loop(); queue(); } }, 180); }

  var raf = 0, landed = false;
  // style writes are skipped when nothing changed (browsers normalise the values, so the last write is remembered); a
  // value that something else wiped (GSAP sets scale / translate / rotate to "none") is written again
  function put(li, prop, val) {
    var c = li.__v || (li.__v = {}), cur = li.style[prop];
    if (c[prop] !== val || (val !== "" && (cur === "" || cur === "none"))) { li.style[prop] = val; c[prop] = val; }
  }
  function putVar(li, val) { var c = li.__v || (li.__v = {}); if (c.dim !== val) { li.style.setProperty("--dim", val); c.dim = val; } }
  function update() {
    raf = 0;
    if (!mq.matches) return;
    if (!landed) land();
    var mid = middle(), best = null, bestD = 1e9;
    shown().forEach(function (li) {
      var h = li.offsetHeight || 1;
      var d = (li.offsetTop + h / 2 - mid) / h;      // 0 = centred, > 0 = further down the deck, < 0 = already passed
      var a = Math.abs(d);
      if (a < bestD) { bestD = a; best = li; }
      li.classList.toggle("isBehind", d > 0.45);
      if (reduce) { putVar(li, a > 0.5 ? "0.5" : "0"); return; }
      if (d > 0) {
        // the cards still to come are piled behind the current one, each a little lower and smaller: only a strip of
        // its bottom edge shows
        var dd = Math.min(d, 3), sc = Math.max(0.8, 1 - d * 0.05);
        put(li, "scale", String(sc));
        put(li, "translate", "0 " + ((h * (1 - sc)) / 2 + 62 * dd - d * h).toFixed(1) + "px");
        put(li, "rotate", "");
        put(li, "zIndex", String(50 - Math.round(d * 10)));
        putVar(li, Math.min(d * 0.15, 0.4).toFixed(2));
        put(li, "visibility", d > 3.2 ? "hidden" : "");
      } else {
        // a card that has been passed rides up and away: it tilts back, shrinks and fades
        put(li, "translate", "");
        put(li, "scale", String(Math.max(0.8, 1 - a * 0.12)));
        put(li, "rotate", "1 0 0 " + Math.min(a * 14, 20).toFixed(1) + "deg");
        put(li, "zIndex", String(52 - Math.round(a * 10)));
        putVar(li, Math.min(a * 0.8, 0.9).toFixed(2));
        put(li, "visibility", a > 2 ? "hidden" : "");
      }
    });
    cardsAll().forEach(function (li) { li.classList.toggle("isActive", li === best && bestD < 0.3); });
    activeLink = list.style.visibility === "hidden" ? null : linkOf(best && bestD < 0.3 ? best : null);
    btn.classList.toggle("show", !!activeLink);
    btn.setAttribute("aria-label", activeLink ? "Open " + (activeLink.getAttribute("aria-label") || (activeLink.querySelector("img[alt]:not([alt=''])") || {}).alt || (activeLink.textContent || "").trim() || "project") : "Open project");
  }
  function queue() { if (!raf) raf = requestAnimationFrame(update); }

  function clear() {
    cardsAll().forEach(function (li) { li.__v = null; li.style.scale = li.style.translate = li.style.rotate = li.style.zIndex = li.style.visibility = ""; li.style.removeProperty("--dim"); li.classList.remove("isActive", "isBehind"); });
    btn.classList.remove("show");
  }
  // opens with the first project in the middle, and keeps it there (as logos, fonts and the pop-in settle and the cards
  // change size) until the person first touches the deck
  function land() {
    if (landed || !first || !mq.matches) return;
    loop();
    var want = first.offsetTop + first.offsetHeight / 2 - (window.innerHeight / 2 - list.getBoundingClientRect().top);
    if (Math.abs(list.scrollTop - want) > 0.5) list.scrollTop = want;
    loop();
    want = first.offsetTop + first.offsetHeight / 2 - (window.innerHeight / 2 - list.getBoundingClientRect().top);
    if (Math.abs(list.scrollTop - want) > 0.5) list.scrollTop = want;
  }
  function refresh() { if (mq.matches) { measureHeader(); land(); queue(); } else clear(); }

  ["touchstart", "wheel", "pointerdown", "keydown"].forEach(function (ev) { list.addEventListener(ev, function () { landed = true; list.style.scrollSnapType = ""; }, { passive: true }); });
  list.addEventListener("scroll", function () { queue(); idle(); }, { passive: true });
  list.addEventListener("touchstart", function () { touching = true; }, { passive: true });
  ["touchend", "touchcancel"].forEach(function (ev) { list.addEventListener(ev, function () { touching = false; idle(); }, { passive: true }); });
  window.addEventListener("resize", refresh);
  window.addEventListener("load", function () { refresh(); setTimeout(refresh, 1200); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  if (mq.addEventListener) mq.addEventListener("change", refresh);
  if (window.ResizeObserver && header) new ResizeObserver(refresh).observe(header);
  // something else (a pop-in, say) wiping the cards' transforms: put them back
  if (window.MutationObserver) new MutationObserver(queue).observe(list, { attributes: true, attributeFilter: ["style"], subtree: true });
  if (window.ResizeObserver) { var ro = new ResizeObserver(queue); cardsAll().forEach(function (li) { ro.observe(li); }); }
  Array.prototype.forEach.call(list.querySelectorAll("img"), function (img) { if (!img.complete) img.addEventListener("load", refresh); });
  refresh();
  setTimeout(refresh, 600); // after the pop-in on load has finished
})();
