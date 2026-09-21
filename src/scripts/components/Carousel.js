import Swiper from 'swiper/bundle';

export default class Carousel {
  constructor(element) {
    this.element = element;
    this.options = {
      slidesPerView: 1,
      spaceBetween: 0,
      pagination: {
        el: this.element.querySelector('.swiper-pagination'),
        clickable: true,
      },
      navigation: {
        nextEl: this.element.querySelector('.swiper-button-prev'),
        prevEl: this.element.querySelector('.swiper-button-next'),
      },
    };
    this.init();
  }

  setOptions() {
    if ('breakpoints' in this.element.dataset) {
      this.options.breakpoints = {
        0: {
          slidesPerView: 1,
        },
        530: {
          slidesPerView: 1,
        },
        750: {
          slidesPerView: 1.5,
        },
        1000: {
          slidesPerView: 2,
        },
        1330: {
          slidesPerView: 2.5,
        },
        1331: {
          slidesPerView: 3,
        },
      };
      if ('space' in this.element.dataset) {
        this.options.spaceBetween = 30;
      }

      if ('split' in this.element.dataset) {
        this.options.breakpoints = {};
      }

      if ('autoplay' in this.element.dataset) {
        this.options.autoplay = {
          delay: 4000,
          pauseOnMouseEnter: true,
          disableOnInteraction: false,
        };
      }

      if ('loop' in this.element.dataset) {
        this.options.loop = true;
      } else {
        this.options.loop = false;
      }

      if ('slides' in this.element.dataset) {
        const slides = parseFloat(this.element.dataset.slides);
        this.options.slidesPerView = slides || this.options.slidesPerView;
      }
    }

    if ('split' in this.element.dataset) {
      this.options.breakpoints = {};
    }

    if ('autoplay' in this.element.dataset) {
      this.options.autoplay = {
        delay: 6000,
        pauseOnMouseEnter: true,
        disableOnInteraction: false,
      };
    }

    if ('loop' in this.element.dataset) {
      this.options.loop = true;
    } else {
      this.options.loop = false;
    }

    if ('slides' in this.element.dataset) {
      const slides = parseFloat(this.element.dataset.slides);
      this.options.slidesPerView = slides || this.options.slidesPerView;
    }
  }

  init() {
    this.setOptions();
    new Swiper(this.element, this.options);
    console.log('Je suis un carousel');
  }
}
