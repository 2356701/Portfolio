import Matter from 'matter-js';

// ce code provient de https://codepen.io/akm2/pen/afabf
const LABELS = [
  { text: 'Montage vidéo', px: 84.3, py: 56.0, rot: -35 },
  { text: 'Gestion événementielle', px: 66.2, py: 58.9, rot: 2 },
  { text: 'Modélisation 3D', px: 79.4, py: 74.1, rot: 3 },
  { text: 'Batterie', px: 48.0, py: 74.1, rot: -3 },
  { text: 'Motion Graphic', px: 29.9, py: 78.4, rot: -35 },
  { text: 'Effets Visuels', px: 43.9, py: 91.4, rot: 2 },
  { text: 'Design Graphique', px: 63.5, py: 90.1, rot: -2 },
  { text: 'Sonorisation de scene', px: 86.4, py: 85.8, rot: -3 },
];

const MOBILE_LABELS = [
  { text: 'Montage vidéo', px: 30, py: 40, rot: -6 },
  { text: 'Gestion Événementielle', px: 70, py: 38, rot: 4 },
  { text: 'Modélisation 3D', px: 28, py: 64, rot: 5 },
  { text: 'Batterie', px: 70, py: 64, rot: -4 },
  { text: 'Motion Graphic', px: 50, py: 76, rot: 3 },
  { text: 'Effets Visuels', px: 29, py: 87, rot: -5 },
  { text: 'Design Graphique', px: 70, py: 87, rot: 4 },
  { text: 'Sonorisation de scene', px: 50, py: 96, rot: -2 },
];

const MOBILE_BREAKPOINT = 715;
const GRAVITE_MOBILE = 3;

export default class GravityInterests {
  constructor(element) {
    this.element = element;
    this.card = element.querySelector('[data-gravity-card]');
    this.hint = element.querySelector('[data-gravity-hint]');
    this.resetBtn = element.querySelector('[data-gravity-reset]');

    if (!this.card) {
      console.error(
        'GravityInterests : élément [data-gravity-card] introuvable',
      );
      return;
    }

    this.engine = Matter.Engine.create();
    this.engine.world.gravity.x = 0;
    this.engine.world.gravity.y = 0;

    this.pills = [];
    this.walls = [];
    this.triggered = false;
    this.lastScrollY = window.scrollY;
    this.inclinaison = null;

    this.onScroll = this.onScroll.bind(this);
    this.onReset = this.onReset.bind(this);
    this.onInclinaison = this.onInclinaison.bind(this);
    this.activerGyro = this.activerGyro.bind(this);
    this.tick = this.tick.bind(this);

    this.init();
  }

  cardSize() {
    const r = this.card.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }

  hautZoneLibre() {
    const carte = this.card.getBoundingClientRect();
    let bas = 0;
    this.card
      .querySelectorAll('.interets_entete, [data-gravity-reset]')
      .forEach((zone) => {
        bas = Math.max(bas, zone.getBoundingClientRect().bottom - carte.top);
      });
    return bas;
  }

  isMobile() {
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
  }

  buildWalls() {
    const { Bodies, Composite } = Matter;
    if (this.walls.length) Composite.remove(this.engine.world, this.walls);

    const s = this.cardSize();
    const T = 260;
    this.walls = [
      Bodies.rectangle(s.w / 2, s.h + T / 2, s.w * 3, T, { isStatic: true }),
      Bodies.rectangle(-T / 2, s.h / 2, T, s.h * 4, { isStatic: true }),
      Bodies.rectangle(s.w + T / 2, s.h / 2, T, s.h * 4, { isStatic: true }),
      Bodies.rectangle(s.w / 2, -T / 2, s.w * 3, T, { isStatic: true }),
    ];

    const carte = this.card.getBoundingClientRect();
    this.card
      .querySelectorAll('.interets_entete, [data-gravity-reset]')
      .forEach((zone) => {
        const r = zone.getBoundingClientRect();
        const x = r.left - carte.left + r.width / 2;
        const y = r.top - carte.top + r.height / 2;
        this.walls.push(
          Bodies.rectangle(x, y, r.width, r.height, { isStatic: true }),
        );
      });
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
    const labels = this.isMobile() ? MOBILE_LABELS : LABELS;

    labels.forEach((L) => {
      const el = document.createElement('span');
      el.className = 'interets_pastille';
      el.textContent = L.text;
      this.card.appendChild(el);

      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const cx = (s.w * L.px) / 100;
      let cy = (s.h * L.py) / 100;

      if (this.isMobile()) {
        const haut = this.hautZoneLibre() + 10;
        cy = haut + ((s.h - haut) * (L.py - 30)) / 70;
        cy = Math.min(Math.max(cy, haut + h / 2), s.h - h / 2);
      }
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
    this.buildWalls();
    this.engine.world.gravity.y = this.isMobile() ? GRAVITE_MOBILE : 0.35;
    this.pills.forEach((p) => Matter.Body.setStatic(p.body, false));

    if (this.hint) {
      this.hint.textContent =
        "La gravité est active — continue de scroller pour l'incliner";
    }
  }

  onScroll() {
    const cur = window.scrollY;
    const delta = cur - this.lastScrollY;
    this.lastScrollY = cur;

    this.tryTrigger();

    if (this.triggered) {
      const force = this.isMobile() ? 1.3 : 1;
      const tilt = Math.max(
        -0.25 * force,
        Math.min(0.25 * force, delta * 0.006 * force),
      );
      this.engine.world.gravity.x = Math.max(
        -0.3 * force,
        Math.min(0.3 * force, this.engine.world.gravity.x + tilt),
      );

      if (this.isMobile()) this.secouer(delta);
    }
  }

  secouer(delta) {
    const saut = Math.min(Math.abs(delta) * 0.03, 1.2);
    const glisse = Math.max(-1.5, Math.min(1.5, delta * 0.035));

    this.pills.forEach((p) => {
      const v = p.body.velocity;
      Matter.Body.setVelocity(p.body, {
        x: v.x + glisse,
        y: Math.max(v.y - saut, -2.5),
      });
    });
  }

  activerGyro() {
    const Mouvement = window.DeviceMotionEvent;
    if (!Mouvement) return;

    if (typeof Mouvement.requestPermission === 'function') {
      Mouvement.requestPermission()
        .then((reponse) => {
          if (reponse === 'granted') {
            window.addEventListener('devicemotion', this.onInclinaison);
          }
        })
        .catch(() => {});
    } else {
      window.addEventListener('devicemotion', this.onInclinaison);
    }
  }

  onInclinaison(e) {
    const a = e.accelerationIncludingGravity;
    if (!this.isMobile() || !a || a.x === null || a.y === null) {
      this.inclinaison = null;
      return;
    }

    const signe = this.ios ? -1 : 1;
    const x = (-signe * a.x) / 9.81;
    const y = (signe * a.y) / 9.81;

    this.inclinaison = {
      x: GRAVITE_MOBILE * Math.max(-1.5, Math.min(1.5, x * 1.5)),
      y: GRAVITE_MOBILE * Math.max(0.3, y),
    };
  }

  onReset() {
    this.triggered = false;
    this.engine.world.gravity.x = 0;
    this.engine.world.gravity.y = 0;
    this.buildPills();

    if (this.hint) {
      this.hint.textContent = 'Scroll jusqu’à la carte pour activer la gravité';
    }

    this.tryTrigger();
  }

  tick() {
    try {
      if (this.triggered && this.inclinaison) {
        this.engine.world.gravity.x = this.inclinaison.x;
        this.engine.world.gravity.y = this.inclinaison.y;
      } else if (this.triggered) {
        this.engine.world.gravity.x *= 0.85;
      }
      Matter.Engine.update(this.engine, 1000 / 60);
      this.clampVelocities();
      this.syncDOM();
    } catch (err) {
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

    ['mousewheel', 'DOMMouseScroll', 'wheel'].forEach((evt) => {
      mouse.element.removeEventListener(evt, mouse.mousewheel);
    });

    mouse.element.removeEventListener('touchstart', mouse.mousedown);
    mouse.element.removeEventListener('touchmove', mouse.mousemove);
    mouse.element.removeEventListener('touchend', mouse.mouseup);

    window.addEventListener('scroll', this.onScroll, { passive: true });

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', this.onReset);
    }

    this._wasMobile = this.isMobile();
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.buildWalls();
        if (this.isMobile() !== this._wasMobile) {
          this._wasMobile = this.isMobile();
          this.triggered = false;
          this.engine.world.gravity.x = 0;
          this.engine.world.gravity.y = 0;
          this.buildPills();
        }
      }, 150);
    });

    this.ios = typeof window.DeviceMotionEvent?.requestPermission === 'function';

    if (this.ios) {
      const demander = () => {
        this.card.removeEventListener('touchend', demander);
        this.card.removeEventListener('click', demander);
        this.activerGyro();
      };
      this.card.addEventListener('touchend', demander);
      this.card.addEventListener('click', demander);
    } else {
      this.activerGyro();
    }

    document.fonts.ready.then(() => {
      if (this.triggered) return;
      this.buildWalls();
      this.buildPills();
    });

    this.tick();
  }
}
