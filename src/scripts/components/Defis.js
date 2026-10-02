import { gsap } from 'gsap';

export default class Defis {
  constructor(element) {
    this.element = element;
    this.cartes = element.querySelectorAll('.carte-defi');
    this.solutions = element.querySelectorAll('.carte-solution');
    this.solutionEpinglee = null;
    this.solutionAffichee = null;
    this.survolPossible = window.matchMedia('(hover: hover) and (min-width: 1025px)');

    this.cartes.forEach((carte, index) => {
      const bouton = carte.querySelector('.carte-defi_bouton');
      carte.addEventListener('mouseenter', () => {
        if (this.survolPossible.matches) this.afficher(index);
      });
      carte.addEventListener('mouseleave', () => {
        if (this.survolPossible.matches) this.afficher(this.solutionEpinglee);
      });
      bouton.addEventListener('click', () => this.epingler(index));
    });
  }

  epingler(index) {
    if (this.solutionEpinglee === index) {
      this.solutionEpinglee = null;
    } else {
      this.solutionEpinglee = index;
    }

    this.cartes.forEach((carte, i) => {
      const estEpinglee = i === this.solutionEpinglee;
      carte.classList.toggle('est-active', estEpinglee);
      carte.querySelector('.carte-defi_bouton').setAttribute('aria-expanded', String(estEpinglee));
    });

    this.afficher(this.solutionEpinglee);
  }

  afficher(index) {
    if (index === this.solutionAffichee) return;
    this.solutionAffichee = index;

    this.solutions.forEach((solution, i) => {
      if (i === index) {
        gsap.fromTo(
          solution,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }
        );
      } else {
        gsap.to(solution, { autoAlpha: 0, y: 20, duration: 0.25 });
      }
    });
  }
}
