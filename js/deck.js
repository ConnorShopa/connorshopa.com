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

  // the deck loops: when the middle card is near either end, a card from the other end is moved over (and the scroll
  // position adjusted by exactly its height, so nothing visibly moves)
  function loop() {
    var vis = shown();
    if (vis.length < 6) return;
    var mid = middle(), idx = 0, bd = 1e9;
    vis.forEach(function (li, i) { var d = Math.abs(li.offsetTop + li.offsetHeight / 2 - mid); if (d < bd) { bd = d; idx = i; } });
    var guard = 0;
    while (idx < 3 && guard++ < 8) {            // too close to the top: bring the last card round to the front
      var ref = vis[0], y0 = ref.offsetTop, last = vis.pop();
      list.insertBefore(last, ref); vis.unshift(last); idx++;
      list.scrollTop += ref.offsetTop - y0;
    }
    while (vis.length - 1 - idx < 4 && guard++ < 16) { // too close to the bottom: send the first card round to the back
      var f = vis.shift(), ref2 = vis[0], y1 = ref2.offsetTop;
      list.appendChild(f); vis.push(f); idx--;
      list.scrollTop += ref2.offsetTop - y1;
    }
  }

  var raf = 0, landed = false;
  function update() {
    raf = 0;
    if (!mq.matches) return;
    loop();
    var mid = middle(), best = null, bestD = 1e9;
    shown().forEach(function (li) {
      var h = li.offsetHeight || 1;
      var d = (li.offsetTop + h / 2 - mid) / h;      // 0 = centred, > 0 = further down the deck, < 0 = already passed
      var a = Math.abs(d);
      if (a < bestD) { bestD = a; best = li; }
      li.classList.toggle("isBehind", d > 0.45);
      if (reduce) { li.style.setProperty("--dim", a > 0.5 ? "0.5" : "0"); return; }
      if (d > 0) {
        // the cards still to come are piled behind the current one, each a little lower and smaller: only a strip of
        // its bottom edge shows
        var dd = Math.min(d, 3), sc = Math.max(0.8, 1 - d * 0.05);
        li.style.scale = String(sc);
        li.style.translate = "0 " + ((h * (1 - sc)) / 2 + 62 * dd - d * h).toFixed(1) + "px";
        li.style.rotate = "";
        li.style.zIndex = String(50 - Math.round(d * 10));
        li.style.setProperty("--dim", Math.min(d * 0.15, 0.4).toFixed(2));
        li.style.visibility = d > 3.2 ? "hidden" : "";
      } else {
        // a card that has been passed rides up and away: it tilts back, shrinks and fades
        li.style.translate = "";
        li.style.scale = String(Math.max(0.8, 1 - a * 0.12));
        li.style.rotate = "1 0 0 " + Math.min(a * 14, 20).toFixed(1) + "deg";
        li.style.zIndex = String(52 - Math.round(a * 10));
        li.style.setProperty("--dim", Math.min(a * 0.8, 0.9).toFixed(2));
        li.style.visibility = a > 2 ? "hidden" : "";
      }
    });
    cardsAll().forEach(function (li) { li.classList.toggle("isActive", li === best && bestD < 0.3); });
    activeLink = list.style.visibility === "hidden" ? null : linkOf(best && bestD < 0.3 ? best : null);
    btn.classList.toggle("show", !!activeLink);
    btn.setAttribute("aria-label", activeLink ? "Open " + (activeLink.getAttribute("aria-label") || (activeLink.querySelector("img[alt]:not([alt=''])") || {}).alt || (activeLink.textContent || "").trim() || "project") : "Open project");
  }
  function queue() { if (!raf) raf = requestAnimationFrame(update); }

  function clear() {
    cardsAll().forEach(function (li) { li.style.scale = li.style.translate = li.style.rotate = li.style.zIndex = li.style.visibility = ""; li.style.removeProperty("--dim"); li.classList.remove("isActive", "isBehind"); });
    btn.classList.remove("show");
  }
  // opens with the first project in the middle (until the person scrolls, it is kept there as logos and fonts settle)
  function land() { if (!landed && first && mq.matches) { loop(); centre(first); loop(); centre(first); } }
  function refresh() { if (mq.matches) { measureHeader(); land(); queue(); } else clear(); }

  ["touchstart", "wheel", "pointerdown", "keydown"].forEach(function (ev) { list.addEventListener(ev, function () { landed = true; }, { passive: true }); });
  list.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", refresh);
  window.addEventListener("load", function () { refresh(); setTimeout(refresh, 1200); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  if (mq.addEventListener) mq.addEventListener("change", refresh);
  if (window.ResizeObserver && header) new ResizeObserver(refresh).observe(header);
  if (window.MutationObserver) new MutationObserver(queue).observe(list, { attributes: true, attributeFilter: ["style"] });
  refresh();
  setTimeout(refresh, 600); // after the pop-in on load has finished
})();
