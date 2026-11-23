/* live Lottie animations in project views: <div class="lottieBox" data-lottie="path.json">. They play while on screen. */
(function () {
  function init(root) {
    if (!window.lottie && !window.bodymovin) return;
    var L = window.lottie || window.bodymovin;
    (root || document).querySelectorAll(".lottieBox[data-lottie]").forEach(function (box) {
      if (box._lot) return; box._lot = true;
      var anim = L.loadAnimation({ container: box, renderer: "svg", loop: true, autoplay: false, path: box.getAttribute("data-lottie") });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) { es[0].isIntersecting ? anim.play() : anim.pause(); }).observe(box);
      } else anim.play();
    });
  }
  window.initLotties = init;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { init(); }); else init();
})();
