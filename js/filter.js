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

  // a few items per row (see perRow): a zero-height break after every third visible item, and no interpunct at the
  // end of a row; each row then centres on its own
  // phones report a wider window when something overflows, so the screen width counts too
  var perRow = function () {
    var w = Math.min(window.innerWidth, window.screen && screen.width ? screen.width : Infinity);
    return w <= 700 ? 1 : w > 1100 ? 5 : 3; // one on phones, three on tablets, five on wide screens
  };
  function layoutRows(listEl, lis) {
    listEl.querySelectorAll(".row-break").forEach(function (b) { b.remove(); });
    var shown = lis.filter(function (li) {
      return !li.classList.contains("is-hidden") && !li.classList.contains("is-current");
    });
    // lay the rows out with `per` items each; a wide screen never leaves a lonely last item (it borrows one from the
    // row above)
    var apply = function (per) {
      listEl.querySelectorAll(".row-break").forEach(function (b) { b.remove(); });
      var sizes = [], left = shown.length;
      while (left > 0) { sizes.push(Math.min(per, left)); left -= per; }
      if (per > 2 && sizes.length > 1 && sizes[sizes.length - 1] === 1) { sizes[sizes.length - 2] -= 1; sizes[sizes.length - 1] = 2; }
      var ends = {}, run = 0;
      sizes.forEach(function (n) { run += n; ends[run - 1] = true; });
      shown.forEach(function (li, i) {
        var rowEnd = !!ends[i];
        li.classList.toggle("no-slash", rowEnd || i === shown.length - 1);
        if (rowEnd && i < shown.length - 1) {
          var br = document.createElement("li");
          br.className = "row-break";
          br.setAttribute("aria-hidden", "true");
          listEl.insertBefore(br, li.nextSibling);
        }
      });
      return sizes.length;
    };
    // ...and a row that is too wide for the screen would wrap by itself and strand its last item on a line of its own,
    // so the row length drops until every row really fits on one line
    var per = perRow();
    var rows = apply(per);
    if (per > 2 && shown.length) {
      var wraps = function () {
        var tops = {};
        shown.forEach(function (li) { tops[li.offsetTop] = true; });
        return Object.keys(tops).length > rows;
      };
      while (per > 2 && wraps()) rows = apply(--per);
    }
  }
  window.layoutGalleryRows = function () { layoutRows(list, items); };
  layoutRows(ghost, Array.prototype.slice.call(ghost.children));
  items.forEach(function (li) { li.classList.remove("no-slash"); });
  layoutRows(list, items);
  // re-flow the rows whenever the window changes size (and once the fonts are in, which changes the widths)
  var relayout = function () {
    if (list.classList.contains("compact")) return;
    var plain = function (arr) { return arr.filter(function (li) { return !li.classList.contains("row-break"); }); };
    layoutRows(ghost, plain(Array.prototype.slice.call(ghost.children)));
    plain(items).forEach(function (li) { li.classList.remove("no-slash"); });
    layoutRows(list, plain(items));
  };
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(relayout, 80); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);

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
