// Board extras: grow the cursor circle over tiles, and play the Lottie logo on hover.
$(function () {
  if (typeof gsap !== "undefined") {
    $(".tile").hover(
      function () { gsap.to("#mouse-circle", { duration: 0.32, scale: 2 }); },
      function () { gsap.to("#mouse-circle", { duration: 0.32, scale: 1 }); }
    );
  }

  var logoAnim = document.querySelector(".logoAnim");
  var logoBox = document.querySelector(".logoBox");
  if (logoAnim && logoBox && typeof bodymovin !== "undefined") {
    var anim = bodymovin.loadAnimation({
      container: logoAnim,
      renderer: "svg",
      loop: false,
      autoplay: false,
      path: "animations/shopaAnimation.json",
    });
    logoBox.addEventListener("mouseenter", function () { anim.setDirection(1); anim.play(); });
    logoBox.addEventListener("mouseleave", function () { anim.setDirection(-1); anim.play(); });
  }
});
