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
    ScrollSmoother.create({ smooth: 0.8 });

    new ComponentFactory();
  }
}
new Main();
