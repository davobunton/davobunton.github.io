// scroll.js — Scroll-triggered animations
// davidbunton.design

document.addEventListener('DOMContentLoaded', () => {

  // ----------------------------------------------------------
  // RANDOM GRADIENTS — project cards
  // ----------------------------------------------------------

  document.querySelectorAll('.project-card').forEach(card => {
    const x  = Math.floor(Math.random() * 80) + 10;
    const y  = Math.floor(Math.random() * 80) + 10;
    const lx = Math.floor(Math.random() * 70) + 15;
    const ly = Math.floor(Math.random() * 70) + 15;
    card.style.setProperty('--grad-x',       `${x}%`);
    card.style.setProperty('--grad-y',       `${y}%`);
    card.style.setProperty('--grad-light-x', `${lx}%`);
    card.style.setProperty('--grad-light-y', `${ly}%`);
  });


  // ----------------------------------------------------------
  // FADE-UP — content animates in on scroll
  // ----------------------------------------------------------

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.anim-fade-up').forEach(el => fadeObserver.observe(el));


});
