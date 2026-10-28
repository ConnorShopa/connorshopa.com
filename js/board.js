// Play the Lottie logo on hover.
$(function () {
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
