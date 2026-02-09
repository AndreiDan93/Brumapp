document.documentElement.classList.add("js");

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 55, 320)}ms`;
    io.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}
