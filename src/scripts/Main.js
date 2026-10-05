import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import ComponentFactory from './ComponentFactory';
import Icons from './utils/Icons';

class Main {
  constructor() {
    this.init();
  }

  init() {
    document.documentElement.classList.add('has-js');

    Icons.load();

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    gsap.defaults({ duration: 0.4, ease: 'back.out(1.7)', overwrite: 'auto' });
    this.smoother = ScrollSmoother.create({ smooth: 0.8 });

    new ComponentFactory();

    this.initAncres();
  }

  initAncres() {
    document.addEventListener('click', (e) => {
      const lien = e.target.closest('a[href*="#"]');
      if (!lien) return;

      const url = new URL(lien.href);
      const memePage = url.pathname.replace('index.html', '') === location.pathname.replace('index.html', '');
      const cible = url.hash && document.querySelector(url.hash);
      if (!memePage || !cible) return;

      e.preventDefault();
      this.smoother.scrollTo(cible, true, 'top top');
    });

    if (location.hash) {
      window.addEventListener('load', () => {
        this.smoother.scrollTo(location.hash, false, 'top top');
        history.replaceState(null, '', location.pathname);
      });
    }
  }
}
new Main();
