/**
 * SPICE GARDEN POS & DIGITAL ORDERING SYSTEM
 * Admin Dashboard, KPI Metrics & Visual Analytics Charts
 */

const DashboardModule = {
  init() {
    this.renderKPIs();
    this.renderCharts();
    this.renderRecentOrders();

    appState.on('orders:updated', () => {
      this.renderKPIs();
      this.renderCharts();
      this.renderRecentOrders();
    });

    appState.on('tables:updated', () => {
      this.renderKPIs();
    });
  },

  renderKPIs() {
    const orders = appState.orders.filter(o => o.status !== 'cancelled' && o.status !== 'CANCELLED');
    const todayOrders = orders; // For prototype demo, consider all seed orders

    const totalSales = todayOrders.reduce((sum, o) => sum + (Number(o.total !== undefined ? o.total : (o.grandTotal || 0))), 0);
    const orderCount = todayOrders.length;
    const aov = orderCount > 0 ? Math.round(totalSales / orderCount) : 0;

    const tables = appState.tables;
    const occupiedCount = tables.filter(t => (t.status || '').toUpperCase() === 'OCCUPIED').length;
    const occupancyRate = tables.length > 0 ? Math.round((occupiedCount / tables.length) * 100) : 0;

    // Render KPI 1: Total Sales
    const salesEl = document.getElementById('kpiTotalSales');
    if (salesEl) salesEl.textContent = `₹${totalSales.toLocaleString('en-IN')}`;

    // Render KPI 2: Total Orders
    const countEl = document.getElementById('kpiTotalOrders');
    if (countEl) countEl.textContent = `${orderCount}`;

    // Render KPI 3: Average Order Value
    const aovEl = document.getElementById('kpiAOV');
    if (aovEl) aovEl.textContent = `₹${aov}`;

    // Render KPI 4: Table Occupancy
    const occEl = document.getElementById('kpiOccupancy');
    if (occEl) occEl.textContent = `${occupancyRate}% (${occupiedCount}/${tables.length})`;
  },

  renderCharts() {
    this.renderSalesTrendChart();
    this.renderTopDishesChart();
    this.renderCategoryShareChart();
  },

  renderSalesTrendChart() {
    const container = document.getElementById('salesTrendChartContainer');
    if (!container) return;

    // 7-day realistic data points
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const sales = [8450, 9200, 11400, 10800, 14500, 18900, 12650];
    const maxVal = Math.max(...sales) * 1.15;

    // Generate responsive SVG Bar Chart
    const barWidth = 28;
    const chartHeight = 160;
    const chartWidth = 340;
    const step = chartWidth / days.length;

    let barsSVG = '';
    days.forEach((day, i) => {
      const val = sales[i];
      const barH = (val / maxVal) * chartHeight;
      const x = i * step + (step - barWidth) / 2;
      const y = chartHeight - barH;

      barsSVG += `
        <g class="chart-bar-group">
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="4" fill="${i === 6 ? 'var(--primary)' : 'var(--primary-light)'}" stroke="${i === 6 ? 'var(--primary)' : 'var(--primary-border)'}" stroke-width="1.5">
            <title>${day}: ₹${val.toLocaleString()}</title>
          </rect>
          <text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--text-main)">₹${Math.round(val/1000)}k</text>
          <text x="${x + barWidth / 2}" y="${chartHeight + 16}" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text-muted)">${day}</text>
        </g>
      `;
    });

    container.innerHTML = `
      <svg width="100%" height="200" viewBox="0 0 ${chartWidth} ${chartHeight + 30}" style="overflow: visible;">
        <line x1="0" y1="${chartHeight}" x2="${chartWidth}" y2="${chartHeight}" stroke="var(--border-light)" stroke-width="1"/>
        ${barsSVG}
      </svg>
    `;
  },

  renderTopDishesChart() {
    const container = document.getElementById('topDishesChartContainer');
    if (!container) return;

    // Calculate dish frequency from state orders
    const dishSales = {};
    appState.orders.forEach(order => {
      (order.items || []).forEach(item => {
        const qty = item.quantity !== undefined ? item.quantity : (item.qty || 1);
        const price = Number(item.unit_price !== undefined ? item.unit_price : (item.price || 0));
        dishSales[item.name] = (dishSales[item.name] || 0) + (price * qty);
      });
    });

    // Default top items if dataset is small
    const topDishes = Object.keys(dishSales).map(name => ({
      name,
      revenue: dishSales[name]
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    if (topDishes.length === 0) {
      topDishes.push(
        { name: 'Paneer Butter Masala', revenue: 3640 },
        { name: 'Hyderabadi Veg Biryani', revenue: 2880 },
        { name: 'Dal Makhani Bukhara', revenue: 2520 },
        { name: 'Butter Garlic Naan', revenue: 1950 },
        { name: 'Alphonso Mango Lassi', revenue: 1485 }
      );
    }

    const maxRev = Math.max(...topDishes.map(d => d.revenue)) * 1.1;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${topDishes.map(dish => {
          const pct = Math.round((dish.revenue / maxRev) * 100);
          return `
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 600; margin-bottom: 3px;">
                <span>${dish.name}</span>
                <span style="color: var(--primary); font-weight: 800;">₹${dish.revenue.toLocaleString()}</span>
              </div>
              <div style="width: 100%; height: 8px; background: var(--bg-subtle); border-radius: 4px; overflow: hidden;">
                <div style="width: ${pct}%; height: 100%; background: var(--primary); border-radius: 4px; transition: width 0.6s var(--ease-smooth);"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderCategoryShareChart() {
    const container = document.getElementById('categoryShareChartContainer');
    if (!container) return;

    const shares = [
      { name: 'Main Course', percent: 38, color: '#15803d' },
      { name: 'Biryani & Rice', percent: 24, color: '#0284c7' },
      { name: 'Starters', percent: 18, color: '#f59e0b' },
      { name: 'Breads', percent: 12, color: '#8b5cf6' },
      { name: 'Drinks & Desserts', percent: 8, color: '#ec4899' }
    ];

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-around; flex-wrap: wrap; gap: 16px;">
        <!-- Clean SVG Donut Chart -->
        <svg width="140" height="140" viewBox="0 0 42 42" class="donut">
          <circle class="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="transparent"></circle>
          <circle class="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--bg-subtle)" stroke-width="5"></circle>
          
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#15803d" stroke-width="5" stroke-dasharray="38 62" stroke-dashoffset="25"></circle>
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#0284c7" stroke-width="5" stroke-dasharray="24 76" stroke-dashoffset="87"></circle>
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f59e0b" stroke-width="5" stroke-dasharray="18 82" stroke-dashoffset="63"></circle>
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#8b5cf6" stroke-width="5" stroke-dasharray="12 88" stroke-dashoffset="45"></circle>
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#ec4899" stroke-width="5" stroke-dasharray="8 92" stroke-dashoffset="33"></circle>
        </svg>

        <!-- Legend -->
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem;">
          ${shares.map(s => `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 10px; height: 10px; border-radius: 50%; background: ${s.color};"></span>
              <span style="color: var(--text-main); font-weight: 600;">${s.name}</span>
              <span style="color: var(--text-muted); font-weight: 700;">(${s.percent}%)</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderRecentOrders() {
    const tableBody = document.getElementById('recentOrdersTableBody');
    if (!tableBody) return;

    const orders = appState.orders.slice(0, 8);

    if (orders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding: 24px;">No recent orders recorded.</td></tr>`;
      return;
    }

    tableBody.innerHTML = orders.map(order => {
      const orderTotal = Number(order.total !== undefined ? order.total : (order.grandTotal || 0));
      const orderDate = new Date(order.created_at || order.createdAt || Date.now());
      const st = (order.status || '').toLowerCase();
      return `
        <tr>
          <td style="font-weight: 700; font-family: var(--font-mono);">#${order.id}</td>
          <td>Table ${order.table_number || order.tableNo}</td>
          <td>${orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
          <td>${(order.items || []).length} items</td>
          <td style="font-weight: 800; color: var(--primary);">₹${orderTotal.toFixed(2)}</td>
          <td>
            <span class="table-status-pill ${st === 'ready' || st === 'served' ? 'available' : (st === 'preparing' ? 'occupied' : (st === 'cancelled' ? 'cleaning' : 'reserved'))}">
              ${(order.status || 'PENDING').toUpperCase()}
            </span>
          </td>
          <td>
            <button class="nav-btn" style="padding: 4px 8px; font-size: 0.75rem;" onclick="OrdersModule.viewInvoice('${order.id}')">
              Bill
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
};
