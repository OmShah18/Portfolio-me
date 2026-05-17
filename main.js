import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ===========================
// LENIS SMOOTH SCROLL
// ===========================

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// ===========================
// PRELOADER
// ===========================
const preloader = document.getElementById('preloader');
const preloaderFill = document.getElementById('preloader-fill');
const preloaderPercent = document.getElementById('preloader-percent');

if (preloader) {
  lenis.stop(); // Stop scrolling while preloading

  const tl = gsap.timeline({
    onComplete: () => {
      lenis.start();
      preloader.style.display = 'none'; // Clean up
    }
  });

  // Animate the fill height
  tl.to(preloaderFill, {
    height: '100%',
    duration: 2.5,
    ease: 'power2.inOut',
  }, 0);

  // Animate the percentage text
  const counter = { val: 0 };
  tl.to(counter, {
    val: 100,
    duration: 2.5,
    ease: 'power2.inOut',
    onUpdate: () => {
      preloaderPercent.textContent = Math.round(counter.val);
    }
  }, 0);

  // Slide preloader up to reveal the page
  tl.to(preloader, {
    yPercent: -100,
    duration: 1.2,
    ease: 'power4.inOut',
    delay: 0.2
  });
}

// ===========================
// FULL SCREEN MENU
// ===========================

const menuToggle = document.getElementById('menu-toggle');
const menuOverlay = document.getElementById('menu-overlay');
const menuLabel = document.getElementById('menu-toggle-label');
const menuItems = document.querySelectorAll('.menu-nav__item');
const menuLinks = document.querySelectorAll('.menu-nav__link');
const menuTexts = document.querySelectorAll('.menu-nav__text');
const topLine = document.querySelector('.menu-toggle__line--top');
const bottomLine = document.querySelector('.menu-toggle__line--bottom');

let isMenuOpen = false;
let menuTimeline = null;

// Build the open/close timeline
function createMenuTimeline() {
  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: 'power4.inOut' },
    onStart: () => {
      menuOverlay.classList.add('is-open');
      lenis.stop();
    },
    onReverseComplete: () => {
      menuOverlay.classList.remove('is-open');
      lenis.start();
    },
  });

  // 1. Reveal the overlay with clip-path
  tl.to(menuOverlay, {
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    duration: 1,
    ease: 'power4.inOut',
  });

  // Hide the logo when menu opens
  const logo = document.querySelector('.velorah-nav__logo');
  if (logo) {
    tl.to(logo, { opacity: 0, pointerEvents: 'none', duration: 0.4 }, 0);
  }

  // 2. Stagger-animate menu text items from below
  tl.from(
    menuTexts,
    {
      yPercent: 120,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power4.out',
    },
    '-=0.4'
  );

  return tl;
}

// Hamburger → X animation
function animateToggleToClose() {
  gsap.to(topLine, {
    rotation: 45,
    y: 7,
    duration: 0.4,
    ease: 'power2.inOut',
  });
  gsap.to(bottomLine, {
    rotation: -45,
    y: -7,
    duration: 0.4,
    ease: 'power2.inOut',
  });
  gsap.to(menuLabel, {
    opacity: 0,
    x: -10,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: () => {
      menuLabel.textContent = 'CLOSE';
      gsap.to(menuLabel, {
        opacity: 1,
        x: 0,
        duration: 0.25,
        ease: 'power2.out',
      });
    },
  });
}

// X → Hamburger animation
function animateToggleToMenu() {
  gsap.to(topLine, {
    rotation: 0,
    y: 0,
    duration: 0.4,
    ease: 'power2.inOut',
  });
  gsap.to(bottomLine, {
    rotation: 0,
    y: 0,
    duration: 0.4,
    ease: 'power2.inOut',
  });
  gsap.to(menuLabel, {
    opacity: 0,
    x: 10,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: () => {
      menuLabel.textContent = 'MENU';
      gsap.to(menuLabel, {
        opacity: 1,
        x: 0,
        duration: 0.25,
        ease: 'power2.out',
      });
    },
  });
}

// Toggle handler
menuToggle.addEventListener('click', () => {
  if (!menuTimeline) {
    menuTimeline = createMenuTimeline();
  }

  if (isMenuOpen) {
    menuTimeline.reverse();
    animateToggleToMenu();
  } else {
    menuTimeline.play(0);
    animateToggleToClose();
  }

  isMenuOpen = !isMenuOpen;
});

// Close menu when a link is clicked
menuLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (isMenuOpen && menuTimeline) {
      menuTimeline.reverse();
      animateToggleToMenu();
      isMenuOpen = false;
    }
  });
});

// ===========================
// HOVER IMAGE CARD REVEAL
// ===========================

let activeHoverItem = null;

menuItems.forEach((item) => {
  const card = item.querySelector('.menu-nav__card');
  let hoverTl = null;

  item.addEventListener('mouseenter', () => {
    if (activeHoverItem && activeHoverItem !== item) {
      activeHoverItem.dispatchEvent(new Event('mouseleave'));
    }
    activeHoverItem = item;

    // Kill any running animation on this card
    if (hoverTl) hoverTl.kill();

    hoverTl = gsap.timeline();

    const linkElement = item.querySelector('.menu-nav__link');

    // Shift text to the right
    hoverTl.to(linkElement, {
      x: card.offsetWidth + 20,
      duration: 0.6,
      ease: 'power3.out',
    }, 0);

    // Reveal the card from the left via clip-path
    hoverTl.to(card, {
      opacity: 1,
      clipPath: 'inset(0 0% 0 0)',
      duration: 0.6,
      ease: 'power3.out',
    }, 0);

    // Slight scale-up on the image for cinematic feel
    hoverTl.to(
      card.querySelector('img'),
      {
        scale: 1.05,
        duration: 1.2,
        ease: 'power2.out',
      },
      0
    );

    // Dim the other items
    menuItems.forEach((otherItem) => {
      if (otherItem !== item) {
        gsap.to(otherItem.querySelector('.menu-nav__link'), {
          opacity: 0.25,
          duration: 0.4,
          ease: 'power2.out',
        });
      }
    });
  });

  item.addEventListener('mouseleave', () => {
    if (activeHoverItem === item) {
      activeHoverItem = null;
    }

    if (hoverTl) hoverTl.kill();

    hoverTl = gsap.timeline();

    const linkElement = item.querySelector('.menu-nav__link');

    // Reset text position
    hoverTl.to(linkElement, {
      x: 0,
      duration: 0.4,
      ease: 'power3.in',
    }, 0);

    // Hide the card back to left
    hoverTl.to(card, {
      clipPath: 'inset(0 100% 0 0)',
      duration: 0.4,
      ease: 'power3.in',
    }, 0);

    hoverTl.set(card, {
      opacity: 0,
    });

    // Reset image scale
    gsap.to(card.querySelector('img'), {
      scale: 1,
      duration: 0.4,
      ease: 'power2.in',
    });

    // Restore all items
    menuItems.forEach((otherItem) => {
      gsap.to(otherItem.querySelector('.menu-nav__link'), {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
    });
  });
});

// ===========================
// SERVICES HOVER REVEAL
// ===========================

const servicesList = document.getElementById('services-list');
if (servicesList) {
  const serviceItems = document.querySelectorAll('.services-item');
  let activeService = null;

  serviceItems.forEach((item) => {
    const card = item.querySelector('.services-item__card');
    const tag = item.querySelector('.services-item__tag');
    let hoverTl = null;

    item.addEventListener('mouseenter', () => {
      servicesList.classList.add('is-hovering');
      item.classList.add('is-active');

      if (activeService && activeService !== item) {
        activeService.dispatchEvent(new Event('mouseleave'));
      }
      activeService = item;

      if (hoverTl) hoverTl.kill();
      hoverTl = gsap.timeline();

      hoverTl.to(card, {
        opacity: 1,
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.6,
        ease: 'power3.out',
      }, 0);

      hoverTl.to(card.querySelector('img'), {
        scale: 1.05,
        duration: 1.2,
        ease: 'power2.out',
      }, 0);

      hoverTl.fromTo(tag, {
        opacity: 0,
        x: -20,
      }, {
        opacity: 1,
        x: 0,
        duration: 0.4,
        ease: 'power2.out',
      }, 0.1);
    });

    item.addEventListener('mouseleave', () => {
      item.classList.remove('is-active');

      if (activeService === item) {
        activeService = null;
        servicesList.classList.remove('is-hovering');
      }

      if (hoverTl) hoverTl.kill();
      hoverTl = gsap.timeline();

      hoverTl.to(card, {
        clipPath: 'inset(0 100% 0 0)',
        duration: 0.4,
        ease: 'power3.in',
      }, 0);

      hoverTl.set(card, { opacity: 0 });

      hoverTl.to(card.querySelector('img'), {
        scale: 1,
        duration: 0.4,
        ease: 'power2.in',
      }, 0);

      hoverTl.to(tag, {
        opacity: 0,
        x: 10,
        duration: 0.3,
        ease: 'power2.in',
      }, 0);
    });
  });
}

// ===========================
// STACKING CARDS ON SCROLL
// ===========================
const projectCards = gsap.utils.toArray('.project-card');

// Sticky stacking effect on all devices
projectCards.forEach((card, index) => {
  if (index === projectCards.length - 1) return;

  gsap.to(card, {
    scale: 0.95,
    transformOrigin: 'top center',
    scrollTrigger: {
      trigger: card,
      start: 'top 10%',
      endTrigger: projectCards[index + 1],
      end: 'top 10%',
      scrub: true,
    }
  });
});

// Scroll-triggered section reveals
const aboutSec = document.querySelector('.about-section__text');
if (aboutSec) {
  gsap.from(aboutSec, {
    y: 80,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: aboutSec,
      start: 'top 80%',
      toggleActions: 'play none none none',
    }
  });
}

const servicesTitle = document.querySelector('.services-header__title');
if (servicesTitle) {
  gsap.from(servicesTitle, {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: servicesTitle,
      start: 'top 85%',
      toggleActions: 'play none none none',
    }
  });
}

// ===========================
// EXPLORE ARCHIVES 3D MARQUEE
// ===========================

const archivesMarquee = document.getElementById('archives-marquee');
if (archivesMarquee) {
  // Populate horizontal marquee text
  for (let i = 0; i < 10; i++) {
    const span = document.createElement('span');
    span.innerHTML = `EXPLORE THE ARCHIVES <span class="starburst">✺</span>`;
    archivesMarquee.appendChild(span);
  }

  // Animate horizontal marquee
  gsap.to(archivesMarquee, {
    xPercent: -50,
    ease: 'none',
    duration: 20,
    repeat: -1,
  });
}

const archivesGrid = document.getElementById('archives-3d-grid');
if (archivesGrid) {
  const images = [
    '/Images/work/work-1.png',
    '/Images/work/work-2.png',
    '/Images/work/work-3.png',
    '/Images/work/work-4.png',
    '/Images/work/work-5.png',
    '/Images/work/work-1.png',
    '/Images/work/work-2.png',
    '/Images/work/work-3.png',
    '/Images/work/work-4.png',
    '/Images/work/work-5.png',
    '/Images/work/work-1.png',
    '/Images/work/work-2.png'
  ];

  const cols = archivesGrid.querySelectorAll('.archives-col');
  const chunkSize = Math.ceil(images.length / 3);

  cols.forEach((col, index) => {
    const start = index * chunkSize;
    const colImages = images.slice(start, start + chunkSize);
    
    // Duplicate for infinite effect if we wanted to, but the CSS animation handles it via alternate
    colImages.forEach(src => {
      const card = document.createElement('div');
      card.className = 'archives-card';
      const img = document.createElement('img');
      img.src = src;
      img.onerror = () => { img.src = './service_art.png'; }; // Fallback
      card.appendChild(img);
      col.appendChild(card);
    });
  });
}

// ===========================
// FOOTER 3D HAND HOVER
// ===========================

const footerCta = document.getElementById('footer-cta');
const footerHand = document.getElementById('footer-hand');

if (footerCta && footerHand) {
  let isHoveringCta = false;
  
  footerCta.addEventListener('mouseenter', () => {
    isHoveringCta = true;
    gsap.to(footerHand, {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: 'back.out(1.5)',
    });
  });
  
  footerCta.addEventListener('mouseleave', () => {
    isHoveringCta = false;
    gsap.to(footerHand, {
      opacity: 0,
      scale: 0.5,
      duration: 0.3,
      ease: 'power2.in',
    });
  });
  
  footerCta.addEventListener('mousemove', (e) => {
    if (!isHoveringCta) return;
    
    // Calculate relative mouse position inside the footer-cta container
    const rect = footerCta.getBoundingClientRect();
    const relX = e.clientX - rect.left - (footerHand.offsetWidth / 2);
    const relY = e.clientY - rect.top - (footerHand.offsetHeight / 2);
    
    // Use gsap to tween to the mouse position for a smooth trailing effect
    gsap.to(footerHand, {
      x: relX,
      y: relY,
      duration: 0.6,
      ease: 'power3.out',
    });
  });
}

// ===========================
// ABOUT SECTION HOVER IMAGES
// ===========================
const aboutSection = document.getElementById('about-section');
const hoverReveals = document.querySelectorAll('.hover-reveal');
const aboutHoverContainer = document.querySelector('.about-hover-container');
const hoverImgs = document.querySelectorAll('.about-hover-img');

if (aboutSection && hoverReveals.length > 0 && aboutHoverContainer) {
  const xSetters = Array.from(hoverImgs).map(img => gsap.quickTo(img, "left", {duration: 0.5, ease: "power3"}));
  const ySetters = Array.from(hoverImgs).map(img => gsap.quickTo(img, "top", {duration: 0.5, ease: "power3"}));
  
  let isHoveringAbout = false;

  aboutSection.addEventListener('mousemove', (e) => {
    const rect = aboutSection.getBoundingClientRect();
    const clampedY = Math.max(rect.top, Math.min(e.clientY, rect.bottom));
    
    if (isHoveringAbout) {
      xSetters.forEach(setX => setX(e.clientX));
      ySetters.forEach(setY => setY(clampedY));
    }
  });

  aboutSection.addEventListener('mouseleave', () => {
    // Clean up images when the entire section is left
    isHoveringAbout = false;
    hoverImgs.forEach((img) => {
      gsap.to(img, {
        opacity: 0,
        scale: 0.5,
        duration: 0.3,
        ease: 'power2.in'
      });
    });
    gsap.delayedCall(0.3, () => {
      if (!isHoveringAbout) gsap.set(aboutHoverContainer, { visibility: 'hidden' });
    });
  });

  hoverReveals.forEach(el => {
    el.addEventListener('mouseenter', (e) => {
      isHoveringAbout = true;
      gsap.set(aboutHoverContainer, { visibility: 'visible' });
      
      const imgs = el.dataset.imgs.split(',');
      
      // Update image sources and animate them in
      hoverImgs.forEach((img, i) => {
        img.src = imgs[i] ? `./${imgs[i]}` : `./${imgs[0]}`;
        
        // Random rotations for the stacked effect
        const rotations = [-12, 6, 14];
        
        gsap.killTweensOf(img);
        
        // Jump image instantly to cursor position before animating
        gsap.set(img, { left: e.clientX, top: e.clientY });
        
        gsap.fromTo(img, 
          { 
            opacity: 0, 
            scale: 0.5, 
            rotation: 0 
          },
          { 
            opacity: 1, 
            scale: 1, 
            rotation: rotations[i],
            duration: 0.6, 
            delay: i * 0.05, 
            ease: 'back.out(1.5)' 
          }
        );
      });
    });
    
    el.addEventListener('mouseleave', () => {
      isHoveringAbout = false;
      hoverImgs.forEach((img) => {
        gsap.to(img, {
          opacity: 0,
          scale: 0.8,
          duration: 0.4,
          ease: 'power2.in'
        });
      });
      // Hide container after animation
      gsap.delayedCall(0.4, () => {
        if (!isHoveringAbout) gsap.set(aboutHoverContainer, { visibility: 'hidden' });
      });
    });
  });
}

// ===========================
// APPROACH SECTION
// ===========================
const approachSection = document.getElementById('approach-section');
if (approachSection) {
  // Interactive pills
  const pills = approachSection.querySelectorAll('.interest-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('active');
    });
  });
}

// ===========================
// BACK TO TOP
// ===========================
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    lenis.scrollTo(0, { duration: 1.5 });
  });
}

// ===========================
// BUTTON TEXT REVEAL HOVER
// ===========================
const buttons = document.querySelectorAll('.liquid-glass, .project-btn, .footer-pill, .back-to-top, .menu-footer__link');

buttons.forEach(btn => {
  btn.classList.add('reveal-btn');
  const content = btn.innerHTML;
  btn.innerHTML = '';
  
  const wrapper = document.createElement('span');
  wrapper.className = 'reveal-wrapper';
  
  const original = document.createElement('span');
  original.className = 'reveal-text';
  original.innerHTML = content;
  
  const clone = document.createElement('span');
  clone.className = 'reveal-text reveal-clone';
  clone.innerHTML = content;
  clone.setAttribute('aria-hidden', 'true'); // Accessibility
  
  wrapper.appendChild(original);
  wrapper.appendChild(clone);
  btn.appendChild(wrapper);
});

// ===========================
// AUTO-EXPAND TEXTAREA
// ===========================
const textareas = document.querySelectorAll('textarea');
textareas.forEach(textarea => {
  textarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });
});

// ===========================
// THEME TOGGLE
// ===========================
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-toggle-icon');
const themeText = document.getElementById('theme-toggle-text');
const heroVideo = document.getElementById('hero-video');
const preloaderThemeToggle = document.getElementById('preloader-theme-toggle');

const moonSVG = `<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path></svg>`;
const sunSVG = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

function applyTheme(isLight) {
  if (isLight) {
    document.documentElement.classList.add('light-mode');
    localStorage.setItem('theme', 'light');
    if (themeIcon) themeIcon.textContent = '🌙';
    if (themeText) themeText.textContent = 'NIGHT MODE';
    if (preloaderThemeToggle) preloaderThemeToggle.innerHTML = moonSVG;
    if (heroVideo && heroVideo.dataset.lightSrc) {
      heroVideo.src = heroVideo.dataset.lightSrc;
      heroVideo.play();
    }
  } else {
    document.documentElement.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark');
    if (themeIcon) themeIcon.textContent = '☀️';
    if (themeText) themeText.textContent = 'LIGHT MODE';
    if (preloaderThemeToggle) preloaderThemeToggle.innerHTML = sunSVG;
    if (heroVideo && heroVideo.dataset.darkSrc) {
      heroVideo.src = heroVideo.dataset.darkSrc;
      heroVideo.play();
    }
  }
}

// Initialize theme from localStorage
const currentTheme = localStorage.getItem('theme');
applyTheme(currentTheme === 'light');

function toggleTheme() {
  const isLight = !document.documentElement.classList.contains('light-mode');
  applyTheme(isLight);
}

if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}

if (preloaderThemeToggle) {
  preloaderThemeToggle.addEventListener('click', toggleTheme);
}

