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
    this.initReseaux();
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

  initReseaux() {
    this.reseaux = this.element.querySelector('.entete_reseaux');
    this.reseauxBouton = this.element.querySelector('.entete_reseaux-bouton');
    this.reseauxIcones = this.element.querySelectorAll('.entete_reseaux-liste li');
    this.reseauxOuvert = false;

    this.reseaux.addEventListener('mouseenter', () => this.ouvrirReseaux());
    this.reseaux.addEventListener('mouseleave', () => this.fermerReseaux());
    this.reseauxBouton.addEventListener('click', () => this.ouvrirReseaux());

    document.addEventListener('click', (e) => {
      if (!this.reseaux.contains(e.target)) this.fermerReseaux();
    });
  }

  ouvrirReseaux() {
    if (this.reseauxOuvert) return;
    this.reseauxOuvert = true;
    this.reseauxBouton.setAttribute('aria-expanded', 'true');

    gsap.to(this.reseauxBouton, { opacity: 0, pointerEvents: 'none', duration: 0.15 });
    gsap.to(this.reseaux, { width: 'auto', duration: 0.5, ease: 'back.out(1.4)' });
    gsap.fromTo(
      this.reseauxIcones,
      { autoAlpha: 0, scale: 0.5, y: 10 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(2)', stagger: 0.07, delay: 0.1 }
    );
  }

  fermerReseaux() {
    if (!this.reseauxOuvert) return;
    this.reseauxOuvert = false;
    this.reseauxBouton.setAttribute('aria-expanded', 'false');

    gsap.to(this.reseauxIcones, { autoAlpha: 0, duration: 0.15 });
    gsap.to(this.reseauxBouton, { opacity: 1, pointerEvents: 'auto', duration: 0.2, delay: 0.2 });
    gsap.to(this.reseaux, {
      width: this.reseaux.offsetHeight,
      duration: 0.4,
      ease: 'power3.out',
      onComplete: () => {
        this.reseaux.style.width = '';
      },
    });
  }

  initLogo() {
    const logo = this.element.querySelector('.entete_logo');

    logo.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (this.html.classList.contains('menu-ouvert')) {
        this.onToggleNav();
      }
    });
  }
}
