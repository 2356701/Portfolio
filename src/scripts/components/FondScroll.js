export default class FondScroll {
  constructor(element) {
    this.element = element;
    this.sections = document.querySelectorAll('[data-fond]');

    window.addEventListener('scroll', () => this.changerFond());
    this.changerFond();
  }

  changerFond() {
    const milieu = window.scrollY + window.innerHeight / 2;

    this.sections.forEach((section) => {
      const haut = section.offsetTop;
      const bas = haut + section.offsetHeight;

      if (haut < milieu && bas > milieu) {
        const sombre = section.dataset.fond === 'sombre';
        document.body.classList.toggle('fond-sombre', sombre);
      }
    });
  }
}
