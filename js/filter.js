// The centre list: three links to a row, an invisible copy that reserves the list's space, and the pop-in on load.
(function () {
  if (typeof gsap === "undefined") return;

  var list = document.getElementById("projectList");
  if (!list) return;

  var items = Array.prototype.slice.call(list.children);

  // Reserve the full list's space: an invisible copy of the list sits in the same spot, so the block keeps its
  // height (at any screen width) and nothing around it shifts.
  var nav = list.parentElement;
  var ghost = list.cloneNode(true);
  ghost.removeAttribute("id");
  ghost.classList.add("ghost");
  ghost.setAttribute("aria-hidden", "true");
  ghost.setAttribute("inert", "");
  ghost.querySelectorAll("a").forEach(function (a) { a.setAttribute("tabindex", "-1"); });
  nav.insertBefore(ghost, list);
  nav.classList.add("stack");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t = function (seconds) { return reduce ? 0 : seconds; };

  // items scale from their own centre
  gsap.set(items, { transformOrigin: "50% 50%" });

  // at most three items per row: a zero-height break after every third visible item, and no interpunct at the
  // end of a row; each row then centres on its own
  // phones report a wider window when something overflows, so the screen width counts too
  var perRow = function () { return Math.min(window.innerWidth, window.screen && screen.width ? screen.width : Infinity) <= 700 ? 1 : 3; }; // one to a row on phones
  function layoutRows(listEl, lis) {
    var per = perRow();
    listEl.querySelectorAll(".row-break").forEach(function (b) { b.remove(); });
    var shown = lis.filter(function (li) {
      return !li.classList.contains("is-hidden") && !li.classList.contains("is-current");
    });
    shown.forEach(function (li, i) {
      var rowEnd = i % per === per - 1;
      li.classList.toggle("no-slash", rowEnd || i === shown.length - 1);
      if (rowEnd && i < shown.length - 1) {
        var br = document.createElement("li");
        br.className = "row-break";
        br.setAttribute("aria-hidden", "true");
        listEl.insertBefore(br, li.nextSibling);
      }
    });
  }
  window.layoutGalleryRows = function () { layoutRows(list, items); };
  layoutRows(ghost, Array.prototype.slice.call(ghost.children));
  items.forEach(function (li) { li.classList.remove("no-slash"); });
  layoutRows(list, items);
  // re-flow the rows when the screen crosses the phone breakpoint
  var lastPer = perRow();
  window.addEventListener("resize", function () {
    if (perRow() === lastPer) return;
    lastPer = perRow();
    layoutRows(ghost, Array.prototype.slice.call(ghost.children).filter(function (li) { return !li.classList.contains("row-break"); }));
    items.forEach(function (li) { if (!li.classList.contains("row-break")) li.classList.remove("no-slash"); });
    layoutRows(list, items.filter(function (li) { return !li.classList.contains("row-break"); }));
  });

  // ---- on load: the links pop in one after another, from the top left to the bottom right ----
  var links = items.filter(function (li) { return !li.classList.contains("row-break"); });
  gsap.set(links, { scale: 0, opacity: 0 });
  var play = function () {
    gsap.to(links, {
      scale: 1,
      opacity: 1,
      duration: t(0.3),
      ease: "back.out(1.2)",
      stagger: t(0.06), // the list is in reading order, so this runs left to right, row by row
      delay: t(0.1),
      onComplete: function () { gsap.set(links, { clearProps: "transform,opacity" }); },
    });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(play); else play();
})();
