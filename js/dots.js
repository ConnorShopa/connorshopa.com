// Habbot's sticky dots (ported from the iOS app: Components/StickyDots.swift): two dots joined by a sticky neck.
// Any <span class="stickyDots" data-d="26" data-s="120"> divides from one blob out to its length whenever it
// becomes visible (the card opening, or paging back to it), on the app's own "pull" curve: slow start, smooth finish.
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var ease = null;
  function pull() {
    if (!ease && window.CustomEase) { try { ease = CustomEase.create("habbotPull", "M0,0 C0.45,0 0.2,1 1,1"); } catch (e) {} }
    return ease || "power2.inOut";
  }
  var THIN = 0.55; // how thick the stretched strand is relative to the app's (1 = same as the app)
  function f(n) { return n.toFixed(2); }

  // the goo between the dots, filling in from their centres (the circles cover its ends)
  function neck(r, s) {
    var d = s + 2 * r, cy = r, c1x = r, c2x = r + d, midX = (c1x + c2x) / 2, gap = d - 2 * r;
    if (d <= r * 0.25) return "";
    var p1x, p2x, attachY, theta, tx, ty, kx, ky, half, mid, c;
    if (gap <= 0) { // overlapping circles: a smooth narrowing waist (the "peanut" stage)
      var crossing = Math.sqrt(Math.max(r * r - (d / 2) * (d / 2), 0));
      var waist = crossing + (r - crossing) * 0.4;
      attachY = Math.min(r * 0.95, waist + (r - waist) * 0.55);
      theta = Math.asin(attachY / r);
      var ax = r * Math.cos(theta);
      if (!(c1x + ax < midX)) return "";
      p1x = c1x + ax; p2x = c2x - ax;
      var reach = (midX - p1x) * 0.65;
      tx = Math.sin(theta); ty = Math.cos(theta);
      kx = tx * reach; ky = ty * reach; mid = waist; half = reach / 0.45; c = reach;
      return pathOf(cy, p1x, p2x, midX, attachY, mid, kx, ky, c, c);
    }
    // a strand: fat just after the circles part, thinning with length, never under 20% of the radius
    var strand = THIN * r * Math.max(0.2, 0.32 / (1 + gap / (r * 10)) + 0.12 * Math.exp(-gap / (r * 0.6)));
    attachY = Math.min(r * 0.88, strand + r * 0.75);
    theta = Math.asin(attachY / r);
    p1x = c1x + r * Math.cos(theta); p2x = c2x - r * Math.cos(theta);
    half = midX - p1x;
    tx = Math.sin(theta); ty = Math.cos(theta);
    var handle = Math.min(half * 0.55 / tx, (attachY - strand) * 0.85 / ty);
    kx = tx * handle; ky = ty * handle;
    return pathOf(cy, p1x, p2x, midX, attachY, strand, kx, ky, half * 0.45, half * 0.45);
  }

  function pathOf(cy, p1x, p2x, midX, attachY, mid, kx, ky, cx1, cx2) {
    var y1 = cy - attachY, y2 = cy + attachY;
    return "M" + f(p1x) + " " + f(y1) +
      " C" + f(p1x + kx) + " " + f(y1 + ky) + " " + f(midX - cx1) + " " + f(cy - mid) + " " + f(midX) + " " + f(cy - mid) +
      " C" + f(midX + cx2) + " " + f(cy - mid) + " " + f(p2x - kx) + " " + f(y1 + ky) + " " + f(p2x) + " " + f(y1) +
      " L" + f(p2x) + " " + f(y2) +
      " C" + f(p2x - kx) + " " + f(y2 - ky) + " " + f(midX + cx2) + " " + f(cy + mid) + " " + f(midX) + " " + f(cy + mid) +
      " C" + f(midX - cx1) + " " + f(cy + mid) + " " + f(p1x + kx) + " " + f(y2 - ky) + " " + f(p1x) + " " + f(y2) + " Z";
  }

  function build(el) {
    var D = parseFloat(el.getAttribute("data-d")) || 26, S = parseFloat(el.getAttribute("data-s")) || 120, r = D / 2;
    // data-fit: stretch to the width of the element's container (the wordmark above it) instead of data-s
    var fit = el.hasAttribute("data-fit");
    function size() {
      if (fit && el.offsetWidth > 2 * D) S = el.offsetWidth - 2 * D;
      svg.setAttribute("width", 2 * D + S); svg.setAttribute("height", D);
      svg.setAttribute("viewBox", "0 0 " + (2 * D + S) + " " + D);
    }
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.style.overflow = "visible"; svg.style.display = "block";
    var path = document.createElementNS(NS, "path");
    var a = document.createElementNS(NS, "circle"), b = document.createElementNS(NS, "circle");
    [a, b].forEach(function (c) { c.setAttribute("r", r); c.setAttribute("cy", r); });
    var g = document.createElementNS(NS, "g"); // grows out from the middle of the span
    [path, a, b].forEach(function (n) { n.setAttribute("fill", "currentColor"); g.appendChild(n); });
    svg.appendChild(g);
    el.appendChild(svg);
    var st = { s: -D }, tween = null;
    function draw() { g.setAttribute("transform", "translate(" + f((S - st.s) / 2) + " 0)"); a.setAttribute("cx", r); b.setAttribute("cx", r + st.s + D); path.setAttribute("d", neck(r, st.s)); }
    function play() {
      if (tween) tween.kill();
      size();
      st.s = -D; draw();
      tween = gsap.to(st, { s: S, duration: 1.1, delay: 0.25, ease: pull(), onUpdate: draw });
    }
    size(); draw();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) play(); else { if (tween) tween.kill(); st.s = -D; draw(); } }); }).observe(el);
    } else play();
  }

  document.querySelectorAll(".stickyDots").forEach(build);
})();
