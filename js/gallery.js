// Animated post-it gallery: notes drop in, then float gently; hover lifts and straightens a note.
(function () {
  var slots = document.querySelectorAll(".slot");
  if (!slots.length || typeof gsap === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function rot(el) {
    return parseFloat(getComputedStyle(el).getPropertyValue("--rot")) || 0;
  }

  // Entrance: drop in and settle, one after another
  gsap.fromTo(
    slots,
    { opacity: 0, y: -90, scale: 0.9, rotation: function (i, el) { return rot(el) - 14; } },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      rotation: function (i, el) { return rot(el); },
      duration: 0.75,
      ease: "back.out(1.6)",
      stagger: 0.09,
      onComplete: startFloat,
    }
  );

  // Idle: each note drifts a few pixels on its own rhythm
  function startFloat() {
    slots.forEach(function (el) {
      gsap.to(el, {
        y: gsap.utils.random(-5, 5),
        rotation: rot(el) + gsap.utils.random(-1, 1),
        duration: gsap.utils.random(2.2, 3.6),
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    });
  }

  // Hover and keyboard focus: lift, straighten, deepen the shadow
  slots.forEach(function (slot) {
    var note = slot.querySelector(".note");

    function lift() {
      gsap.set(slot, { zIndex: 5 });
      gsap.to(note, {
        duration: 0.35,
        scale: 1.1,
        y: -8,
        rotation: -rot(slot),
        boxShadow: "0 18px 28px rgba(0, 0, 0, 0.2)",
        ease: "power2.out",
      });
      gsap.to("#mouse-circle", { duration: 0.32, scale: 2 });
    }

    function drop() {
      gsap.set(slot, { zIndex: 1 });
      gsap.to(note, {
        duration: 0.35,
        scale: 1,
        y: 0,
        rotation: 0,
        boxShadow: "0 8px 14px rgba(0, 0, 0, 0.12)",
        ease: "power2.out",
      });
      gsap.to("#mouse-circle", { duration: 0.32, scale: 1 });
    }

    note.addEventListener("mouseenter", lift);
    note.addEventListener("mouseleave", drop);
    note.addEventListener("focus", lift);
    note.addEventListener("blur", drop);
  });
})();
