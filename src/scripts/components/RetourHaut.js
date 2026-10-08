import { ScrollSmoother } from 'gsap/ScrollSmoother';

export default class RetourHaut {
  constructor(element) {
    this.element = element;

    this.element.addEventListener('click', () => this.remonter());
    window.addEventListener('scroll', () => this.afficher(), { passive: true });
    this.afficher();
  }

  afficher() {
    const visible = window.scrollY > window.innerHeight * 0.6;
    this.element.classList.toggle('est-visible', visible);
  }

  remonter() {
    const smoother = ScrollSmoother.get();

    if (smoother) {
      smoother.scrollTo(0, true);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
