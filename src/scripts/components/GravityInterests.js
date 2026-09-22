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
    const T = 120;
    this.walls = [
      Bodies.rectangle(s.w / 2, s.h + T / 2, s.w * 3, T, { isStatic: true }),
      Bodies.rectangle(-T / 2, s.h / 2, T, s.h * 4, { isStatic: true }),
      Bodies.rectangle(s.w + T / 2, s.h / 2, T, s.h * 4, { isStatic: true }),
      Bodies.rectangle(s.w / 2, -s.h * 1.8, s.w * 3, T, { isStatic: true }),
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
      const tilt = Math.max(-1, Math.min(1, delta * 0.035));
      this.engine.world.gravity.x = Math.max(
        -1.2,
        Math.min(1.2, this.engine.world.gravity.x + tilt)
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
  }

  tick() {
    if (this.triggered) this.engine.world.gravity.x *= 0.94;
    Matter.Engine.update(this.engine, 1000 / 60);
    this.syncDOM();
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
