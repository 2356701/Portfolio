export default class AvantApres {
  constructor(element) {
    this.element = element;
    this.vues = [...this.element.querySelectorAll('[data-vue]')];
    this.boutons = [...this.element.querySelectorAll('[data-bascule]')];

    this.boutons.forEach((bouton) => {
      bouton.addEventListener('click', () => this.afficher(bouton.dataset.bascule));
    });
  }

  afficher(nom) {
    this.vues.forEach((vue) => {
      vue.inert = vue.dataset.vue !== nom;
    });

    this.boutons.forEach((bouton) => {
      const actif = bouton.dataset.bascule === nom;
      bouton.classList.toggle('is-active', actif);
      bouton.setAttribute('aria-pressed', actif);
    });
  }
}