/* live Lottie animations in project views: <div class="lottieBox" data-lottie="path.json">. They play while on screen. */
(function () {
  function init() {
    if (!window.lottie && !window.bodymovin) return;
    var L = window.lottie || window.bodymovin;
    document.querySelectorAll(".lottieBox[data-lottie]").forEach(function (box) {
      var anim = L.loadAnimation({ container: box, renderer: "svg", loop: true, autoplay: false, path: box.getAttribute("data-lottie") });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) { es[0].isIntersecting ? anim.play() : anim.pause(); }).observe(box);
      } else anim.play();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
