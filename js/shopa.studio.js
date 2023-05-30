$(document).ready(function () {

    // Loop logo on hover
    let iconMenu = document.querySelector('.logoAnimation');
    let animationMenu = bodymovin.loadAnimation({

        container: iconMenu,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: "resources/lottiefiles/shopaAnimLight.json"
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


    // Refresh page on logo click

    function refreshPage() {
        window.location.reload();
    }


    //JUMP FUNCTIONS
    function etGoHome() {

        window.location.href = "shopa.studio.html";

    }

    function etGoAcotil() {
        window.location.href = "shopa.acotil.images.html"
    }

    function openAcotilTab() {
        window.open("https://acollectionofthingsilike.com", "_blank");
    }
    $('#who').click(function () {
        setWhoContent();
        let contentState = "whoState"
        console.log(contentState)
    })




    // CIRCLE FOLLOWS CURSOR FUNCTION//
    let mousePosX = 0,
        mousePosY = 0,
        mouseCircle = document.getElementById('mouse-circle');

    document.onmousemove = (e) => {
        mousePosX = e.clientX;
        mousePosY = e.clientY;
    }

    let delay = 6,
        revisedMousePosX = 0,
        revisedMousePosY = 0;

    function startMouseFollow() {
        requestAnimationFrame(startMouseFollow);


        revisedMousePosX += (mousePosX - revisedMousePosX) / delay;
        revisedMousePosY += (mousePosY - revisedMousePosY) / delay;

        mouseCircle.style.top = revisedMousePosY + 'px';
        mouseCircle.style.left = revisedMousePosX + 'px';


    }


    //ON LOAD FUNC CALLS
    startMouseFollow();


    // GSAP ANIMATIONS
    // LINK HOVER ANIMATION


    $("a",).hover(function () {
        gsap.to("#mouse-circle", { duration: 0.1, scale: 2 });
        $(this).css("color", "blue");
        $(this).css("text-decoration", "underline");
        // $(this).css("border-bottom", "1px solid #0A3D62");
    }, function () {
        gsap.to("#mouse-circle", { duration: 0.1, scale: 1 });
        $(this).css("color", "#335D7C");
        $(this).css("text-decoration", "none");
    });

    $("#logoBox").hover(function () {
        gsap.to("#mouse-circle", { duration: 0.1, scale: 2 });
    }, function () {
        gsap.to("#mouse-circle", { duration: 0.1, scale: 1 });
    });

});

