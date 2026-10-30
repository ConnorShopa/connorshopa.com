// Phones: the project list is a deck of cards. The deck scrolls (snapping one card at a time); as it moves, the cards
// tilt, scale and fade by how far they are from the middle, and the card in the middle shows an "Open project" button.
(function () {
  var list = document.getElementById("projectList");
  if (!list) return;
  var header = document.querySelector(".hero > header");
  var mq = window.matchMedia("(max-width: 700px)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cards = Array.prototype.filter.call(list.children, function (li) { return li.tagName === "LI" && !li.classList.contains("row-break"); });

  // each card: its colour (the link's bubble colour) and, if the link goes anywhere, an "Open project" button
  cards.forEach(function (li) {
    var a = li.querySelector("a");
    if (!a) return;
    li.classList.add("deckCard");
    li.style.setProperty("--card", a.getAttribute("data-bubble") || "#FFFFFF");
    if (a.classList.contains("noLink") || !a.getAttribute("href")) return;
    var img = a.querySelector("img[alt]:not([alt=''])");
    var name = a.getAttribute("aria-label") || (img && img.alt) || (a.textContent || "").trim() || "project";
    var b = document.createElement("button");
    b.type = "button";
    b.className = "openBtn";
    b.textContent = "Open project";
    b.setAttribute("aria-label", "Open " + name);
    b.tabIndex = -1;
    b.addEventListener("click", function () { a.click(); });
    li.appendChild(b);
  });

  function shown() { return cards.filter(function (li) { return li.offsetHeight > 0; }); }

  function measureHeader() {
    if (!header || !mq.matches) return;
    document.documentElement.style.setProperty("--hdrH", Math.ceil(header.getBoundingClientRect().bottom + 12) + "px");
  }

  var raf = 0;
  function update() {
    raf = 0;
    if (!mq.matches) return;
    var mid = list.scrollTop + list.clientHeight / 2, best = null, bestD = 1e9;
    shown().forEach(function (li) {
      var h = li.offsetHeight || 1;
      var d = (li.offsetTop + h / 2 - mid) / h;      // 0 = centred, ±1 = one card away
      var a = Math.min(Math.abs(d), 1.4);
      if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = li; }
      if (reduce) { li.style.setProperty("--dim", a > 0.5 ? "0.5" : "0"); return; }
      li.style.scale = String(1 - a * 0.12);
      li.style.translate = "0 " + (-d * 6).toFixed(1) + "px";
      li.style.rotate = "1 0 0 " + (d * -14).toFixed(1) + "deg";
      li.style.zIndex = String(10 - Math.round(a * 4));
      li.style.setProperty("--dim", Math.min(a * 0.7, 0.85).toFixed(2));
    });
    cards.forEach(function (li) { li.classList.toggle("isActive", li === best && bestD < 0.3); });
  }
  function queue() { if (!raf) raf = requestAnimationFrame(update); }

  function clear() {
    cards.forEach(function (li) { li.style.scale = li.style.translate = li.style.rotate = li.style.zIndex = ""; li.style.removeProperty("--dim"); li.classList.remove("isActive"); });
  }
  function refresh() { if (mq.matches) { measureHeader(); queue(); } else clear(); }

  list.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", refresh);
  window.addEventListener("load", function () { refresh(); setTimeout(refresh, 1500); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  if (mq.addEventListener) mq.addEventListener("change", refresh);
  if (window.ResizeObserver && header) new ResizeObserver(refresh).observe(header);
  refresh();
  setTimeout(refresh, 600); // after the pop-in on load has finished
})();
