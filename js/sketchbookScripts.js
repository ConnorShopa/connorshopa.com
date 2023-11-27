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





$(document).ready(function () {
  // Loop logo on hover
  let iconMenu = document.querySelector('.logoBox');
  let animateLogo = bodymovin.loadAnimation({
    container: iconMenu,
    renderer: 'svg',
    loop: false,
    autoplay: false,
    path: "resources/lottiefiles/shopaAnimDark.json"
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

  // GO BACK TO SHOPA.STUDIO FUNCTION CALLED ON CLICK
  function etGoHome() {
    window.location.href = "./";
  }

  // CIRCLE FOLLOWS CURSOR FUNCTION//
  let mousePosX = 0,
      mousePosY = 0,
      mouseCircle = document.getElementById('mouse-circle');

  document.onmousemove = (e) => {
    mousePosX = e.clientX + 2;
    mousePosY = e.clientY + 8;
  }

  let delay = 6,
      revisedMousePosX = 0,
      revisedMousePosY = 0;

  function startMouseFollow() {
    requestAnimationFrame(startMouseFollow);

    // Include scroll offset
    let scrollOffsetY = window.pageYOffset || document.documentElement.scrollTop;

    revisedMousePosX += (mousePosX - revisedMousePosX) / delay;
    revisedMousePosY += (mousePosY - revisedMousePosY) / delay;

    mouseCircle.style.top = revisedMousePosY + scrollOffsetY + 'px';
    mouseCircle.style.left = revisedMousePosX + 'px';
  }

  // ON LOAD FUNC CALLS
  startMouseFollow();

  // GSAP ANIMATIONS
    // SNAPPING MOUSE CIRCLE TO LINK ELEMENTS
    $("#extraneousLinks a").hover(
      function () {
          // Get the position and width of the hovered link
          let linkPos = $(this).offset();
          let linkWidth = $(this).innerWidth()*0.8;

          // Set revisedMousePosX and revisedMousePosY to the link's position
          revisedCirclePosX = linkPos.left+20;
          revisedCirclePosY = linkPos.top;

          // Update the mouse circle position without considering link height
          updateMouseCirclePosition(true, linkWidth); // Pass true to indicate hover

          // Apply hover animations
          gsap.to("#mouse-circle", { duration: 0.32, scale: 2 });
          $(this).css("color", "blue");
          $(this).css("text-decoration", "underline");

          // Add a black border to the mouse circle
          mouseCircle.style.border = '0.5px solid #E7CE7E';
      },
      function () {
          // Update the mouse circle position without considering link height
          updateMouseCirclePosition(false); // Pass false to indicate un-hover

          // Apply hover out animations
          gsap.to("#mouse-circle", { duration: 0.1, scale: 1 });
          $(this).css("color", "#0A3D62");
          $(this).css("text-decoration", "none");

          // Remove the black border on un-hover
          mouseCircle.style.border = 'none';
      }
  );
  
  function updateMouseCirclePosition(isHover, linkWidth) {
      console.log(isHover)
      console.log(revisedCirclePosX)
      console.log(linkWidth)
      // Update the position of the mouse circle
      mouseCircle.style.top = (revisedCirclePosY - 40); // Adjusted for better vertical alignment
      mouseCircle.style.left = (revisedCirclePosX - linkWidth / 2); // Center the rectangle over the link
  
      // Set the width of the rectangle to the link's text width
      mouseCircle.style.width = isHover ? linkWidth + 'px' : '';
  
      // Check if you should transition to a rectangle
      if (isHover) {
          // Adjust the height of the rectangle
          mouseCircle.style.height = '20px'; // Set the desired height
          mouseCircle.style.borderRadius = '10px'; // Set the desired border radius
      } else {
          // Reset to circle
          mouseCircle.style.height = ''; // Reset the height
          mouseCircle.style.borderRadius = '50%';
      }
  }


  $("#extraneousLinks a").hover(function () {
      gsap.to("#mouse-circle", { duration: 0.32, scale: 2 });
      $(this).css("color", "blue");
      $(this).css("text-decoration", "underline");
  }, function () {
      gsap.to("#mouse-circle", { duration: 0.32, scale: 1 });
      $(this).css("color", "#0A3D62");
      $(this).css("text-decoration", "none");
  });

  $("#logoBox").hover(function () {
      gsap.to("#mouse-circle", { duration: 0.32, scale: 2 });
  }, function () {
      gsap.to("#mouse-circle", { duration: 0.32, scale: 1 });
  });

  /* When the user scrolls down, hide the logoBar. When the user scrolls up, show the navbar */
  var prevScrollpos = window.pageYOffset;
  window.onscroll = function () {
    var currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
      document.getElementById("headerBox").style.top = "0";
      document.getElementById("extraneousLinks").style.bottom = "1.6vh";
    } else {
      document.getElementById("headerBox").style.top = "-100px";
      document.getElementById("extraneousLinks").style.bottom = "-140px";
    }
    prevScrollpos = currentScrollPos;
  }
});
