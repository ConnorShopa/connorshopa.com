$(document).ready(function () {

    // Loop logo on hover
    let iconMenu = document.querySelector('.logoBox');
    let animationMenu = bodymovin.loadAnimation({

        container: iconMenu,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: "resources/lottiefiles/shopaAnimDark.json"
    });

    var directionMenu = 1;
    iconMenu.addEventListener('mouseenter', (e) => {
        animationMenu.setDirection(directionMenu);
        animationMenu.play();
    });

    iconMenu.addEventListener('mouseleave', (e) => {
        animationMenu.setDirection(-directionMenu);
        animationMenu.play();
    });


 

    
});


$("#fullscreenLink, #ramblingLink, #recordShelfLink").hover(
    function() {
      gsap.to($(this), {
        duration: 0.16,
        scale: 0.9,
        background: "white",
        cursor: "pointer",
        transformOrigin: "center center",
      });
    },
    function() {
      gsap.to($(this), {
        duration: 0.16,
        scale: 1,
        background: "#222222",
        border: "none",
        boxshadow: "none",
        transformOrigin: "center center",
      });
    }
  );

// REFRESH FUNCTION

function etRefresh() {
    window.location.reload();
}


//JUMP FUNCTIONS
function etGoHome() {
    console.log("etGoHome() function called!");
    window.location.href = "./index.html";

}

function etGoRecordShelf(){
    window.location.href = "./spotifyRecordShelf.html"
}

function etGoSpotifyFullscreen(){
    window.location.href = "./spotifyFullscreen.html"
}

function etGoDreamRambling(){
    window.location.href = "./spotifyDreamRambling.html"
}

function etGoAcotil() {
    window.location.href = "shopa.acotil.images.html"
}

function openAcotilTab() {
    window.open("https://acollectionofthingsilike.com", "_blank");
}

