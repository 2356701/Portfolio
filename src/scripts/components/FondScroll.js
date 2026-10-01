export default class FondScroll {
  constructor(element) {
    this.element = element;
    this.sections = document.querySelectorAll('[data-fond]');

    window.addEventListener('scroll', () => this.changerFond());
    this.changerFond();
  }

  changerFond() {
    const milieu = window.innerHeight / 2;

    this.sections.forEach((section) => {
      const position = section.getBoundingClientRect();

      if (position.top < milieu && position.bottom > milieu) {
        const sombre = section.dataset.fond === 'sombre';
        document.body.classList.toggle('fond-sombre', sombre);
      }
    });
  }
}
