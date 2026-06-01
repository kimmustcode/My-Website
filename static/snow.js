/**
 * snow.js — performant canvas snowfall
 * Usage: import and call initSnow(canvas) or drop this script in your page
 * and it will auto-attach to #snow-canvas, or create a fullscreen canvas.
 *
 * Optimizations:
 *  - Float32Array for all particle data (no GC pressure)
 *  - Single fillRect background clear per frame
 *  - Batched arc draws per opacity tier
 *  - requestAnimationFrame with delta-time capping
 */

(function () {
  // ─── CONFIG ──────────────────────────────────────────────────────────────
  const CONFIG = {
    count: 350,          // number of flakes
    minRadius: 0.8,
    maxRadius: 3.2,
    minSpeed: 40,        // px/sec
    maxSpeed: 120,
    wind: 15,            // px/sec horizontal drift
    windVariance: 8,     // per-flake wind jitter
    sway: 0.4,           // sinusoidal horizontal sway amplitude
    swaySpeed: 0.6,      // sway frequency multiplier
    opacity: [0.4, 0.7, 1.0],  // depth tiers
    bgColor: "#000000",
    flakeColor: "255,255,255",
  };

  // ─── PARTICLE LAYOUT (Float32Array columns) ───────────────────────────
  // 0:x  1:y  2:r(radius)  3:vy  4:vx  5:phase  6:tier
  const COLS = 7;

  function initSnow(canvas) {
    const ctx = canvas.getContext("2d");
    let W, H;
    const data = new Float32Array(CONFIG.count * COLS);

    function resize() {
      W = canvas.width = canvas.offsetWidth || window.innerWidth;
      H = canvas.height = canvas.offsetHeight || window.innerHeight;
    }

    function spawnFlake(i, fromTop) {
      const base = i * COLS;
      const tier = (Math.random() * CONFIG.opacity.length) | 0;
      data[base + 0] = Math.random() * W;
      data[base + 1] = fromTop ? -10 : Math.random() * H;
      data[base + 2] = CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius);
      data[base + 3] = CONFIG.minSpeed + Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed);
      data[base + 4] = CONFIG.wind + (Math.random() - 0.5) * CONFIG.windVariance * 2;
      data[base + 5] = Math.random() * Math.PI * 2; // sway phase
      data[base + 6] = tier;
    }

    function init() {
      resize();
      for (let i = 0; i < CONFIG.count; i++) spawnFlake(i, false);
    }

    let last = 0;
    function frame(ts) {
      const dt = Math.min((ts - last) / 1000, 0.05); // cap at 50ms
      last = ts;

      // Background
      ctx.fillStyle = CONFIG.bgColor;
      ctx.fillRect(0, 0, W, H);

      // Update + draw — batch by opacity tier to minimize state changes
      const tiers = CONFIG.opacity.length;
      for (let t = 0; t < tiers; t++) {
        ctx.globalAlpha = CONFIG.opacity[t];
        ctx.fillStyle = `rgb(${CONFIG.flakeColor})`;
        ctx.beginPath();

        for (let i = 0; i < CONFIG.count; i++) {
          const base = i * COLS;
          if (data[base + 6] !== t) continue;

          // Update position
          data[base + 5] += dt * CONFIG.swaySpeed;
          data[base + 0] += data[base + 4] * dt + Math.sin(data[base + 5]) * CONFIG.sway;
          data[base + 1] += data[base + 3] * dt;

          // Respawn if off-screen
          if (data[base + 1] > H + 10) spawnFlake(i, true);

          // Draw
          ctx.moveTo(data[base + 0] + data[base + 2], data[base + 1]);
          ctx.arc(data[base + 0], data[base + 1], data[base + 2], 0, 6.2832);
        }

        ctx.fill();
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize);
    init();
    requestAnimationFrame(frame);
  }

  // ─── AUTO-ATTACH ─────────────────────────────────────────────────────────
  window.initSnow = initSnow;

  document.addEventListener("DOMContentLoaded", () => {
    let canvas = document.getElementById("snow-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "snow-canvas";
      Object.assign(canvas.style, {
        position: "fixed",
        top: "0", left: "0",
        width: "100%", height: "100%",
        zIndex: "-1",
        display: "block",
      });
      document.body.prepend(canvas);
    }
    initSnow(canvas);
  });
})();
