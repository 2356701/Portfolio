import { gsap } from 'gsap';

gsap.defaults({ overwrite: 'auto' });

export default class Header {
  constructor(element) {
    this.element = element;
    this.scrollPosition = 0;
    this.lastScrollPosition = 0;
    this.html = document.documentElement;
    this.options = {
      threshold: parseFloat(this.html.dataset.threshold) || 0.1,
    };
    this.init();
    this.initNavMobile();
    this.initIndicateur();
    this.initBulles();
    this.initLogo();
  }

  init() {
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  onScroll() {
    this.lastScrollPosition = this.scrollPosition;
    this.scrollPosition = document.scrollingElement.scrollTop;
    this.html.classList.toggle('entete-compact', this.scrollPosition > 40);
    if (!this.html.dataset.alwayShow) {
      this.setHeaderState();
      this.setDirections();
    }
  }

  setHeaderState() {
    if (
      this.scrollPosition >
      document.scrollingElement.scrollHeight * this.options.threshold
    ) {
      this.html.classList.add('header-is-hidden');
    } else if (this.scrollPosition < this.lastScrollPosition) {
      this.html.classList.remove('header-is-hidden');
    }
  }

  setDirections() {
    if (this.scrollPosition >= this.lastScrollPosition) {
      this.html.classList.add('is-scrolling-down');
      this.html.classList.remove('is-scrolling-up');
    } else {
      this.html.classList.remove('is-scrolling-down');
      this.html.classList.add('is-scrolling-up');
    }
  }

  initNavMobile() {
    this.toggle = this.element.querySelector('.js-toggle');
    this.toggle.addEventListener('click', this.onToggleNav.bind(this));
  }

  onToggleNav() {
    const isActive = this.html.classList.toggle('menu-ouvert');
    this.toggle.setAttribute('aria-expanded', String(isActive));
    this.toggle.setAttribute('aria-label', isActive ? 'Fermer le menu' : 'Ouvrir le menu');
  }

  initIndicateur() {
    this.nav = this.element.querySelector('.entete_nav');
    this.indicateur = this.element.querySelector('.entete_indicateur');
    this.indicateurVisible = false;
    this.lienSurvole = null;

    const liens = this.element.querySelectorAll('.entete_lien');
    liens.forEach((lien) => {
      lien.addEventListener('mouseenter', () => this.montrerIndicateur(lien));
    });
    this.nav.addEventListener('mouseleave', () => this.cacherIndicateur());
  }

  montrerIndicateur(lien) {
    if (this.lienSurvole) this.lienSurvole.classList.remove('survol');
    lien.classList.add('survol');
    this.lienSurvole = lien;

    const x = lien.offsetLeft - 7;
    const largeur = lien.offsetWidth + 14;

    if (this.indicateurVisible) {
      gsap.to(this.indicateur, { x: x, width: largeur, duration: 0.45, ease: 'back.out(1.7)' });
    } else {
      gsap.set(this.indicateur, { x: x, width: largeur });
      gsap.to(this.indicateur, { autoAlpha: 1, duration: 0.2 });
      this.indicateurVisible = true;
    }
  }

  cacherIndicateur() {
    if (this.lienSurvole) this.lienSurvole.classList.remove('survol');
    this.lienSurvole = null;

    gsap.to(this.indicateur, { autoAlpha: 0, duration: 0.2 });
    this.indicateurVisible = false;
  }

  initBulles() {
    this.bulles = this.element.querySelectorAll('[data-extensible]');

    this.bulles.forEach((bulle) => {
      const bouton = bulle.querySelector('.entete_extensible-bouton');
      bulle.addEventListener('mouseenter', () => this.ouvrirBulle(bulle));
      bulle.addEventListener('mouseleave', () => this.fermerBulle(bulle));
      bouton.addEventListener('click', () => this.ouvrirBulle(bulle));
    });

    document.addEventListener('click', (e) => {
      this.bulles.forEach((bulle) => {
        if (!bulle.contains(e.target)) this.fermerBulle(bulle);
      });
    });
  }

  ouvrirBulle(bulle) {
    if (bulle.classList.contains('est-ouverte')) return;
    bulle.classList.add('est-ouverte');

    const bouton = bulle.querySelector('.entete_extensible-bouton');
    const elements = bulle.querySelectorAll('.entete_extensible-liste li');
    bouton.setAttribute('aria-expanded', 'true');

    gsap.to(bouton, { opacity: 0, pointerEvents: 'none', duration: 0.15 });
    gsap.to(bulle, { width: 'auto', duration: 0.5, ease: 'back.out(1.4)' });
    gsap.fromTo(
      elements,
      { autoAlpha: 0, scale: 0.5, y: 10 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(2)', stagger: 0.07, delay: 0.1 }
    );
  }

  fermerBulle(bulle) {
    if (!bulle.classList.contains('est-ouverte')) return;
    bulle.classList.remove('est-ouverte');

    const bouton = bulle.querySelector('.entete_extensible-bouton');
    const elements = bulle.querySelectorAll('.entete_extensible-liste li');
    bouton.setAttribute('aria-expanded', 'false');

    gsap.to(elements, { autoAlpha: 0, duration: 0.15 });
    gsap.to(bouton, { opacity: 1, pointerEvents: 'auto', duration: 0.2, delay: 0.2 });
    gsap.to(bulle, {
      width: bulle.offsetHeight,
      duration: 0.4,
      ease: 'power3.out',
      onComplete: () => {
        bulle.style.width = '';
      },
    });
  }

  initLogo() {
    const logo = this.element.querySelector('.entete_logo');

    logo.addEventListener('click', (e) => {
      const surPageAccueil = document.querySelector('#apropos');
      if (!surPageAccueil) return;

      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (this.html.classList.contains('menu-ouvert')) {
        this.onToggleNav();
      }
    });
  }
}
