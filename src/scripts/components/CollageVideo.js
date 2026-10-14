export default class CollageVideo {
  constructor(element) {
    this.element = element;
    this.videos = [...this.element.querySelectorAll('video')];
    this.maitre = this.videos[0];

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.videos.forEach((video) => video.pause());
      return;
    }

    this.maitre.addEventListener('timeupdate', () => this.synchroniser());
  }

  synchroniser() {
    const temps = this.maitre.currentTime;

    this.videos.slice(1).forEach((video) => {
      if (Math.abs(video.currentTime - temps) > 0.15) {
        video.currentTime = temps;
      }
    });
  }
}
