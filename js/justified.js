/* Justified galleries (.pgGallery.justified): pictures keep their order and their proportions, are split into rows of
   similar weight, and every row is scaled to run edge to edge, so the grid has no ragged last row or missing corner. */
(function () {
  var GAP = 16;
  // split `a` (aspect ratios, in order) into n rows so the rows' sums are as even as they can be (linear partition)
  function partition(a, n) {
    var N = a.length, pre = [0], i, j, k;
    for (i = 0; i < N; i++) pre.push(pre[i] + a[i]);
    var mean = pre[N] / n, cost = [], from = [];
    for (k = 0; k <= n; k++) { cost.push(new Array(N + 1).fill(Infinity)); from.push(new Array(N + 1).fill(0)); }
    cost[0][0] = 0;
    for (k = 1; k <= n; k++) for (i = k; i <= N; i++) for (j = k - 1; j < i; j++) {
      var d = pre[i] - pre[j] - mean, c = cost[k - 1][j] + d * d;
      if (c < cost[k][i]) { cost[k][i] = c; from[k][i] = j; }
    }
    var cuts = [], at = N;
    for (k = n; k > 0; k--) { cuts.unshift(at); at = from[k][at]; }
    var rows = [], s = 0;
    cuts.forEach(function (e) { rows.push([s, e]); s = e; });
    return rows;
  }
  function layout(box) {
    var W = box.clientWidth;
    if (!W) return;
    var imgs = box._imgs, gap = W < 560 ? 10 : GAP, per = W < 560 ? 150 : 240; // target row height
    var asp = imgs.map(function (im) { return im._a; });
    var total = asp.reduce(function (s, v) { return s + v; }, 0);
    var n = Math.max(1, Math.min(imgs.length, Math.round((total * per) / (W - gap * 2))));
    box.innerHTML = "";
    box.style.display = "flex"; box.style.flexDirection = "column"; box.style.gap = gap + "px"; box.style.columnCount = "auto";
    partition(asp, n).forEach(function (r) {
      var row = document.createElement("div"), sum = 0, i;
      row.className = "jrow"; row.style.cssText = "display:flex;gap:" + gap + "px;";
      for (i = r[0]; i < r[1]; i++) sum += asp[i];
      var h = (W - gap * (r[1] - r[0] - 1)) / sum;
      for (i = r[0]; i < r[1]; i++) {
        var im = imgs[i]; im.style.width = (asp[i] * h).toFixed(2) + "px"; im.style.height = h.toFixed(2) + "px"; im.style.margin = "0";
        im._fig.style.width = (asp[i] * h).toFixed(2) + "px";
        row.appendChild(im._fig);
      }
      box.appendChild(row);
    });
  }
  function init(root) {
    (root || document).querySelectorAll(".pgGallery.justified").forEach(function (box) {
      if (box._imgs) return;
      var extra = 0; // the animations carry on the note numbers after the last sketch
      box._imgs = Array.prototype.slice.call(box.querySelectorAll("img, .lottieBox")).map(function (im) {
        var w = +(im.getAttribute("width") || im.getAttribute("data-w")), h = +(im.getAttribute("height") || im.getAttribute("data-h"));
        im._a = w / h;
        // a little gallery note under each frame: the number
        var fig = document.createElement("figure"), cap = document.createElement("figcaption"), n = (((im.getAttribute("src") || "").match(/sketch(\d+)/)) || [])[1];
        if (!n) n = String(18 + extra++);
        fig.className = "jfig"; cap.className = "jnote"; cap.textContent = "No. " + n;
        im.parentNode.insertBefore(fig, im); fig.appendChild(im); fig.appendChild(cap);
        im._fig = fig;
        return im; });
      var last = 0;
      var go = function () { var w = box.clientWidth; if (w && w !== last) { last = w; layout(box); } };
      if (window.ResizeObserver) new ResizeObserver(go).observe(box); else { window.addEventListener("resize", go); go(); }
    });
  }
  window.initJustified = init;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { init(); }); else init();
})();
