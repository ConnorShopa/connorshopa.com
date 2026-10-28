// Phones: the logos are a deck of cards instead of a list. The top card is in front with the others stacked
// behind it; swipe (or drag) it away and it goes to the back of the deck, tap it to open it.
(function () {
  if (typeof gsap === "undefined") return;
  var list = document.getElementById("projectList");
  var nav = list && list.parentElement;
  if (!nav) return;

  var deck = document.createElement("ul");
  deck.className = "deck";
  deck.setAttribute("aria-label", "Work");
  var cards = [];
  Array.prototype.forEach.call(list.children, function (li) {
    if (li.classList.contains("row-break")) return;
    var card = document.createElement("li");
    card.className = "card";
    var a = li.querySelector("a");
    if (!a) return;
    card.appendChild(a.cloneNode(true));
    deck.appendChild(card);
    cards.push(card);
  });
  nav.appendChild(deck);
  if (window.bindProjectLinks) window.bindProjectLinks(deck);

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var n = cards.length;
  var top = 0; // index of the card in front
  var STEP_Y = 14, STEP_S = 0.05, VISIBLE = 4;

  function slot(i) { return (i - top + n) % n; }
  function place(card, i, animate) {
    var k = slot(i);
    var props = {
      y: -k * STEP_Y, scale: 1 - k * STEP_S, rotation: 0,
      opacity: k < VISIBLE ? 1 : 0,
      zIndex: n - k,
    };
    card.style.pointerEvents = k === 0 ? "auto" : "none";
    if (animate && !reduce) gsap.to(card, Object.assign({ duration: 0.35, ease: "power3.out", overwrite: "auto" }, props));
    else gsap.set(card, Object.assign({ x: 0 }, props));
  }
  function layout(animate) { cards.forEach(function (c, i) { place(c, i, animate); }); }
  layout(false);
  gsap.set(cards, { transformOrigin: "50% 100%" });

  // send the front card away to the side, then tuck it in at the back
  function next(dir) {
    var leaving = cards[top];
    top = (top + 1) % n;
    cards.forEach(function (c, i) { if (c !== leaving) place(c, i, true); });
    leaving.style.pointerEvents = "none";
    var back = -(n - 1) * STEP_Y;
    if (reduce) { place(leaving, cards.indexOf(leaving), false); return; }
    gsap.to(leaving, {
      x: dir * 340, rotation: dir * 10, duration: 0.22, ease: "power2.in", overwrite: "auto",
      onComplete: function () {
        gsap.set(leaving, { zIndex: 0 });
        gsap.to(leaving, { x: 0, rotation: 0, y: back, scale: 1 - Math.min(n - 1, VISIBLE) * STEP_S, opacity: n - 1 < VISIBLE ? 1 : 0, duration: 0.3, ease: "power2.out", onComplete: function () { place(leaving, cards.indexOf(leaving), false); } });
      },
    });
  }

  // drag the front card; past a short distance it goes to the back
  var drag = null, moved = false;
  deck.addEventListener("pointerdown", function (e) {
    var card = e.target.closest(".card");
    if (!card || card !== cards[top]) return;
    drag = { x: e.clientX, card: card };
    moved = false;
    gsap.killTweensOf(card);
    try { deck.setPointerCapture(e.pointerId); } catch (err) {}
  });
  deck.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x;
    if (Math.abs(dx) > 8) moved = true;
    if (moved) gsap.set(drag.card, { x: dx, rotation: dx / 18 });
  });
  function end(e) {
    if (!drag) return;
    var dx = e.clientX - drag.x, card = drag.card;
    drag = null;
    if (Math.abs(dx) > 60) next(dx > 0 ? 1 : -1);
    else gsap.to(card, { x: 0, rotation: 0, duration: 0.25, ease: "power2.out" });
  }
  deck.addEventListener("pointerup", end);
  deck.addEventListener("pointercancel", end);
  // a drag is not a tap
  deck.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

  // arrow keys for keyboards
  deck.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") next(1); else if (e.key === "ArrowLeft") next(-1); });
})();
