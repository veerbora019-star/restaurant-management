/**
 * SPICE GARDEN POS & DIGITAL ORDERING SYSTEM
 * Notifications & Web Audio Sound System
 */

const NotificationService = {
  container: null,

  init() {
    if (!this.container) {
      let el = document.getElementById('toastContainer');
      if (!el) {
        el = document.createElement('div');
        el.id = 'toastContainer';
        el.className = 'toast-container';
        document.body.appendChild(el);
      }
      this.container = el;
    }
  },

  show(message, type = 'info', duration = 3500) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `
      <span style="font-size: 1.2rem; flex-shrink: 0;">${icon}</span>
      <div style="flex: 1; font-size: 0.88rem; font-weight: 500;">${message}</div>
      <button style="color: var(--text-subtle); padding: 2px 6px; font-size: 1rem;" onclick="this.parentElement.remove()">✕</button>
    `;

    this.container.appendChild(toast);

    // Animate entrance
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });
    } else {
      setTimeout(() => toast.classList.add('show'), 10);
    }

    // Sound effect
    if (type === 'success' || type === 'info') {
      this.playBeep(type === 'success' ? 880 : 587);
    } else if (type === 'error') {
      this.playErrorSound();
    }

    // Auto removal
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (typeof toast.remove === 'function') {
          toast.remove();
        } else if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 300);
    }, duration);
  },

  success(msg, duration) { this.show(msg, 'success', duration); },
  error(msg, duration) { this.show(msg, 'error', duration); },
  warning(msg, duration) { this.show(msg, 'warning', duration); },
  info(msg, duration) { this.show(msg, 'info', duration); },

  // Synthesized Web Audio API sound effects
  playBeep(freq = 600, type = 'sine', duration = 0.15) {
    const res = (typeof appState !== 'undefined' && appState.getCurrentRestaurant) ? appState.getCurrentRestaurant() : null;
    if (res && res.settings && res.settings.soundAlerts === false) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context might require user interaction first
    }
  },

  playKitchenOrderBell() {
    const res = (typeof appState !== 'undefined' && appState.getCurrentRestaurant) ? appState.getCurrentRestaurant() : null;
    if (res && res.settings && res.settings.soundAlerts === false) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      // High-pitched pleasant dual-chime: E5 (659Hz) -> A5 (880Hz)
      playTone(659.25, 0, 0.25);
      playTone(880, 0.15, 0.4);
    } catch (e) {}
  },

  playErrorSound() {
    const res = (typeof appState !== 'undefined' && appState.getCurrentRestaurant) ? appState.getCurrentRestaurant() : null;
    if (res && res.settings && res.settings.soundAlerts === false) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }
};
