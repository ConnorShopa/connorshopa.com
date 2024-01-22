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

// REFRESH FUNCTION

function etRefresh() {
    window.location.reload();
}


//JUMP FUNCTIONS
function etGoHome() {
    console.log("etGoHome() function called!");
    window.location.href = "./index.html";

}

function etGoAcotil() {
    window.location.href = "shopa.acotil.images.html"
}

function openAcotilTab() {
    window.open("https://acollectionofthingsilike.com", "_blank");
}

