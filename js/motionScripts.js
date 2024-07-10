$(document).ready(function () {
  if (!("ontouchstart" in window || navigator.maxTouchPoints)) {
    console.log("This is not a touch device");

    // CIRCLE FOLLOWS CURSOR FUNCTION//
    let mousePosX = 0,
      mousePosY = 0,
      mouseCircle = document.getElementById("mouse-circle");

    document.onmousemove = (e) => {
      mousePosX = e.clientX + 2;
      mousePosY = e.clientY + 4;
    };

    let delay = 6,
      revisedMousePosX = 0,
      revisedMousePosY = 0;

    function startMouseFollow() {
      requestAnimationFrame(startMouseFollow);

      // Include scroll offset
      let scrollOffsetY =
        window.pageYOffset || document.documentElement.scrollTop;

      revisedMousePosX += (mousePosX - revisedMousePosX) / delay;
      revisedMousePosY += (mousePosY - revisedMousePosY) / delay;

      mouseCircle.style.top = revisedMousePosY + scrollOffsetY + "px";
      mouseCircle.style.left = revisedMousePosX + "px";
    }

    // ON LOAD FUNC CALLS
    startMouseFollow();

    // GSAP ANIMATIONS

    // SNAPPING MOUSE CIRCLE TO LINK ELEMENTS

    $(".headerBox a, .footerBox a").hover(
      function () {
        // Get the position and width of the hovered link
        let linkPos = $(this).offset();
        let linkWidth = $(this).innerWidth() * 0.8;

        // Set revisedMousePosX and revisedMousePosY to the link's position
        revisedCirclePosX = linkPos.left + 20;
        revisedCirclePosY = linkPos.top;

        // Update the mouse circle position without considering link height
        updateMouseCirclePosition(true, linkWidth); // Pass true to indicate hover

        // Apply hover animations
        gsap.to("#mouse-circle", { duration: 0.32, scale: 2 });
        $(this).css("color", "blue");
        $(this).css("text-decoration", "underline");

        // Add a black border to the mouse circle
        mouseCircle.style.border = "0.5px solid #03131F";
      },
      function () {
        // Update the mouse circle position without considering link height
        updateMouseCirclePosition(false); // Pass false to indicate un-hover

        // Apply hover out animations
        gsap.to("#mouse-circle", { duration: 0.1, scale: 1 });
        $(this).css("color", "black");
        $(this).css("text-decoration", "none");

        // Remove the black border on un-hover
        mouseCircle.style.border = "none";
      }
    );

    function updateMouseCirclePosition(isHover, linkWidth) {
      console.log(isHover);
      console.log(revisedCirclePosX);
      console.log(linkWidth);
      // Update the position of the mouse circle
      mouseCircle.style.top = revisedCirclePosY - 40; // Adjusted for better vertical alignment
      mouseCircle.style.left = revisedCirclePosX - linkWidth / 2; // Center the rectangle over the link

      // Set the width of the rectangle to the link's text width
      mouseCircle.style.width = isHover ? linkWidth + "px" : "";

      // Check if you should transition to a rectangle
      if (isHover) {
        // Adjust the height of the rectangle
        mouseCircle.style.height = "20px"; // Set the desired height
        mouseCircle.style.borderRadius = "10px"; // Set the desired border radius
      } else {
        // Reset to circle
        mouseCircle.style.height = ""; // Reset the height
        mouseCircle.style.borderRadius = "50%";
      }
    }
    // Rest of the code for non-touch devices
  } else {
    // Hide the mouse-circle if it's a touch device
    $("#mouse-circle").hide();
  }

  // Loop logo on hover
  let logoAnim = document.querySelector(".logoAnim");
  let animationMenu = bodymovin.loadAnimation({
    container: logoAnim,
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: "resources/lottiefiles/shopaAnimDark.json",
  });

  let logoBox = document.querySelector(".logoBox");

  var directionMenu = 1;
  logoBox.addEventListener("mouseenter", (e) => {
    animationMenu.setDirection(directionMenu);
    animationMenu.play();
  });

  logoBox.addEventListener("mouseleave", (e) => {
    animationMenu.setDirection(-directionMenu);
    animationMenu.play();
  });

  $(".logoAnim").hover(
    function () {
      gsap.to("#mouse-circle", { duration: 0.32, scale: 2 });
    },
    function () {
      gsap.to("#mouse-circle", { duration: 0.32, scale: 1 });
    }
  );

  //MOBILE MENU ANIM AND LOGIC
  let mobileMenuExpanded = false; // Track the menu state

  let menuButtonAnim = bodymovin.loadAnimation({
    // Adjust these options based on your animation requirements
    container: document.getElementById("menuButtonAnim"),
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: "animations/menuButtonAnim.json",
  });

  $(".mobileMenuButton").click(function () {
    if (!mobileMenuExpanded) {
      menuButtonAnim.setDirection(1);
      menuButtonAnim.play();

      gsap.to(".logoBox", {
        duration: 0.1,
        position: "fixed",
      });

      // Expand the menu
      gsap.to(".mobileMenuScreen", {
        duration: 0.62,

        display: "flex",
        bottom: 0,
        width: "460vw",
        height: "300vh",
        borderRadius: "100%",
      });
      gsap.to(".mobileMenuButton", {
        position: "fixed",
        right: "24px",
      });
      gsap.to(".mobileLinks", {
        duration: 0.3,
        ease: "elastic.out(2, 1.6)",
        gap: "48px",
        display: "flex",
      });
    } else {
      menuButtonAnim.setDirection(-1);
      menuButtonAnim.play();
      gsap.to(".mobileMenuScreen", {
        duration: 0.32,
        width: "1px",
        height: "1px",
        borderRadius: "100%",
        display: "none",
      });
      gsap.to(".mobileLinks", {
        duration: 0.24,
        ease: "elastic.in(0.5, 0.5)",
        gap: "-24px",
        display: "none",
      });

      gsap.to(".mobileMenuButton", {
        background: "white",
      });
    }

    mobileMenuExpanded = !mobileMenuExpanded;
  });
});

// Refresh page on logo click

function etRefresh() {
  window.location.reload();
}

//JUMP FUNCTIONS

function etGoHome() {
  window.location.href = "./index.html";
}

function etGoPollin() {
  window.location.href = "./pollinProject.html";
}

function etGoAcotil() {
  window.location.href = "shopa.acotil.html";
}

function openAcotilTab() {
  window.open("https://acollectionofthingsilike.com", "_blank");
}

function etGoPlunk() {
  window.location.href = "/plunk.html";
}

function etGoPollin() {
  window.location.href = "/pollinProject.html";
}

function etGoSpotify() {
  window.location.href = "/spotifyFullscreen.html";
}

function etGoSpotifyDreams() {
  window.location.href = "/spotifyProject.html";
}

function etGoHabbot() {
  window.location.href = "./habbot.html";
}

function etGoHabbotBeta() {
  window.location.href = "https://testflight.apple.com/join/pagCNvNc";
}

function etGoWork() {
  window.location.href = "/work.html";
}
