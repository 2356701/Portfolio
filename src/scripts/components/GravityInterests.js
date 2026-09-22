import Matter from 'matter-js';

/*
 * Pastilles "Ce qui m'anime" : simulation physique Matter.js, adaptée du
 * prototype de Nat (gravity-matterjs_2.html). Les pastilles sont statiques
 * jusqu'à ce que la carte entre dans le viewport (scroll), puis tombent et
 * s'inclinent selon le sens/la vitesse du scroll. Attrapables à la souris.
 */
const LABELS = [
  { text: 'Montage vidéo', px: 84.3, py: 56.0, rot: -35 },
  { text: 'Web Design', px: 66.2, py: 58.9, rot: 2 },
  { text: 'UI / UX', px: 62.9, py: 74.5, rot: -2 },
  { text: 'Modélisation 3D', px: 79.4, py: 74.1, rot: 3 },
  { text: 'Batterie', px: 48.0, py: 74.1, rot: -3 },
  { text: 'Motion Graphic', px: 29.9, py: 78.4, rot: -35 },
  { text: 'Visual Effect', px: 43.9, py: 91.4, rot: 2 },
  { text: 'Graphic Design', px: 63.5, py: 90.1, rot: -2 },
  { text: 'Sonorisation de scene', px: 86.4, py: 85.8, rot: -3 },
];

export default class GravityInterests {
  constructor(element) {
    this.element = element;
    this.card = element.querySelector('[data-gravity-card]');
    this.hint = element.querySelector('[data-gravity-hint]');
    this.resetBtn = element.querySelector('[data-gravity-reset]');

    if (!this.card) {
      console.error('GravityInterests : élément [data-gravity-card] introuvable');
      return;
    }

    this.engine = Matter.Engine.create();
    this.engine.world.gravity.x = 0;
    this.engine.world.gravity.y = 0;

    this.pills = [];
    this.walls = [];
    this.triggered = false;
    this.lastScrollY = window.scrollY;

    this.onScroll = this.onScroll.bind(this);
    this.onReset = this.onReset.bind(this);
    this.tick = this.tick.bind(this);

    this.init();
  }

  cardSize() {
    const r = this.card.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }

  buildWalls() {
    const { Bodies, Composite } = Matter;
    if (this.walls.length) Composite.remove(this.engine.world, this.walls);

    const s = this.cardSize();
    // Murs épais (au lieu de 120px) pour éviter qu'une pastille lancée
    // rapidement à la souris ne les traverse (tunneling) et tombe pour de
    // bon hors du cadre. Le plafond est posé pile sur le bord visible du
    // haut de la carte (y = 0) : les bulles ne doivent jamais dépasser le
    // cadre rouge vers le haut, même lancées fort à la souris.
    const T = 260;
    this.walls = [
      Bodies.rectangle(s.w / 2, s.h + T / 2, s.w * 3, T, { isStatic: true }),
      Bodies.rectangle(-T / 2, s.h / 2, T, s.h * 4, { isStatic: true }),
      Bodies.rectangle(s.w + T / 2, s.h / 2, T, s.h * 4, { isStatic: true }),
      Bodies.rectangle(s.w / 2, -T / 2, s.w * 3, T, { isStatic: true }),
    ];
    Composite.add(this.engine.world, this.walls);
  }

  buildPills() {
    const { Bodies, Composite, Body } = Matter;

    this.pills.forEach((p) => {
      Composite.remove(this.engine.world, p.body);
      p.el.remove();
    });
    this.pills = [];

    const s = this.cardSize();

    LABELS.forEach((L) => {
      const el = document.createElement('span');
      el.className = 'interests__pill';
      el.textContent = L.text;
      this.card.appendChild(el);

      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const cx = (s.w * L.px) / 100;
      const cy = (s.h * L.py) / 100;
      const angle = (L.rot * Math.PI) / 180;

      const body = Bodies.rectangle(cx, cy, w, h, {
        chamfer: { radius: h / 2 },
        angle,
        restitution: 0.15,
        friction: 0.15,
        frictionAir: 0.015,
        density: 0.001,
      });
      Body.setStatic(body, true);

      Composite.add(this.engine.world, body);
      this.pills.push({ el, body, w, h });
    });

    this.syncDOM();
  }

  syncDOM() {
    this.pills.forEach((p) => {
      const b = p.body;
      const x = b.position.x - p.w / 2;
      const y = b.position.y - p.h / 2;
      p.el.style.transform = `translate(${x}px, ${y}px) rotate(${b.angle}rad)`;
    });
  }

  // Empêche une pastille lancée trop fort (glisser-déposer rapide) de
  // traverser un mur en un seul pas de simulation (tunneling) — c'est ce
  // qui la faisait parfois disparaître pour de bon.
  clampVelocities() {
    const { Body } = Matter;
    const MAX_SPEED = 28;

    this.pills.forEach((p) => {
      const v = p.body.velocity;
      const speed = Math.hypot(v.x, v.y);
      if (speed > MAX_SPEED) {
        const scale = MAX_SPEED / speed;
        Body.setVelocity(p.body, { x: v.x * scale, y: v.y * scale });
      }
    });
  }

  tryTrigger() {
    if (this.triggered) return;

    const r = this.card.getBoundingClientRect();
    const visible = r.top < window.innerHeight * 0.85 && r.bottom > 0;
    if (!visible) return;

    this.triggered = true;
    this.engine.world.gravity.y = 0.35;
    this.pills.forEach((p) => Matter.Body.setStatic(p.body, false));

    if (this.hint) {
      this.hint.textContent = "La gravité est active — continue de scroller pour l'incliner";
    }
  }

  onScroll() {
    const cur = window.scrollY;
    const delta = cur - this.lastScrollY;
    this.lastScrollY = cur;

    this.tryTrigger();

    if (this.triggered) {
      // Effet très atténué : au départ, le tilt réagissait presque 1:1 au
      // scroll et faisait valser les bulles violemment. On réduit fortement
      // la sensibilité et l'amplitude max.
      const tilt = Math.max(-0.25, Math.min(0.25, delta * 0.006));
      this.engine.world.gravity.x = Math.max(
        -0.3,
        Math.min(0.3, this.engine.world.gravity.x + tilt)
      );
    }
  }

  onReset() {
    this.triggered = false;
    this.engine.world.gravity.x = 0;
    this.engine.world.gravity.y = 0;
    this.buildPills();

    if (this.hint) {
      this.hint.textContent = 'Scroll jusqu’à la carte pour activer la gravité';
    }

    // La carte est forcément visible pour qu'on puisse cliquer sur ce
    // bouton : on réactive la gravité tout de suite plutôt que d'attendre
    // un prochain scroll qui pourrait ne jamais arriver (ex. l'utilisateur
    // reste immobile après avoir cliqué) — c'est ce qui donnait
    // l'impression que la gravité restait cassée après un reset.
    this.tryTrigger();
  }

  tick() {
    try {
      // Retour au neutre plus rapide (0.85 au lieu de 0.94) pour que
      // l'inclinaison retombe vite plutôt que de traîner après un scroll.
      if (this.triggered) this.engine.world.gravity.x *= 0.85;
      Matter.Engine.update(this.engine, 1000 / 60);
      this.clampVelocities();
      this.syncDOM();
    } catch (err) {
      // On ne laisse jamais une erreur ponctuelle arrêter la boucle
      // d'animation pour de bon (elle continuait de s'exécuter mais un
      // throw ici tuait silencieusement le prochain requestAnimationFrame).
      console.error('GravityInterests: erreur dans la boucle d’animation', err);
    }

    requestAnimationFrame(this.tick);
  }

  init() {
    const { Mouse, MouseConstraint, Composite } = Matter;

    this.buildWalls();
    this.buildPills();

    const mouse = Mouse.create(this.card);
    const mouseConstraint = MouseConstraint.create(this.engine, {
      mouse,
      constraint: { stiffness: 0.15, damping: 0.1, render: { visible: false } },
    });
    Composite.add(this.engine.world, mouseConstraint);

    // On laisse le scroll de la page fonctionner normalement au-dessus de
    // la carte (Matter capte sinon la molette pour le zoom du mouse constraint).
    ['mousewheel', 'DOMMouseScroll', 'wheel'].forEach((evt) => {
      mouse.element.removeEventListener(evt, mouse.mousewheel);
    });

    window.addEventListener('scroll', this.onScroll, { passive: true });

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', this.onReset);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.buildWalls(), 150);
    });

    this.tick();
  }
}
