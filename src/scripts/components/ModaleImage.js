import { gsap } from 'gsap';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

export default class ModaleImage {
  constructor(element) {
    this.element = element;
    this.image = this.element.querySelector('.modale-image_image');
    this.declencheurs = document.querySelectorAll('[data-modale-image]');
    this.dernierDeclencheur = null;

    this.declencheurs.forEach((declencheur) => {
      declencheur.addEventListener('click', () => this.ouvrir(declencheur));
    });

    this.element.querySelector('.modale-image_fermer').addEventListener('click', () => this.fermer());

    this.element.addEventListener('click', (event) => {
      if (event.target === this.element) this.fermer();
    });

    this.element.addEventListener('cancel', (event) => {
      event.preventDefault();
      this.fermer();
    });
  }

  ouvrir(declencheur) {
    const source = declencheur.querySelector('img');

    this.dernierDeclencheur = declencheur;
    this.image.src = source.currentSrc || source.src;
    this.image.alt = source.alt;

    this.element.showModal();
    ScrollSmoother.get()?.paused(true);

    gsap.fromTo(this.element, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
    gsap.fromTo(this.image, { scale: 0.92 }, { scale: 1, duration: 0.4, ease: 'power3.out' });
  }

  fermer() {
    if (!this.element.open) return;

    gsap.to(this.element, {
      autoAlpha: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        this.element.close();
        ScrollSmoother.get()?.paused(false);
        this.dernierDeclencheur?.focus();
      },
    });
  }
}
