/* tab groups (.sTabs): clicking a tab shows its panel */
(function () {
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest(".sTab");
    if (!t) return;
    var box = t.closest(".sTabs"), i = t.getAttribute("data-tab");
    box.querySelectorAll(".sTab").forEach(function (b) { b.classList.toggle("on", b === t); });
    box.querySelectorAll(".sPanel").forEach(function (p) { p.classList.toggle("on", p.getAttribute("data-panel") === i); });
  });
})();
