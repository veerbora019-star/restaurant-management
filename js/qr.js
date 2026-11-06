/**
 * SPICE GARDEN POS & RESTAURANT SAAS PLATFORM
 * QR Code Engine, Table Tent Card Generator & Print Exporter
 */

const QRModule = {
  // Pure JavaScript QR matrix generator (simulated vector matrix for crisp rendering)
  generateQRMatrix(text) {
    // Generate a deterministic 25x25 QR grid based on input hash
    const size = 25;
    const matrix = Array(size).fill(0).map(() => Array(size).fill(0));

    // Finder patterns (top-left, top-right, bottom-left)
    const drawFinder = (r, c) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
            matrix[r + i][c + j] = 1;
          }
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // Timing lines
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2 === 0 ? 1 : 0;
      matrix[i][6] = i % 2 === 0 ? 1 : 0;
    }

    // Seed data bits based on string hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }

    let bitIdx = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip finder zones
        const inTL = r < 8 && c < 8;
        const inTR = r < 8 && c >= size - 8;
        const inBL = r >= size - 8 && c < 8;
        const inTiming = r === 6 || c === 6;

        if (!inTL && !inTR && !inBL && !inTiming) {
          const bit = (Math.abs(hash ^ (r * 31 + c * 17 + bitIdx++))) % 3 !== 0 ? 1 : 0;
          matrix[r][c] = bit;
        }
      }
    }

    return matrix;
  },

  renderQRSVG(text, sizePx = 180, color = '#0f172a') {
    const matrix = this.generateQRMatrix(text);
    const n = matrix.length;
    const cell = sizePx / n;

    let rects = '';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (matrix[r][c] === 1) {
          rects += `<rect x="${(c * cell).toFixed(2)}" y="${(r * cell).toFixed(2)}" width="${(cell + 0.2).toFixed(2)}" height="${(cell + 0.2).toFixed(2)}" fill="${color}" />`;
        }
      }
    }

    return `
      <svg width="${sizePx}" height="${sizePx}" viewBox="0 0 ${sizePx} ${sizePx}" xmlns="http://www.w3.org/2000/svg" style="background:#fff; padding:8px; border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid var(--border-light);">
        ${rects}
      </svg>
    `;
  },

  getTableQRUrl(tableNumber, resId) {
    const rId = resId || appState.activeRestaurantId;
    const origin = window.location.origin || 'http://localhost:8080';
    const pathname = window.location.pathname || '/';
    return `${origin}${pathname}#order?res=${rId}&table=${tableNumber}`;
  },

  openTableQRModal(tableId) {
    const table = appState.tables.find(t => t.id === tableId);
    if (!table) return;

    const res = appState.getCurrentRestaurant();
    const qrUrl = this.getTableQRUrl(table.number, res.id);
    const modal = document.getElementById('tableQRModal');
    const body = document.getElementById('tableQRModalBody');
    if (!modal || !body) return;

    body.innerHTML = `
      <div id="tableTentPrintCard" class="table-tent-card">
        <div class="tent-header">
          <div style="font-size: 2.2rem; margin-bottom: 2px;">${res.logoEmoji || '🌿'}</div>
          <div class="tent-res-name">${res.name}</div>
          <div class="tent-res-tagline">${res.tagline}</div>
        </div>

        <div class="tent-instruction">
          <span style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--primary);">
            Scan to View Menu & Order
          </span>
        </div>

        <div class="tent-qr-box">
          ${this.renderQRSVG(qrUrl, 200, res.primaryColor || '#15803d')}
        </div>

        <div class="tent-table-pill">
          TABLE ${table.number}
        </div>

        <div class="tent-footer">
          <p style="font-size: 0.75rem; color: #64748b; font-weight: 500;">
            No App Download Required &bull; Fast Table Service
          </p>
          <div style="font-size: 0.65rem; color: #94a3b8; margin-top: 4px; word-break: break-all;">
            ${qrUrl}
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;">
        <button class="nav-btn" onclick="QRModule.testOpenCustomerQR('${table.number}')">
          🚀 Test Open Menu
        </button>
        <button class="nav-btn primary allow-print" onclick="window.print()">
          🖨️ Print Table Standee
        </button>
      </div>
    `;

    modal.classList.add('open');
  },

  testOpenCustomerQR(tableNumber) {
    this.closeModal();
    appState.setActiveTable(tableNumber);
    appState.setActiveRole('customer');
    App.switchView('customerMenuView');
    NotificationService.success(`Simulated QR Scan: Opened Table #${tableNumber} Customer Menu`);
  },

  closeModal() {
    const modal = document.getElementById('tableQRModal');
    if (modal) modal.classList.remove('open');
  }
};
