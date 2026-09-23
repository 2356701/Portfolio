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
  }

  init() {
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  onScroll() {
    this.lastScrollPosition = this.scrollPosition;
    this.scrollPosition = document.scrollingElement.scrollTop;
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
    // Le bouton devient visuellement un X quand le menu est ouvert (voir
    // entete.scss) : on garde aria-expanded/aria-label synchronisés
    // pour les lecteurs d'écran.
    this.toggle.setAttribute('aria-expanded', String(isActive));
    this.toggle.setAttribute('aria-label', isActive ? 'Fermer le menu' : 'Ouvrir le menu');
  }
}
