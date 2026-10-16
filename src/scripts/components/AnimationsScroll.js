import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export default class AnimationsScroll {
  constructor(element) {
    this.element = element;
    this.init();
  }

  init() {
    // https://gsap.com/docs/v3/GSAP/gsap.matchMedia()
    const mm = gsap.matchMedia();

    mm.add({ desktop: '(min-width: 936px)', mobile: '(max-width: 935px)', bouge: '(prefers-reduced-motion: no-preference)' }, (context) => {
      if (!context.conditions.bouge) return;
      this.desktop = context.conditions.desktop;

      this.heros();
      this.titres();
      this.cartes();
      this.forces();
      this.textePropose();
      this.imagesEtapes();
      this.entetesEtapes();
      this.videoResultat();
    });

    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  heros() {
    const heros = this.element.querySelector('.heros');
    if (!heros) return;

    const photo = heros.querySelector('.heros_photo');
    const cadre = heros.querySelector('.heros_photo-cadre');
    const portrait = cadre.querySelector('img');
    const baguettes = heros.querySelector('.heros_baguettes');
    const ecouteurs = heros.querySelector('.heros_ecouteurs');
    const titre = heros.querySelector('.heros_titre');
    const legende = heros.querySelector('.heros_legende');
    const fleche = heros.querySelector('.heros_fleche-lien');

    gsap.set(portrait, { xPercent: -50, x: 0 });

    // https://gsap.com/docs/v3/GSAP/Timeline/
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' }, onComplete: () => this.herosApresIntro(heros) });

    const images = [...heros.querySelectorAll('img')].map((img) => img.decode().catch(() => {}));
    Promise.all(images).then(() => tl.play());

    // https://gsap.com/docs/v3/Eases/
    tl.from(photo, { scale: 0.4, y: 120, autoAlpha: 0, duration: 1.2, ease: 'elastic.out(1, 0.6)' })
      .from(portrait, { yPercent: 35, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.6)' }, '-=0.8')
      .from(baguettes, { x: -300, y: -150, rotation: '-=160', autoAlpha: 0, duration: 1, ease: 'back.out(1.4)' }, '-=0.6')
      .from(ecouteurs, { x: 300, y: -150, rotation: '+=120', autoAlpha: 0, duration: 1, ease: 'back.out(1.4)' }, '<0.1')
      .from(legende, { y: 20, autoAlpha: 0, duration: 0.5 }, '-=0.9')
      .from(titre, { y: 40, autoAlpha: 0, duration: 0.7 }, '<0.1')
      .from(fleche, { y: -20, autoAlpha: 0, duration: 0.5, ease: 'bounce.out' }, '-=0.2');

    window.addEventListener('pageshow', (e) => {
      if (e.persisted) tl.restart();
    });
  }

  herosApresIntro(heros) {
    if (this.introFinie) return;
    this.introFinie = true;

    const photo = heros.querySelector('.heros_photo');
    const cadre = heros.querySelector('.heros_photo-cadre');
    const baguettes = heros.querySelector('.heros_baguettes');
    const ecouteurs = heros.querySelector('.heros_ecouteurs');
    const imgBaguettes = baguettes.querySelector('img');
    const imgEcouteurs = ecouteurs.querySelector('img');

    // https://gsap.com/docs/v3/GSAP/gsap.quickTo()
    const calques = [
      { el: cadre, force: 12 },
      { el: imgBaguettes, force: 35 },
      { el: imgEcouteurs, force: -30 },
    ].map(({ el, force }) => ({
      force,
      x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3.out' }),
    }));

    if (!this.desktop) return;

    heros.addEventListener('mousemove', (e) => {
      const rx = e.clientX / window.innerWidth - 0.5;
      const ry = e.clientY / window.innerHeight - 0.5;
      calques.forEach((c) => {
        c.x(rx * c.force);
        c.y(ry * c.force);
      });
    });

    // https://gsap.com/docs/v3/Plugins/ScrollTrigger/ (scrub)
    const sortie = gsap.timeline({
      scrollTrigger: { trigger: heros, start: 'top top', end: 'bottom top', scrub: true },
    });
    sortie
      .to(photo, { scale: 0.75, ease: 'none' })
      .to(baguettes, { xPercent: -40, yPercent: -20, ease: 'none' }, 0)
      .to(ecouteurs, { xPercent: 40, yPercent: -20, ease: 'none' }, 0);
  }

  titres() {
    const titres = [...this.element.querySelectorAll('h2')].filter((titre) => !titre.closest('[data-scrolly]'));

    titres.forEach((titre) => {
      gsap.set(titre, { perspective: 600 });

      // https://gsap.com/docs/v3/Plugins/SplitText/
      SplitText.create(titre, {
        type: 'words, chars',
        autoSplit: true,
        onSplit: (split) =>
          // https://gsap.com/docs/v3/Plugins/ScrollTrigger/
          gsap.from(split.chars, {
            rotationX: -90,
            y: 30,
            autoAlpha: 0,
            transformOrigin: '50% 50% -20px',
            duration: 0.7,
            ease: 'back.out(2)',
            stagger: 0.025,
            scrollTrigger: { trigger: titre, start: 'top 85%', once: true },
          }),
      });
    });
  }

  cartes() {
    const groupes = ['.carte-outil', '.carte-projet', '.fiche-heros_roles li'];

    groupes.forEach((selecteur) => {
      const cartes = this.element.querySelectorAll(selecteur);
      if (!cartes.length) return;

      gsap.set(cartes, { autoAlpha: 0, y: 40 });

      // https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.batch()
      ScrollTrigger.batch(cartes, {
        start: 'top 90%',
        once: true,
        onEnter: (lot) =>
          // https://gsap.com/resources/getting-started/Staggers
          gsap.to(lot, {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.12,
            clearProps: 'transform',
          }),
      });
    });
  }

  forces() {
    this.element.querySelectorAll('.carte-force').forEach((carte, i) => {
      const numero = carte.querySelector('.carte-force_numero');
      const valeur = parseInt(numero.textContent, 10);
      const compteur = { n: 0 };

      const tl = gsap.timeline({ scrollTrigger: { trigger: carte, start: 'top 85%', once: true } });

      tl.from(carte, {
        x: (i % 2 ? 1 : -1) * (this.desktop ? 200 : 60),
        rotation: i % 2 ? 6 : -6,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'back.out(1.4)',
        clearProps: 'transform',
      })
        // https://gsap.com/docs/v3/GSAP/UtilityMethods/snap()
        .to(
          compteur,
          {
            n: valeur,
            duration: 0.8,
            ease: 'power1.out',
            snap: { n: 1 },
            onUpdate: () => (numero.textContent = String(compteur.n).padStart(2, '0')),
          },
          '-=0.5'
        );
    });
  }

  textePropose() {
    const texte = this.element.querySelector('.proposition_texte p');
    if (!texte) return;

    // https://gsap.com/docs/v3/Plugins/SplitText/
    SplitText.create(texte, {
      type: 'words',
      autoSplit: true,
      onSplit: (split) =>
        // https://gsap.com/docs/v3/Plugins/ScrollTrigger/ (scrub)
        gsap.from(split.words, {
          opacity: 0.15,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: texte, start: 'top 80%', end: 'bottom 45%', scrub: true },
        }),
    });
  }

  imagesEtapes() {
    this.element.querySelectorAll('.etape_media').forEach((media) => {
      const images = media.querySelectorAll('.etape_agrandir');

      // https://gsap.com/docs/v3/Plugins/ScrollTrigger/ (clip-path)
      gsap.fromTo(
        media,
        { clipPath: 'polygon(0% 0%, 0% 0%, -25% 100%, -25% 100%)' },
        {
          clipPath: 'polygon(0% 0%, 125% 0%, 100% 100%, -25% 100%)',
          duration: 1.1,
          ease: 'power3.inOut',
          clearProps: 'clipPath',
          scrollTrigger: { trigger: media, start: 'top 80%', once: true },
        }
      );

      // https://gsap.com/docs/v3/Plugins/ScrollTrigger/ (scrub)
      gsap.fromTo(
        images,
        { yPercent: -2.5, scale: 1.05 },
        {
          yPercent: 2.5,
          scale: 1.05,
          ease: 'none',
          scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    });
  }

  entetesEtapes() {
    this.element.querySelectorAll('.etape_entete').forEach((entete) => {
      const inverse = entete.closest('.etape_inverse');

      // https://gsap.com/docs/v3/GSAP/gsap.from()
      gsap.from(entete, {
        x: (inverse ? -1 : 1) * (this.desktop ? 80 : 30),
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: entete, start: 'top 85%', once: true },
      });
    });
  }

  videoResultat() {
    const video = this.element.querySelector('.fiche-resultat_video');
    if (!video) return;

    // https://gsap.com/docs/v3/Plugins/ScrollTrigger/ (scrub)
    gsap.fromTo(
      video,
      { clipPath: 'inset(8% 10% round 40px)' },
      {
        clipPath: 'inset(0% 0% round 40px)',
        ease: 'none',
        scrollTrigger: { trigger: video, start: 'top 90%', end: 'top 30%', scrub: true },
      }
    );
  }
}