// Filter pills for the centre list.
// Leaving items fade and drop, then the remaining items glide together to close the gap.
// Items coming back fade in once the list has opened a space for them.
(function () {
  if (typeof gsap === "undefined") return;

  var list = document.getElementById("projectList");
  var status = document.getElementById("filterStatus");
  var pills = document.querySelectorAll(".pill[data-filter]");
  if (!list || !pills.length) return;

  var items = Array.prototype.slice.call(list.children);
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t = function (seconds) { return reduce ? 0 : seconds; };

  // ---- tuning ----
  var DROP_DISTANCE = 28;   // px a leaving item falls while it fades
  var DROP_TIME = 0.3;
  var DROP_STAGGER = 0.03;
  var CONVERGE_TIME = 0.6;  // how long the rest of the list takes to close the gap
  var ENTER_TIME = 0.45;

  var current = "all";

  function matches(li, filter) {
    if (filter === "all") return true;
    return (li.getAttribute("data-category") || "").split(" ").indexOf(filter) !== -1;
  }

  function isHidden(li) { return li.classList.contains("is-hidden"); }

  // the last visible item shouldn't have a trailing slash
  function updateSlashes() {
    var last = null;
    items.forEach(function (li) {
      li.classList.remove("no-slash");
      if (!isHidden(li)) last = li;
    });
    if (last) last.classList.add("no-slash");
  }

  function updateStatus() {
    if (!status) return;
    var n = items.filter(function (li) { return !isHidden(li); }).length;
    status.textContent = "Showing " + n + " of " + items.length;
  }

  function setPressed(filter) {
    pills.forEach(function (p) {
      p.setAttribute("aria-pressed", p.getAttribute("data-filter") === filter ? "true" : "false");
    });
  }

  function apply(filter) {
    if (filter === current) return;
    current = filter;
    setPressed(filter);

    // finish anything still moving from a previous click
    gsap.killTweensOf(items);
    gsap.set(items, { clearProps: "transform,opacity" });

    var visible = items.filter(function (li) { return !isHidden(li); });
    var leaving = visible.filter(function (li) { return !matches(li, filter); });
    var staying = visible.filter(function (li) { return matches(li, filter); });
    var entering = items.filter(function (li) { return isHidden(li) && matches(li, filter); });

    if (!leaving.length && !entering.length) { updateStatus(); return; }

    var tl = gsap.timeline();

    // 1. leaving items fade and drop where they are
    if (leaving.length) {
      tl.to(leaving, { opacity: 0, y: DROP_DISTANCE, duration: t(DROP_TIME), ease: "power2.in", stagger: t(DROP_STAGGER) });
    }

    // 2. remove them, let the list reflow, and glide the rest into the new layout
    tl.add(function () {
      var before = new Map();
      staying.forEach(function (li) { before.set(li, li.getBoundingClientRect()); });

      leaving.forEach(function (li) {
        li.classList.add("is-hidden");
        gsap.set(li, { clearProps: "transform,opacity" });
      });
      entering.forEach(function (li) { li.classList.remove("is-hidden"); });
      updateSlashes();
      updateStatus();

      staying.forEach(function (li) {
        var from = before.get(li);
        var to = li.getBoundingClientRect();
        var dx = from.left - to.left;
        var dy = from.top - to.top;
        if (dx || dy) {
          gsap.fromTo(li, { x: dx, y: dy }, { x: 0, y: 0, duration: t(CONVERGE_TIME), ease: "power3.inOut" });
        }
      });

      entering.forEach(function (li) {
        gsap.fromTo(li, { opacity: 0, y: DROP_DISTANCE }, { opacity: 1, y: 0, duration: t(ENTER_TIME), ease: "power2.out", delay: t(0.15) });
      });
    });
  }

  pills.forEach(function (pill) {
    pill.addEventListener("click", function () { apply(pill.getAttribute("data-filter")); });
  });

  updateSlashes();
  updateStatus();
})();
