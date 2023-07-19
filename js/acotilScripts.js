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

    // document.getElementById("footerBox").style.opacity = "100";
  } else {
    document.getElementById("headerBox").style.top = "-100px";
    document.getElementById("footerBox").style.bottom = "-140px";
    
    // document.getElementById("footerBox").style.opacity = "0";
  }
  prevScrollpos = currentScrollPos;
} 

