"use strict";

const SELECTORS = {
  hero: "[data-living-voice]",
  stage: "[data-voice-stage]",
  voiceCanvas: "[data-voice-canvas]",
  particleCanvas: "[data-particle-canvas]"
};

const SECTION_IDS = ["top", "about", "process", "cycle", "voices", "theme", "faq", "join"];

// --- Section cinema navigation (disabled) ---
// Wheel-driven section jumps with eased camera-style transitions.
// Re-enable by uncommenting SECTION_NAV, helpers below, and the desktop block in initSectionNavigation().
/*
const SECTION_NAV = {
  wheelThreshold: 180,
  wheelResetMs: 280,
  scrollDurationMs: 1080,
  lockBufferMs: 280,
  cooldownAfterNavMs: 720,
  maxWheelDelta: 42,
  minWheelDelta: 6,
  swipeThreshold: 58
};
*/

const MAX_PARTICLES = 80;

/**
 * Scroll-progress ranges for the hero. The order tells the story: the voice
 * travels to the horn, the ring draws itself around it, the bubble fills in,
 * the megaphone arrives along the same axis, and sound leaves through the mouth.
 */
const TIMELINE = {
  waveArrive: 0.44,
  ring: [0.44, 0.56],
  bubble: [0.52, 0.64],
  megaphone: [0.62, 0.72],
  arcs: [0.7, 0.78],
  waveExit: [0.76, 0.86],
  dotHide: [0.78, 0.86],
  center: [0.8, 0.92],
  nodes: [0.84, 0.94],
  statement: [0.9, 1]
};

// Logo viewBox coordinates of the two anchors the animation pivots around.
const LOGO_INLET = { x: 170, y: 454 };
const LOGO_MOUTH = { x: 472, y: 330 };

// SVG transform attributes have no transform-origin, so pivot by hand.
const scaleAbout = (origin, scale) =>
  `translate(${origin.x} ${origin.y}) scale(${scale.toFixed(4)}) translate(${-origin.x} ${-origin.y})`;

const CURSOR_SIZE = 28;
const CURSOR_HOTSPOT_X = (18 / 96) * CURSOR_SIZE;
const CURSOR_HOTSPOT_Y = (10 / 96) * CURSOR_SIZE;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const invLerp = (a, b, value) => clamp((value - a) / (b - a));
const smoothstep = (a, b, value) => {
  const t = invLerp(a, b, value);
  return t * t * (3 - 2 * t);
};

const MAX_TRAIL_POINTS = 16;
const TRAIL_POINT_INTERVAL = 4;
const MAX_TRAIL_LENGTH = 96;
const TRAIL_POSITION_SMOOTH = 0.42;
const TRAIL_VELOCITY_SMOOTH = 0.2;
const CURSOR_TRAIL_OFFSET_X = CURSOR_SIZE * 0.48 - CURSOR_HOTSPOT_X;
const CURSOR_TRAIL_OFFSET_Y = CURSOR_SIZE * 0.96 - CURSOR_HOTSPOT_Y;

const catmullRom = (p0, p1, p2, p3, t) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
  };
};

const sampleSmoothPath = (points, step = 5) => {
  if (points.length < 2) return [];
  const samples = [];

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const segmentLength = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const steps = Math.max(4, Math.ceil(segmentLength / step));
    const includeEnd = i === points.length - 2;

    for (let s = 0; s <= steps; s += 1) {
      if (!includeEnd && s === steps) continue;
      const t = s / steps;
      const point = catmullRom(p0, p1, p2, p3, t);
      samples.push({
        x: point.x,
        y: point.y,
        u: (i + t) / (points.length - 1),
        age: lerp(p1.age ?? 1, p2.age ?? 1, t)
      });
    }
  }

  return samples;
};

class PageCursorTrail {
  constructor() {
    this.canvas = document.querySelector("[data-cursor-trail]");
    this.cursor = document.querySelector("[data-page-cursor]");
    this.ctx = this.canvas?.getContext("2d");
    this.enabled =
      !window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.x = window.innerWidth * 0.5;
    this.y = window.innerHeight * 0.5;
    this.pointerX = this.x;
    this.pointerY = this.y;
    this.smoothX = this.x;
    this.smoothY = this.y;
    const startAnchor = this.getTrailAnchor(this.smoothX, this.smoothY);
    this.lastSampleX = startAnchor.x;
    this.lastSampleY = startAnchor.y;
    this.velocity = 0;
    this.velocityTarget = 0;
    this.trail = [];
    this.listeners = [];
    this.active = true;

    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.render = this.render.bind(this);
  }

  onMove(callback) {
    this.listeners.push(callback);
  }

  getTrailAnchor(x = this.smoothX, y = this.smoothY) {
    return {
      x: x + CURSOR_TRAIL_OFFSET_X,
      y: y + CURSOR_TRAIL_OFFSET_Y
    };
  }

  updateCursorPosition(x, y) {
    if (!this.cursor) return;
    this.cursor.style.transform = `translate3d(${x - CURSOR_HOTSPOT_X}px, ${y - CURSOR_HOTSPOT_Y}px, 0)`;
  }

  init() {
    if (!this.enabled || !this.canvas || !this.cursor || !this.ctx) return;

    document.body.classList.add("has-custom-cursor");
    this.resizeCanvas();
    window.addEventListener("pointermove", this.handlePointerMove, { passive: true });
    window.addEventListener("resize", this.handleResize, { passive: true });
    document.addEventListener("visibilitychange", () => {
      this.active = document.visibilityState === "visible";
    });
    this.cursor.classList.add("is-active");
    this.render();
  }

  handlePointerMove(event) {
    const prevX = this.pointerX;
    const prevY = this.pointerY;
    this.pointerX = event.clientX;
    this.pointerY = event.clientY;
    this.updateCursorPosition(this.pointerX, this.pointerY);

    const distance = Math.hypot(this.pointerX - prevX, this.pointerY - prevY);
    this.velocityTarget = clamp(distance / 28, 0, 1);

    this.listeners.forEach((callback) => {
      callback(this.pointerX, this.pointerY, this.velocityTarget);
    });
  }

  sampleTrailPoint() {
    const anchor = this.getTrailAnchor();
    const dx = anchor.x - this.lastSampleX;
    const dy = anchor.y - this.lastSampleY;
    const distance = Math.hypot(dx, dy);

    if (distance < TRAIL_POINT_INTERVAL) return;

    this.trail.unshift({
      x: anchor.x,
      y: anchor.y,
      age: 1
    });
    if (this.trail.length > MAX_TRAIL_POINTS) {
      this.trail.pop();
    }
    this.lastSampleX = anchor.x;
    this.lastSampleY = anchor.y;
  }

  handleResize() {
    this.resizeCanvas();
  }

  resizeCanvas() {
    if (!this.canvas || !this.ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
    this.canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  render() {
    requestAnimationFrame(this.render);
    if (!this.active) return;

    this.smoothX = lerp(this.smoothX, this.pointerX, TRAIL_POSITION_SMOOTH);
    this.smoothY = lerp(this.smoothY, this.pointerY, TRAIL_POSITION_SMOOTH);
    this.velocity = lerp(this.velocity, this.velocityTarget, TRAIL_VELOCITY_SMOOTH);

    this.sampleTrailPoint();

    this.trail.forEach((point) => {
      point.age -= 0.04 + this.velocity * 0.016;
    });
    this.trail = this.trail.filter((point) => point.age > 0.04);

    this.drawTrail();
  }

  drawTrail() {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);

    const anchor = this.getTrailAnchor();
    const path = [{ ...anchor, age: 1 }];
    let trailLength = 0;

    for (let i = 0; i < this.trail.length; i += 1) {
      const point = this.trail[i];
      const prev = path[path.length - 1];
      const segment = Math.hypot(point.x - prev.x, point.y - prev.y);
      if (trailLength + segment > MAX_TRAIL_LENGTH) break;
      path.push({ x: point.x, y: point.y, age: point.age });
      trailLength += segment;
    }

    if (path.length < 2) return;

    const samples = sampleSmoothPath(path, 4);
    if (samples.length < 2) return;

    const phase = performance.now() * 0.003;
    const amp = 4.5 + this.velocity * 10;

    const drawWaveLine = (offset, alpha, lineWidth, scale) => {
      ctx.beginPath();
      samples.forEach((point, index) => {
        const prev = samples[Math.max(0, index - 1)];
        const next = samples[Math.min(samples.length - 1, index + 1)];
        const angle = Math.atan2(next.y - prev.y, next.x - prev.x);
        const wave =
          Math.sin(point.u * Math.PI * 3.2 + phase + offset) *
          amp *
          scale;
        const px = point.x + Math.cos(angle + Math.PI / 2) * wave;
        const py = point.y + Math.sin(angle + Math.PI / 2) * wave;

        if (index === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });

      const tailAlpha =
        samples.reduce((sum, point) => sum + point.age * (0.35 + 0.65 * point.u), 0) /
        samples.length;

      ctx.strokeStyle = `rgba(117, 82, 204, ${alpha * tailAlpha})`;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    };

    drawWaveLine(0.45, 0.1, 1.5, 0.55);
    drawWaveLine(0.2, 0.22, 2, 0.78);
    drawWaveLine(0, 0.58 + this.velocity * 0.18, 2.5, 1);
  }
}

class LivingVoiceHero {
  constructor(root) {
    this.root = root;
    this.stage = root.querySelector(SELECTORS.stage);
    this.voiceCanvas = root.querySelector(SELECTORS.voiceCanvas);
    this.particleCanvas = root.querySelector(SELECTORS.particleCanvas);
    this.voiceCtx = this.voiceCanvas?.getContext("2d");
    this.particleCtx = this.particleCanvas?.getContext("2d");

    this.dot = root.querySelector("[data-voice-dot]");
    this.terminal = root.querySelector("[data-voice-terminal]");
    this.terminalGlows = [...root.querySelectorAll(".voice-terminal__glow")];
    this.logoHalo = root.querySelector('[data-logo-part="halo"]');
    this.logoSvg = root.querySelector("[data-voice-logo]");
    this.ringSweeps = [...root.querySelectorAll("[data-ring-sweep]")];
    this.logoRing = root.querySelector('[data-logo-piece="ring"]');
    this.logoBubble = root.querySelector('[data-logo-piece="bubble"]');
    this.logoMegaphone = root.querySelector('[data-logo-piece="megaphone"]');
    this.logoArcs = root.querySelector('[data-logo-piece="arcs"]');
    this.anchors = {
      inlet: this.readLogoAnchor(root.querySelector("[data-wave-inlet]"), LOGO_INLET),
      mouth: this.readLogoAnchor(root.querySelector("[data-arc-origin]"), LOGO_MOUTH)
    };
    this.finalStatement = root.querySelector("[data-final-statement]");
    this.scrollProgress = root.querySelector("[data-scroll-progress]");
    this.cursorHint = root.querySelector("[data-cursor-hint]");
    this.parallaxLayers = [...root.querySelectorAll("[data-depth]")];
    this.heroNodes = [...root.querySelectorAll("[data-hero-node]")];

    this.pointer = {
      targetX: 0.5,
      targetY: 0.5,
      x: 0.5,
      y: 0.5,
      lastClientX: 0,
      lastClientY: 0,
      velocity: 0,
      targetVelocity: 0
    };

    this.parallax = {
      targetX: 0,
      targetY: 0,
      x: 0,
      y: 0
    };

    this.scroll = {
      progress: 0,
      target: 0
    };

    this.particles = [];
    this.active = true;
    this.soundEnabled = false;
    this.audioContext = null;
    this.masterGain = null;
    this.oscillators = [];
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    this.isMobile = window.matchMedia("(max-width: 640px)").matches;
    this.compactHero = window.matchMedia("(max-width: 900px)").matches;
    this.lastTouchTime = 0;

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handleStagePointerMove = this.handleStagePointerMove.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.render = this.render.bind(this);
  }

  init() {
    if (!this.stage || !this.voiceCanvas || !this.particleCanvas) return;

    this.resizeCanvases();
    this.handleScroll();
    this.bindEvents();
    this.observeVisibility();
    this.render();

    if (!this.coarsePointer && !this.reducedMotion) {
      window.setTimeout(() => this.cursorHint?.classList.add("is-visible"), 1200);
    }

    this.preflightAssets();
  }

  bindEvents() {
    this.stage.addEventListener("pointerdown", this.handlePointerDown);
    this.stage.addEventListener("pointermove", this.handleStagePointerMove, { passive: true });
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    window.addEventListener("resize", this.handleResize, { passive: true });
  }

  setPointerFromClient(clientX, clientY, velocity) {
    if (this.reducedMotion || !this.stage) return;

    const rect = this.stage.getBoundingClientRect();
    const inStage =
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom;

    if (!inStage) return;

    this.pointer.targetX = clamp((clientX - rect.left) / rect.width);
    this.pointer.targetY = clamp((clientY - rect.top) / rect.height);
    this.pointer.targetVelocity = velocity;
    this.pointer.lastClientX = clientX;
    this.pointer.lastClientY = clientY;

    const spawnChance = this.isMobile ? 0.82 : 0.78;
    if (velocity > 0.35 && Math.random() > spawnChance) {
      this.spawnParticle(clientX - rect.left, clientY - rect.top, 1);
    }

    this.cursorHint?.classList.remove("is-visible");
  }

  handleStagePointerMove(event) {
    if (this.reducedMotion || event.pointerType === "mouse") return;

    this.lastTouchTime = performance.now();
    this.setPointerFromClient(event.clientX, event.clientY, 0.62);
  }

  updatePointer(clientX, clientY, velocity) {
    if (this.coarsePointer || this.reducedMotion) return;
    this.setPointerFromClient(clientX, clientY, velocity);
  }

  observeVisibility() {
    const observer = new IntersectionObserver(
      ([entry]) => {
        this.active = entry.isIntersecting;
      },
      { threshold: 0.01 }
    );

    observer.observe(this.root);
  }

  handlePointerDown(event) {
    if (!this.reducedMotion && event.pointerType !== "mouse") {
      this.lastTouchTime = performance.now();
    }

    const rect = this.stage.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const count = this.isMobile ? 8 : 12;

    for (let i = 0; i < count; i += 1) {
      this.spawnParticle(x, y, 0.8 + Math.random() * 1.2);
    }

    this.spawnRipple(x, y);
  }

  handleScroll() {
    const rect = this.root.getBoundingClientRect();
    const travel = Math.max(1, this.root.offsetHeight - window.innerHeight);
    this.scroll.target = clamp(-rect.top / travel);

    if (this.scrollProgress) {
      this.scrollProgress.style.height = `${this.scroll.target * 100}%`;
    }
  }

  handleResize() {
    this.isMobile = window.matchMedia("(max-width: 640px)").matches;
    this.compactHero = window.matchMedia("(max-width: 900px)").matches;
    this.coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    this.resizeCanvases();
    this.handleScroll();
  }

  resizeCanvases() {
    const rect = this.stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    [this.voiceCanvas, this.particleCanvas].forEach((canvas) => {
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    });

    this.voiceCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.particleCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.width = rect.width;
    this.height = rect.height;
    this.cacheDotOrigin();
    this.cacheTerminalOrigin();
    this.cacheTerminalAlignOffset();
  }

  cacheTerminalAlignOffset() {
    if (!this.terminal || !this.stage) {
      this.terminalAlignOffsetX = 0;
      return;
    }

    const savedTransform = this.terminal.style.transform;
    const savedLeft = this.terminal.style.left;
    const savedRight = this.terminal.style.right;

    this.terminal.style.left = "";
    this.terminal.style.right = "";
    this.terminal.style.transform = "translateY(-50%)";

    const stageRect = this.stage.getBoundingClientRect();
    const termRect = this.terminal.getBoundingClientRect();
    const stageCenterX = stageRect.left + stageRect.width / 2;
    const termCenterX = termRect.left + termRect.width / 2;

    this.terminalAlignOffsetX = termCenterX - stageCenterX;
    this.terminal.style.transform = savedTransform;
    this.terminal.style.left = savedLeft;
    this.terminal.style.right = savedRight;
  }

  cacheDotOrigin() {
    if (!this.dot || !this.stage) {
      this.dotOrigin = { x: this.width * 0.12, y: this.height * 0.5, radius: 24 };
      return;
    }

    const stageRect = this.stage.getBoundingClientRect();
    const dotRect = this.dot.getBoundingClientRect();

    this.dotOrigin = {
      x: dotRect.left - stageRect.left + dotRect.width / 2,
      y: dotRect.top - stageRect.top + dotRect.height / 2,
      radius: dotRect.width / 2
    };
  }

  cacheTerminalOrigin() {
    if (!this.terminal || !this.stage) {
      this.terminalOrigin = {
        x: this.width * 0.68,
        y: this.height * 0.5,
        centerX: this.width * 0.82,
        centerY: this.height * 0.5
      };
      this.waveInletPoint = null;
      return;
    }

    const stageRect = this.stage.getBoundingClientRect();
    const termRect = this.terminal.getBoundingClientRect();

    this.terminalOrigin = {
      x: termRect.left - stageRect.left,
      y: termRect.top - stageRect.top + termRect.height / 2,
      centerX: termRect.left - stageRect.left + termRect.width / 2,
      centerY: termRect.top - stageRect.top + termRect.height / 2,
      width: termRect.width
    };

    this.waveInletPoint = this.anchorToStage(this.anchors.inlet, stageRect);
  }

  /**
   * Zero-radius circles in the logo SVG mark the megaphone handle and mouth.
   * They have no layout box, so map their viewBox coordinates through the SVG's
   * screen matrix instead — that stays exact at any terminal size.
   */
  readLogoAnchor(node, fallback) {
    if (!node) return fallback;

    const x = Number(node.getAttribute("cx"));
    const y = Number(node.getAttribute("cy"));

    return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : fallback;
  }

  anchorToStage(anchor, stageRect) {
    if (!anchor || !this.logoSvg || !this.stage) return null;

    const matrix = this.logoSvg.getScreenCTM();
    if (!matrix) return null;

    const point = new DOMPoint(anchor.x, anchor.y).matrixTransform(matrix);

    return {
      x: point.x - stageRect.left,
      y: point.y - stageRect.top
    };
  }

  render() {
    requestAnimationFrame(this.render);

    if (!this.active || this.reducedMotion) return;

    this.pointer.x = lerp(this.pointer.x, this.pointer.targetX, 0.075);
    this.pointer.y = lerp(this.pointer.y, this.pointer.targetY, 0.075);
    this.pointer.velocity = lerp(this.pointer.velocity, this.pointer.targetVelocity, 0.09);
    this.pointer.targetVelocity *= 0.92;
    this.scroll.progress = lerp(this.scroll.progress, this.scroll.target, 0.08);

    this.drawWave();
    this.drawParticles();
    this.updateVisualStages();
    this.updateParallax();
  }

  drawWave() {
    const ctx = this.voiceCtx;
    const width = this.width;
    const height = this.height;

    ctx.clearRect(0, 0, width, height);

    const progress = this.scroll.progress;
    const waveIn = smoothstep(0.08, 0.2, progress);
    // The wave lives until the megaphone has swallowed it (see TIMELINE.waveExit).
    const waveOut = 1 - smoothstep(TIMELINE.waveExit[0], TIMELINE.waveExit[1], progress);
    const wavePresence = waveIn * waveOut;
    if (wavePresence <= 0.01) return;

    const dotOrigin = this.dotOrigin || { x: width * 0.12, y: height * 0.5, radius: 24 };
    const terminal = this.terminalOrigin || {
      x: width * 0.68,
      centerX: width * 0.82,
      centerY: height * 0.5,
      width: width * 0.4
    };
    // Land the line on the megaphone handle so the voice visibly enters the horn.
    const inlet = this.waveInletPoint || {
      x: terminal.x + terminal.width * 0.24,
      y: terminal.centerY + terminal.width * 0.06
    };

    const startX = dotOrigin.x;
    const startY = dotOrigin.y + height * 0.04 * (this.pointer.y - 0.5);
    const waveReach = smoothstep(0.08, TIMELINE.waveArrive, progress);
    const endX = lerp(startX + 48, inlet.x, waveReach);
    const endY = lerp(startY, inlet.y, waveReach);

    // Once the horn exists the wave retracts into it rather than fading in place.
    const swallow = smoothstep(TIMELINE.waveExit[0], TIMELINE.waveExit[1], progress);
    const amplitudeBase = height * lerp(0.014, 0.105, smoothstep(0.08, 0.34, progress));
    const pointerAmp = height * 0.1 * this.pointer.velocity;
    const amplitude = (amplitudeBase + pointerAmp) * (1 - swallow);

    const frequency = lerp(2.2, 5.8, this.pointer.x);
    const phase = performance.now() * 0.0018;

    const drawLine = (offset, alpha, lineWidth, scale, hueShift = 0) => {
      ctx.beginPath();
      let pathStarted = false;

      for (let x = startX; x <= endX; x += 4) {
        const t = (x - startX) / Math.max(1, endX - startX);
        // Fade in off the dot, then flatten again right at the horn opening.
        const envelope = smoothstep(0, 0.12, t) * (1 - smoothstep(0.88, 1, t));
        const pointerInfluence = Math.exp(-Math.pow((t - this.pointer.x) * 3.5, 2));
        const localAmp = amplitude * envelope * (0.72 + pointerInfluence * 0.82);
        const axisY = lerp(startY, endY, smoothstep(0, 1, t));

        const y =
          axisY +
          Math.sin(t * Math.PI * 2 * frequency + phase + offset) * localAmp * scale +
          Math.sin(t * Math.PI * 2 * (frequency * 0.48) - phase * 0.7) * localAmp * 0.22;

        if (!pathStarted) {
          ctx.moveTo(x, axisY);
          pathStarted = true;
        }

        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = `rgba(${117 + hueShift}, ${82 + hueShift}, ${204}, ${alpha * wavePresence})`;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = `rgba(117, 82, 204, ${0.18 * wavePresence})`;
      ctx.shadowBlur = 16;
      ctx.stroke();
    };

    drawLine(0.6, 0.1, 2, 0.72, 10);
    drawLine(0.3, 0.22, 3, 0.86, 4);
    drawLine(0, 0.9, 5, 1, 0);

    ctx.shadowBlur = 0;
  }

  updateVisualStages() {
    const p = this.scroll.progress;

    const ringT = smoothstep(TIMELINE.ring[0], TIMELINE.ring[1], p);
    const bubbleT = smoothstep(TIMELINE.bubble[0], TIMELINE.bubble[1], p);
    const megaphoneT = smoothstep(TIMELINE.megaphone[0], TIMELINE.megaphone[1], p);
    const arcsT = smoothstep(TIMELINE.arcs[0], TIMELINE.arcs[1], p);
    const dotHideT = smoothstep(TIMELINE.dotHide[0], TIMELINE.dotHide[1], p);
    const centerT = smoothstep(TIMELINE.center[0], TIMELINE.center[1], p);

    this.updateOriginDot(dotHideT);
    this.updateTerminalCenter(centerT);

    this.updateRingSweep(ringT);

    // The bubble swells out of the point where the wave met the ring.
    if (this.logoBubble) {
      this.logoBubble.style.opacity = `${bubbleT}`;
      this.logoBubble.setAttribute("transform", scaleAbout(this.anchors.inlet, lerp(0.42, 1, bubbleT)));
    }

    // Horn arrives travelling the same direction the wave did.
    if (this.logoMegaphone) {
      this.logoMegaphone.style.opacity = `${megaphoneT}`;
      this.logoMegaphone.setAttribute(
        "transform",
        `translate(${lerp(-86, 0, megaphoneT).toFixed(2)} ${lerp(38, 0, megaphoneT).toFixed(2)})`
      );
    }

    // Logo's own arcs bloom outward from the mouth.
    if (this.logoArcs) {
      this.logoArcs.style.opacity = `${arcsT}`;
      this.logoArcs.setAttribute("transform", scaleAbout(this.anchors.mouth, lerp(0.6, 1, arcsT)));
    }

    const glowOpacity = Math.max(bubbleT * 0.85, arcsT * 0.9);
    this.terminalGlows.forEach((glow) => {
      glow.style.opacity = `${glowOpacity}`;
    });

    if (this.logoHalo) {
      this.animatePart(this.logoHalo, Math.max(bubbleT * 0.9, arcsT));
    }

    this.updateHeroNodes(p);

    const statementT = smoothstep(TIMELINE.statement[0], TIMELINE.statement[1], p);
    this.setOpacity(this.finalStatement, statementT);
    if (this.finalStatement) {
      const lift = this.compactHero ? 12 : 24;
      this.finalStatement.style.transform = `translate(-50%, ${lerp(lift, 0, statementT)}px)`;
    }
  }

  /**
   * Both halves of the ring are drawn at the same angular speed from the point
   * the wave strikes, so the short side reaches the tail before the long one.
   */
  updateRingSweep(t) {
    if (!this.ringSweeps.length) return;

    if (this.ringSpanMax === undefined) {
      this.ringSpanMax = this.ringSweeps.reduce(
        (max, path) => Math.max(max, Number(path.dataset.ringSweep) || 1),
        1
      );
    }

    this.ringSweeps.forEach((path) => {
      const span = Number(path.dataset.ringSweep) || this.ringSpanMax;
      const drawn = clamp(t * (this.ringSpanMax / span));
      path.style.strokeDashoffset = `${1 - drawn}`;
    });

    if (this.logoRing) {
      this.logoRing.style.opacity = t > 0.001 ? "1" : "0";
    }
  }

  updateOriginDot(hideT) {
    if (!this.dot) return;

    const visible = 1 - hideT;
    this.dot.style.opacity = `${visible}`;
    this.dot.style.visibility = visible < 0.02 ? "hidden" : "visible";

    if (visible <= 0.02) return;

    const pulse = 1 + Math.sin(performance.now() * 0.004) * 0.035;
    const scale = pulse * lerp(1, 0.72, hideT);
    this.dot.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  updateTerminalCenter(t) {
    if (!this.terminal) return;

    this.terminal.style.left = "";
    this.terminal.style.right = "";

    const offsetX = this.terminalAlignOffsetX ?? 0;
    const shiftX = -offsetX * t;
    this.terminal.style.transform = `translate(${shiftX.toFixed(2)}px, -50%)`;
  }

  updateHeroNodes(progress) {
    const fadeOut = 1 - smoothstep(0.96, 1, progress);

    this.heroNodes.forEach((node, index) => {
      const start = TIMELINE.nodes[0] + index * 0.025;
      const end = TIMELINE.nodes[1];
      const t = smoothstep(start, end, progress) * fadeOut;
      const lift = lerp(14, 0, t);
      const scale = lerp(0.86, 1, t);

      node.style.opacity = `${t}`;
      node.style.setProperty("--node-lift", `${lift}px`);
      node.style.setProperty("--node-scale", `${scale}`);
    });
  }

  animatePart(element, t) {
    const wrap = element.closest("[data-anim-wrap]");
    if (!wrap) return;

    const fromX = parseFloat(wrap.dataset.fromX || 0);
    const fromY = parseFloat(wrap.dataset.fromY || 28);
    const fromRotate = parseFloat(wrap.dataset.fromRotate || 0);
    const fromScale = parseFloat(wrap.dataset.fromScale || 1);

    const x = lerp(fromX, 0, t);
    const y = lerp(fromY, 0, t);
    const rotation = lerp(fromRotate, 0, t);
    const scale = lerp(fromScale, 1, t);

    wrap.style.opacity = "1";
    wrap.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`;
    element.style.opacity = `${t}`;
    element.style.filter = `blur(${lerp(7, 0, t)}px)`;
  }

  updateParallax() {
    if (this.reducedMotion) return;

    const offsetX = (this.pointer.x - 0.5) * 2;
    const offsetY = (this.pointer.y - 0.5) * 2;
    const depthScale = this.coarsePointer ? 0.55 : 1;

    this.parallax.targetX = offsetX;
    this.parallax.targetY = offsetY;
    this.parallax.x = lerp(this.parallax.x, this.parallax.targetX, 0.08);
    this.parallax.y = lerp(this.parallax.y, this.parallax.targetY, 0.08);

    this.parallaxLayers.forEach((element) => {
      const depth = Number(element.dataset.depth || 0.1);
      const x = this.parallax.x * depth * 40 * depthScale;
      const y = this.parallax.y * depth * 28 * depthScale;
      const centered = element.closest(".layer-wrap--full");

      if (centered) {
        element.style.transform = `translateY(-50%) translate3d(${x}px, ${y}px, 0)`;
      } else {
        element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    });
  }

  setOpacity(element, value) {
    if (element) element.style.opacity = `${clamp(value)}`;
  }

  spawnParticle(x, y, intensity = 1) {
    if (this.particles.length >= MAX_PARTICLES) return;

    const types = ["dot", "ring", "dash", "spark", "wave"];
    const type = types[Math.floor(Math.random() * types.length)];
    const angle = Math.random() * Math.PI * 2;
    const speed = (1.2 + Math.random() * 3.8) * intensity;

    this.particles.push({
      type,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.7,
      life: 1,
      decay: 0.012 + Math.random() * 0.018,
      size: 4 + Math.random() * 13 * intensity,
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.12
    });
  }

  spawnRipple(x, y) {
    if (this.particles.length >= MAX_PARTICLES) return;

    this.particles.push({
      type: "ripple",
      x,
      y,
      vx: 0,
      vy: 0,
      life: 1,
      decay: 0.025,
      size: 10,
      rotation: 0,
      rotationSpeed: 0
    });
  }

  drawParticles() {
    const ctx = this.particleCtx;
    ctx.clearRect(0, 0, this.width, this.height);

    this.particles = this.particles.filter((particle) => particle.life > 0);

    this.particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.985;
      particle.vy *= 0.985;
      particle.life -= particle.decay;
      particle.rotation += particle.rotationSpeed;

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.strokeStyle = `rgba(117, 82, 204, ${particle.life * 0.72})`;
      ctx.fillStyle = `rgba(117, 82, 204, ${particle.life * 0.55})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = `rgba(117, 82, 204, ${particle.life * 0.32})`;
      ctx.shadowBlur = 10;

      const size = particle.size;

      switch (particle.type) {
        case "dot":
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "ring":
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case "dash":
          ctx.beginPath();
          ctx.moveTo(-size * 0.6, 0);
          ctx.lineTo(size * 0.6, 0);
          ctx.lineCap = "round";
          ctx.stroke();
          break;
        case "spark":
          ctx.beginPath();
          ctx.moveTo(-size, 0);
          ctx.lineTo(size, 0);
          ctx.moveTo(0, -size);
          ctx.lineTo(0, size);
          ctx.stroke();
          break;
        case "wave":
          ctx.beginPath();
          for (let i = -10; i <= 10; i += 1) {
            const px = i * (size / 10);
            const py = Math.sin(i * 0.72) * size * 0.26;
            if (i === -10) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          break;
        case "ripple":
          ctx.beginPath();
          ctx.arc(0, 0, size + (1 - particle.life) * 70, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(117, 82, 204, ${particle.life * 0.45})`;
          ctx.stroke();
          break;
        default:
          break;
      }

      ctx.restore();
    });
  }

  async toggleAmbientSound(enabled) {
    this.soundEnabled = enabled;

    if (!enabled) {
      this.stopAmbientSound();
      return;
    }

    if (this.oscillators.length > 0) return;

    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.audioContext = new AudioContextClass();
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.028;
    this.masterGain.connect(this.audioContext.destination);

    [110, 164.81, 220].forEach((frequency, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.value = [0.5, 0.22, 0.12][index];
      oscillator.connect(gain);
      gain.connect(this.masterGain);
      oscillator.start();
      this.oscillators.push({ oscillator, gain });
    });
  }

  stopAmbientSound() {
    this.oscillators.forEach(({ oscillator, gain }) => {
      try {
        oscillator.stop();
      } catch {
        // Already stopped.
      }
      oscillator.disconnect();
      gain.disconnect();
    });
    this.oscillators = [];

    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }

    if (this.audioContext && this.audioContext.state === "running") {
      this.audioContext.suspend().catch(() => {});
    }
  }

  preflightAssets() {
    this.root.querySelectorAll("img").forEach((image) => {
      image.addEventListener(
        "error",
        () => {
          console.warn(`[Youth Speak] Missing asset: ${image.getAttribute("src")}`);
          image.hidden = true;
        },
        { once: true }
      );
    });
  }
}

function initHeader() {
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");

  const closeNav = () => {
    if (!nav?.classList.contains("is-open")) return;
    menuToggle?.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener(
    "scroll",
    () => {
      updateHeader();
      closeNav();
    },
    { passive: true }
  );

  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    nav?.classList.toggle("is-open", !open);
    document.body.style.overflow = open ? "" : "hidden";
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle?.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      document.body.style.overflow = "";
    });
  });
}

function initReveals() {
  const items = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    observer.observe(item);
  });
}

function initVoiceCloud() {
  const cloud = document.querySelector("[data-voice-cloud]");
  if (!cloud) return;

  const labels = [...cloud.querySelectorAll(".voice-label")];

  cloud.addEventListener("pointermove", (event) => {
    labels.forEach((label) => {
      const rect = label.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = centerX - event.clientX;
      const dy = centerY - event.clientY;
      const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const force = Math.max(0, 1 - distance / 220);
      const x = (dx / distance) * force * 14;
      const y = (dy / distance) * force * 10;
      label.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  });

  cloud.addEventListener("pointerleave", () => {
    labels.forEach((label) => {
      label.style.transform = "";
    });
  });
}

function initCycleOrbit() {
  const orbit = document.querySelector("[data-cycle-orbit]");
  if (!orbit || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  window.addEventListener(
    "scroll",
    () => {
      const rect = orbit.getBoundingClientRect();
      const viewportProgress = clamp(1 - rect.top / window.innerHeight, 0, 1.6);
      const ring = orbit.querySelector(".cycle-orbit__ring");
      if (ring) {
        ring.style.transform = `rotate(${viewportProgress * 42}deg)`;
      }
    },
    { passive: true }
  );
}

function initSoundToggle(hero) {
  const button = document.querySelector("[data-sound-toggle]");
  const label = document.querySelector("[data-sound-label]");
  if (!button || !hero) return;

  button.addEventListener("click", async () => {
    const enabled = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(enabled));
    if (label) {
      label.textContent = enabled ? "Ambient sound on" : "Add ambient sound";
    }
    await hero.toggleAmbientSound(enabled);
  });
}

function setCurrentYear() {
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
}

function getHeroScrollEnd() {
  const hero = document.querySelector(SELECTORS.hero);
  if (!hero) return 0;
  return Math.max(0, hero.offsetTop + hero.offsetHeight - window.innerHeight);
}

function getSectionScrollTop(index, { heroTarget = "end" } = {}) {
  if (index <= 0) {
    return heroTarget === "start" ? 0 : getHeroScrollEnd();
  }

  const section = document.getElementById(SECTION_IDS[index]);
  if (!section) return window.scrollY;

  const headerOffset =
    parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-height"), 10) || 0;

  return window.scrollY + section.getBoundingClientRect().top - headerOffset;
}

/*
function getActiveSectionIndex() {
  const heroEnd = getHeroScrollEnd();
  if (window.scrollY <= heroEnd + 2) return 0;

  const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-height"), 10) || 0;
  let index = 1;

  SECTION_IDS.slice(1).forEach((id, sectionIndex) => {
    const section = document.getElementById(id);
    if (!section) return;
    if (window.scrollY + headerOffset >= section.offsetTop - 24) {
      index = sectionIndex + 1;
    }
  });

  return index;
}

function easeInOutQuart(progress) {
  return progress < 0.5
    ? 8 * progress ** 4
    : 1 - ((-2 * progress + 2) ** 4) / 2;
}

function animateScrollTo(targetY, { duration = SECTION_NAV.scrollDurationMs, onComplete } = {}) {
  const startY = window.scrollY;
  const distance = targetY - startY;

  if (Math.abs(distance) < 2) {
    onComplete?.();
    return null;
  }

  const startTime = performance.now();
  let frameId = null;

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutQuart(progress));

    if (progress < 1) {
      frameId = requestAnimationFrame(step);
    } else {
      frameId = null;
      onComplete?.();
    }
  };

  frameId = requestAnimationFrame(step);

  return () => {
    if (frameId) cancelAnimationFrame(frameId);
  };
}

function scrollToSectionIndex(index, { heroTarget = "end", animate = true, onComplete } = {}) {
  const targetY = getSectionScrollTop(index, { heroTarget });

  if (!animate) {
    window.scrollTo({ top: targetY, left: 0, behavior: "instant" });
    onComplete?.();
    return null;
  }

  return animateScrollTo(targetY, { onComplete });
}
*/

function initSectionNavigation() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;

    const id = hash.slice(1);
    if (!SECTION_IDS.includes(id) && id !== "main-content") return;

    link.addEventListener("click", (event) => {
      event.preventDefault();

      const index = id === "main-content" || id === "top" ? 0 : SECTION_IDS.indexOf(id);
      if (index < 0) return;

      const targetY = getSectionScrollTop(index, {
        heroTarget: index === 0 && (id === "main-content" || id === "top") ? "start" : "end"
      });

      window.scrollTo({
        top: targetY,
        left: 0,
        behavior: reducedMotion ? "instant" : "smooth"
      });
    });
  });

  /*
  const useNativeMobileScroll = window.matchMedia("(max-width: 900px) and (pointer: coarse)").matches;

  if (useNativeMobileScroll) {
    bindSectionLinks(scrollToSectionNative);
    return;
  }

  let activeSectionIndex = getActiveSectionIndex();
  let isTransitioning = false;
  let cancelScrollAnimation = null;
  let wheelAccumulator = 0;
  let wheelResetTimer = null;
  let ignoreWheelUntil = 0;
  let lastWheelTime = 0;

  const releaseTransitionLock = () => {
    isTransitioning = false;
    wheelAccumulator = 0;
    lastWheelTime = 0;
    ignoreWheelUntil = performance.now() + SECTION_NAV.cooldownAfterNavMs;
  };

  const jumpToSectionIndex = (index, options = {}) => {
    if (isTransitioning) return;

    cancelScrollAnimation?.();
    isTransitioning = true;
    wheelAccumulator = 0;
    lastWheelTime = 0;
    ignoreWheelUntil = performance.now() + SECTION_NAV.scrollDurationMs + SECTION_NAV.lockBufferMs;

    const finish = () => {
      activeSectionIndex = index;
      window.setTimeout(releaseTransitionLock, SECTION_NAV.lockBufferMs);
    };

    if (reducedMotion) {
      scrollToSectionIndex(index, { ...options, animate: false, onComplete: finish });
      return;
    }

    cancelScrollAnimation = scrollToSectionIndex(index, {
      ...options,
      animate: true,
      onComplete: () => {
        cancelScrollAnimation = null;
        finish();
      }
    });
  };

  bindSectionLinks(jumpToSectionIndex);

  if (reducedMotion) return;

  window.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey) return;

      const heroEnd = getHeroScrollEnd();
      const y = window.scrollY;
      const scrollingDown = event.deltaY > 0;
      const scrollingUp = event.deltaY < 0;

      const inHeroScrollRange = y < heroEnd - 2;
      const atHeroEnd = y >= heroEnd - 2 && y <= heroEnd + 2;
      const inPostHero = y > heroEnd + 2;

      if (inHeroScrollRange) {
        activeSectionIndex = 0;
        return;
      }

      if (atHeroEnd && scrollingUp) return;

      const shouldSnap =
        (atHeroEnd && scrollingDown) ||
        (inPostHero && (scrollingDown || scrollingUp));

      if (!shouldSnap) return;

      event.preventDefault();

      const now = performance.now();
      if (isTransitioning || now < ignoreWheelUntil) {
        wheelAccumulator = 0;
        return;
      }

      if (Math.abs(event.deltaY) < SECTION_NAV.minWheelDelta) return;

      if (now - lastWheelTime > SECTION_NAV.wheelResetMs) {
        wheelAccumulator = 0;
      }
      lastWheelTime = now;

      window.clearTimeout(wheelResetTimer);
      wheelResetTimer = window.setTimeout(() => {
        wheelAccumulator = 0;
        lastWheelTime = 0;
      }, SECTION_NAV.wheelResetMs);

      const cappedDelta =
        Math.sign(event.deltaY) *
        Math.min(Math.abs(event.deltaY), SECTION_NAV.maxWheelDelta);

      wheelAccumulator += cappedDelta;

      if (Math.abs(wheelAccumulator) < SECTION_NAV.wheelThreshold) return;

      const nextIndex =
        wheelAccumulator > 0 ? activeSectionIndex + 1 : activeSectionIndex - 1;

      wheelAccumulator = 0;
      lastWheelTime = 0;
      window.clearTimeout(wheelResetTimer);

      if (nextIndex < 0 || nextIndex >= SECTION_IDS.length) return;

      jumpToSectionIndex(nextIndex, {
        heroTarget: nextIndex === 0 ? "end" : "start"
      });
    },
    { passive: false }
  );
  */
}

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initSectionNavigation();
  initReveals();
  initVoiceCloud();
  initCycleOrbit();
  setCurrentYear();

  const pageCursor = new PageCursorTrail();
  pageCursor.init();

  const root = document.querySelector(SELECTORS.hero);
  const hero = root ? new LivingVoiceHero(root) : null;
  hero?.init();
  pageCursor.onMove((clientX, clientY, velocity) => {
    hero?.updatePointer(clientX, clientY, velocity);
  });
  initSoundToggle(hero);
});
