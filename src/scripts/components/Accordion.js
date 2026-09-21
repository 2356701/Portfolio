export default class Accordion {
  constructor(element) {
    this.element = element;
    this.containers = this.element.querySelectorAll('.js-header');

    this.options = {
      notClosing: false,
      autoOpen: false,
      isActive: false,
    };

    this.init();
  }

  init() {
    this.setOptions();
    if (this.options.autoOpen) {
      this.autoOpen();
    }
    for (let i = 0; i < this.containers.length; i++) {
      const container = this.containers[i];
      container.addEventListener('click', this.onClick.bind(this));
    }
  }

  setOptions() {
    if ('notClosing' in this.element.dataset) {
      this.options.notClosing = true;
    }

    let autoOpenCount = 0;

    for (let i = 0; i < this.containers.length; i++) {
      const container = this.containers[i];
      if ('autoOpen' in container.dataset) {
        autoOpenCount++;
      }
    }

    if (autoOpenCount > 0) {
      this.options.autoOpen = true;
    }

    if (autoOpenCount > 1) {
      this.options.notClosing = true;
    }
  }

  onClick(event) {
    const click = event.currentTarget;

    if (!this.options.notClosing) {
      for (let i = 0; i < this.containers.length; i++) {
        const container = this.containers[i];
        if (container !== click) {
          container.classList.remove('is-active');
        }
      }
    }

    click.classList.toggle('is-active');
  }

  autoOpen() {
    for (let i = 0; i < this.containers.length; i++) {
      const container = this.containers[i];

      if ('autoOpen' in container.dataset) {
        container.classList.add('is-active');
      }
    }
  }
}
