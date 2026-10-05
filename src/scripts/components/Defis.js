import { gsap } from 'gsap';

export default class Defis {
  constructor(element) {
    this.element = element;
    this.cartes = element.querySelectorAll('.carte-defi');
    this.solutions = element.querySelectorAll('.carte-solution');
    this.solutionEpinglee = null;
    this.solutionAffichee = null;
    this.survolPossible = window.matchMedia('(hover: hover) and (min-width: 1025px)');
    this.mobile = window.matchMedia('(width <= 715px)');

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
    const ancienne = this.solutionEpinglee;

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

    if (this.mobile.matches) {
      [ancienne, index].forEach((i) => {
        if (i === null) return;
        const contenu = this.cartes[i].querySelectorAll(
          '.carte-defi_titre, .carte-defi_texte, .carte-defi_solution'
        );
        gsap.fromTo(contenu, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0 });
      });
    }
  }

  afficher(index) {
    if (index === this.solutionAffichee) return;
    this.solutionAffichee = index;

    this.solutions.forEach((solution, i) => {
      if (i === index) {
        gsap.fromTo(
          solution,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0 }
        );
      } else {
        gsap.to(solution, { autoAlpha: 0, y: 20, duration: 0.2, ease: 'power1.out' });
      }
    });
  }
}
