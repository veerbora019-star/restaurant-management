/**
 * SPICE GARDEN POS & DIGITAL ORDERING SYSTEM
 * StorageService — Safe localStorage abstraction with fallback and export/import
 */

const StorageService = {
  PREFIX: 'SG_',

  get(key, fallback = null) {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      if (item === null || item === undefined) return fallback;
      return JSON.parse(item);
    } catch (e) {
      console.warn(`[StorageService] Error reading key "${key}":`, e);
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[StorageService] Error writing key "${key}":`, e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(this.PREFIX + key);
      return true;
    } catch (e) {
      console.error(`[StorageService] Error removing key "${key}":`, e);
      return false;
    }
  },

  clearAll() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      return true;
    } catch (e) {
      console.error('[StorageService] Error clearing keys:', e);
      return false;
    }
  },

  exportBackup() {
    const backup = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(this.PREFIX)) {
        backup[k] = localStorage.getItem(k);
      }
    }
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      Object.keys(data).forEach(k => {
        if (k.startsWith(this.PREFIX)) {
          localStorage.setItem(k, data[k]);
        }
      });
      return true;
    } catch (e) {
      console.error('[StorageService] Invalid backup JSON:', e);
      return false;
    }
  }
};
