window.onload = function () {
  //hide the preloader
  document.querySelector(".pre-loader").style.display = "none";
};






let hamburger = document.querySelector(".hamburger");
let mob = document.querySelector(".mobile-nav");
hamburger.addEventListener("click", () => {
  if (mob.style.display == "none") {
    mob.style.display = "block";
    setTimeout(() => {
      document.querySelector(".nav-content").style.transform =
        "translateX(100%)";
    }, 100);
  } else {
    setTimeout(() => {
      document.querySelector(".nav-content").style.transform =
        "translateX(-100%)";
    }, 100);
    mob.style.display = "none";
  }
});
document.querySelector(".nav-blocker").addEventListener("click", () => {
  setTimeout(() => {
    document.querySelector(".nav-content").style.transform =
      "translateX(-100%)";
  }, 100);
  mob.style.display = "none";
});

let counter_counter = 0;
function handleIntersection(entries, observer) {
  entries.forEach((entry) => {
    if (
      entry.isIntersecting &&
      entry.target.id === "analysis" &&
      counter_counter < 1
    ) {
      function counter(id, start, end, duration) {
        let obj = document.getElementById(id),
          current = start,
          range = end - start,
          increment = end > start ? 1 : -1,
          step = Math.abs(Math.floor(duration / range)),
          timer = setInterval(() => {
            current += increment;
            obj.textContent = current;
            if (current == end) {
              clearInterval(timer);
            }
          }, step);
      }
      counter("count1", 0, 500, 3000);
      counter("count2", 0, 50, 2500);
      counter("count3", 0, 20, 3000);
      counter("count4", 0, 75, 3000);
      counter("count5", 0, 8, 3000);
      counter_counter++;
    }
  });
}

// Create an Intersection Observer with the callback
const observer = new IntersectionObserver(handleIntersection);

// Specify the target section to observe
const section3 = document.getElementById("analysis");

// Start observing section3
observer.observe(section3);


