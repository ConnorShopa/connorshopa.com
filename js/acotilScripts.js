// Loop logo on hover
let iconMenu = document.querySelector('.logoBox');
let animateLogo = bodymovin.loadAnimation({

  container: iconMenu,
  renderer: 'svg',
  loop: false,
  autoplay: false,
  path: "resources/lottiefiles/shopaAnimLight.json"
});

var directionMenu = 1;
iconMenu.addEventListener('mouseenter', (e) => {
  animateLogo.setDirection(directionMenu);
  animateLogo.play();
});

iconMenu.addEventListener('mouseleave', (e) => {
  animateLogo.setDirection(-directionMenu);
  animateLogo.play();
});


// GO BACK TO SHOPA.STUDIO FUCNTION CALLED ON CLICK
function etGoHome() {
  
  window.location.href = "./";

}

function etGoTextTab() {
  window.location.href = "acotil.text.html"
}

function etGoImagesTab() {
  window.location.href = "acotil.images.html"
}

/* When the user scrolls down, hide the logoBar. When the user scrolls up, show the navbar */
var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
  var currentScrollPos = window.pageYOffset;
  if (prevScrollpos > currentScrollPos) {
    document.getElementById("headerBox").style.top = "0";
    
    document.getElementById("footerBox").style.bottom = "0";

    document.getElementById("extraneousLinks").style.bottom = "1.6vh";

    // document.getElementById("footerBox").style.opacity = "100";
  } else {
    document.getElementById("headerBox").style.top = "-100px";
    document.getElementById("footerBox").style.bottom = "-140px";
    document.getElementById("extraneousLinks").style.bottom = "-140px";
    
    // document.getElementById("footerBox").style.opacity = "0";
  }
  prevScrollpos = currentScrollPos;
} 

// GSAP ANIMATIONS
// LINK HOVER ANIMATION


$("a",).hover(function () {
  gsap.to("#mouse-circle", { duration: 0.1, scale: 2 });
  $(this).css("color", "blue");
  $(this).css("text-decoration", "underline");
  // $(this).css("border-bottom", "1px solid #0A3D62");
  }, function () {
  gsap.to("#mouse-circle", { duration: 0.1, scale: 1 });
  $(this).css("color", "#0A3D62");
  $(this).css("text-decoration", "none");
  });
  
  $("#logoBox").hover(function () {
  gsap.to("#mouse-circle", { duration: 0.1, scale: 2 });
  }, function () {
  gsap.to("#mouse-circle", { duration: 0.1, scale: 1 });
  });
