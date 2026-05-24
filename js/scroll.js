// scroll.js — Scroll-triggered animations
// davidbunton.design

document.addEventListener('DOMContentLoaded', () => {

  // Observe all .anim-fade-up elements.
  // When they enter the viewport, add .is-visible to trigger the CSS transition.
  // Unobserve immediately after — animates once, doesn't re-trigger on scroll back.

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'  // trigger slightly before fully in view
  });

  document.querySelectorAll('.anim-fade-up').forEach(el => observer.observe(el));

});
