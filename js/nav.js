// nav.js — Header, flyout, popovers
// davidbunton.design

document.addEventListener('DOMContentLoaded', () => {

  // ----------------------------------------------------------
  // ACTIVE NAV STATE
  // ----------------------------------------------------------

  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const isHome  = (href === '/index.html' || href === '/') && (path === '/' || path.endsWith('/index.html'));
    const isMatch = href !== '/index.html' && href !== '/' && path.endsWith(href.replace('.html', '').replace(/^\//, ''));
    if (isHome || isMatch) link.classList.add('is-active');
  });




  // ----------------------------------------------------------
  // HEADER SCROLL STATE
  // ----------------------------------------------------------

  const header = document.getElementById('site-header');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    }, { passive: true });
  }


  // ----------------------------------------------------------
  // PROJECTS FLYOUT
  // ----------------------------------------------------------

  const navItemProjects = document.getElementById('nav-item-projects');
  const navProjects     = document.getElementById('nav-projects');
  const flyout          = document.getElementById('projects-flyout');
  const flyoutItems     = flyout ? Array.from(flyout.querySelectorAll('.flyout-item')) : [];
  const navAiLab        = document.getElementById('nav-ai-lab');

  let flyoutHideTimer = null;

  function showFlyout() {
    if (!flyout) return;
    clearTimeout(flyoutHideTimer);
    flyout.classList.add('is-visible');
    flyout.setAttribute('aria-hidden', 'false');
    navProjects.setAttribute('aria-expanded', 'true');
  }

  function hideFlyout() {
    if (!flyout) return;
    flyoutHideTimer = setTimeout(() => {
      flyout.classList.remove('is-visible');
      flyout.setAttribute('aria-hidden', 'true');
      navProjects.setAttribute('aria-expanded', 'false');
    }, 100);
  }

  if (navItemProjects && navProjects && flyout) {

    // Mouse: show/hide on hover (with delay on hide so mouse can travel to flyout)
    navItemProjects.addEventListener('mouseenter', showFlyout);
    navItemProjects.addEventListener('mouseleave', hideFlyout);

    // Keep flyout open when mouse is over it
    flyout.addEventListener('mouseenter', () => clearTimeout(flyoutHideTimer));
    flyout.addEventListener('mouseleave', hideFlyout);

    // Keyboard: show on focus
    navProjects.addEventListener('focus', showFlyout);

    navProjects.addEventListener('keydown', (e) => {

      // Tab → close flyout, natural tab order moves to AI Lab
      if (e.key === 'Tab' && !e.shiftKey) {
        hideFlyout();
      }

      // Down arrow → enter flyout
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (flyoutItems.length) flyoutItems[0].focus();
      }

      // Escape → close flyout, return focus to Projects
      if (e.key === 'Escape') {
        hideFlyout();
        navProjects.focus();
      }
    });

    // Keyboard: navigate within flyout
    flyoutItems.forEach((item, index) => {

      item.addEventListener('keydown', (e) => {
        // Down arrow → next item
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = flyoutItems[index + 1];
          if (next) next.focus();
        }
        // Up arrow → previous item or back to Projects link
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (index === 0) {
            navProjects.focus();
          } else {
            flyoutItems[index - 1].focus();
          }
        }
        // Escape → close flyout, return focus to Projects
        if (e.key === 'Escape') {
          hideFlyout();
          navProjects.focus();
        }
      });

      // Close flyout when focus leaves the nav item entirely
      item.addEventListener('blur', () => {
        setTimeout(() => {
          if (!navItemProjects.contains(document.activeElement)) {
            hideFlyout();
          }
        }, 0);
      });
    });

    // Close flyout when focus leaves Projects link (and not into flyout)
    navProjects.addEventListener('blur', () => {
      setTimeout(() => {
        if (!navItemProjects.contains(document.activeElement)) {
          hideFlyout();
        }
      }, 0);
    });
  }


  // ----------------------------------------------------------
  // MOBILE NAV
  // ----------------------------------------------------------

  const hamburger  = document.getElementById('nav-hamburger');
  const mobileNav  = document.getElementById('mobile-nav');

  function openMobileNav() {
    hamburger.classList.add('is-open');
    mobileNav.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    hamburger.classList.remove('is-open');
    mobileNav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.contains('is-open');
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hamburger.classList.contains('is-open')) {
        closeMobileNav();
        hamburger.focus();
      }
    });

    // Close overlay when a nav link is tapped
    mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });
  }


  // ----------------------------------------------------------
  // CONTACT POPOVER
  // ----------------------------------------------------------

  const contactBtn     = document.getElementById('contact-btn');
  const contactPopover = document.getElementById('contact-popover');

  function showContactPopover() {
    if (!contactPopover) return;
    contactPopover.classList.add('is-visible');
    contactPopover.setAttribute('aria-hidden', 'false');
    contactBtn.setAttribute('aria-expanded', 'true');
  }

  function hideContactPopover() {
    if (!contactPopover) return;
    contactPopover.classList.remove('is-visible');
    contactPopover.setAttribute('aria-hidden', 'true');
    contactBtn.setAttribute('aria-expanded', 'false');
  }

  if (contactBtn && contactPopover) {

    // Toggle on click
    contactBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = contactBtn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        hideContactPopover();
      } else {
        hideContactPopover(); // close first if re-opening
        hideFlyout();         // close flyout if open
        showContactPopover();
      }
    });

    // Close on Escape
    contactPopover.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideContactPopover();
        contactBtn.focus();
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!contactBtn.contains(e.target) && !contactPopover.contains(e.target)) {
        hideContactPopover();
      }
    });
  }


});
