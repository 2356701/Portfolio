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
    if (!this.nav || !this.indicateur) return;

    this.liens = [...this.nav.querySelectorAll('.entete_lien')];
    this.lienCourant = null;

    this.liens.forEach((lien) => {
      lien.addEventListener('mouseenter', () => this.placerIndicateur(lien));
      lien.addEventListener('focus', () => this.placerIndicateur(lien));
    });
    this.nav.addEventListener('mouseleave', () => this.cacherIndicateur());
    this.nav.addEventListener('focusout', (e) => {
      if (!this.nav.contains(e.relatedTarget)) this.cacherIndicateur();
    });

    const recaler = () => {
      if (this.lienCourant) this.placerIndicateur(this.lienCourant, false);
    };
    window.addEventListener('resize', recaler);
    if ('ResizeObserver' in window) {
      new ResizeObserver(recaler).observe(this.nav);
    }
  }

  placerIndicateur(lien, anime = true) {
    if (!this.nav.classList.contains('a-indicateur')) anime = false;
    const marge = 7;
    const navRect = this.nav.getBoundingClientRect();
    const lienRect = lien.getBoundingClientRect();

    if (!anime) this.nav.classList.add('sans-transition');
    this.nav.style.setProperty('--ind-x', `${lienRect.left - navRect.left - marge}px`);
    this.nav.style.setProperty('--ind-w', `${lienRect.width + marge * 2}px`);
    this.nav.classList.add('a-indicateur');

    this.liens.forEach((l) => l.classList.toggle('sous-indicateur', l === lien));
    this.lienCourant = lien;

    if (!anime) {
      this.nav.getBoundingClientRect();
      this.nav.classList.remove('sans-transition');
    }
  }

  cacherIndicateur() {
    this.nav.classList.remove('a-indicateur');
    this.liens.forEach((l) => l.classList.remove('sous-indicateur'));
    this.lienCourant = null;
  }

  initReseaux() {
    this.reseaux = this.element.querySelector('[data-reseaux]');
    if (!this.reseaux) return;
    this.reseauxBouton = this.reseaux.querySelector('.entete_reseaux-bouton');

    this.reseauxBouton.addEventListener('click', () => {
      this.ouvrirReseaux(!this.reseaux.classList.contains('est-ouvert'));
    });

    this.reseaux.addEventListener('mouseenter', () => this.majAriaReseaux(true));
    this.reseaux.addEventListener('mouseleave', () =>
      this.majAriaReseaux(this.reseaux.classList.contains('est-ouvert'))
    );

    document.addEventListener('click', (e) => {
      if (!this.reseaux.contains(e.target)) this.ouvrirReseaux(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.reseaux.contains(document.activeElement)) {
        this.ouvrirReseaux(false);
        this.reseauxBouton.focus();
        this.reseauxBouton.blur();
      }
    });
  }

  ouvrirReseaux(ouvert) {
    this.reseaux.classList.toggle('est-ouvert', ouvert);
    this.majAriaReseaux(ouvert);
  }

  majAriaReseaux(ouvert) {
    this.reseauxBouton.setAttribute('aria-expanded', String(ouvert));
  }

  initLogo() {
    const logo = this.element.querySelector('.entete_logo');
    if (!logo) return;

    logo.addEventListener('click', (e) => {
      const cible = new URL(logo.href, window.location.href);
      const memePage = cible.pathname === window.location.pathname ||
        (cible.pathname.endsWith('/index.html') &&
          window.location.pathname === cible.pathname.replace(/index\.html$/, ''));
      if (!memePage) return;

      e.preventDefault();
      const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduit ? 'auto' : 'smooth' });

      if (this.html.classList.contains('menu-ouvert')) this.onToggleNav();
    });
  }
}
