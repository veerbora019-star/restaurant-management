/**
 * SPICE GARDEN POS & RESTAURANT SAAS PLATFORM
 * Sales Reports, Business Analytics & Multi-Range Metrics
 */

const ReportsModule = {
  currentRange: 'today', // today, weekly, monthly

  init() {
    this.renderReportsView();

    appState.on('orders:updated', () => {
      this.renderReportsView();
    });
  },

  setRange(range, btnEl) {
    this.currentRange = range;
    document.querySelectorAll('.report-range-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    this.renderReportsView();
  },

  renderReportsView() {
    const container = document.getElementById('adminReportsContainer');
    if (!container) return;

    const orders = appState.orders.filter(o => o.status !== ORDER_STATUS.CANCELLED);
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
    const totalOrders = orders.length;
    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const totalDiscounts = orders.reduce((sum, o) => sum + (Number(o.discount) || 0), 0);
    const totalGstCollected = orders.reduce((sum, o) => sum + (Number(o.gst) || 0), 0);

    // Payment breakdown
    const paymentBreakdown = {
      [PAYMENT_METHODS.UPI]: 0,
      [PAYMENT_METHODS.CASH]: 0,
      [PAYMENT_METHODS.CARD]: 0,
      [PAYMENT_METHODS.ONLINE]: 0
    };

    orders.forEach((o, i) => {
      // Simulate distribution among payment types
      const methods = [PAYMENT_METHODS.UPI, PAYMENT_METHODS.CASH, PAYMENT_METHODS.CARD, PAYMENT_METHODS.UPI];
      const method = o.paymentMethod || methods[i % methods.length];
      paymentBreakdown[method] = (paymentBreakdown[method] || 0) + (Number(o.grandTotal) || 0);
    });

    // Table performance (revenue by table)
    const tableSales = {};
    orders.forEach(o => {
      tableSales[o.tableNo] = (tableSales[o.tableNo] || 0) + (Number(o.grandTotal) || 0);
    });

    container.innerHTML = `
      <!-- Reports Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
        <div>
          <h2 style="font-family: var(--font-serif); font-size: 1.4rem; font-weight: 700;">Financial & Sales Reports</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Inspect gross receipts, GST collected, discounts, and payment methods.</p>
        </div>

        <div style="display: flex; gap: 6px;">
          <button class="nav-btn report-range-btn ${this.currentRange === 'today' ? 'active' : ''}" onclick="ReportsModule.setRange('today', this)">Today</button>
          <button class="nav-btn report-range-btn ${this.currentRange === 'weekly' ? 'active' : ''}" onclick="ReportsModule.setRange('weekly', this)">This Week</button>
          <button class="nav-btn report-range-btn ${this.currentRange === 'monthly' ? 'active' : ''}" onclick="ReportsModule.setRange('monthly', this)">This Month</button>
        </div>
      </div>

      <!-- Financial Metric Cards -->
      <div class="kpi-row" style="margin-bottom: 24px;">
        <div class="kpi-card">
          <span class="kpi-title">Gross Settled Sales</span>
          <span class="kpi-val text-primary">₹${totalRevenue.toLocaleString('en-IN')}</span>
          <span class="kpi-trend positive">&bull; Net billings</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-title">GST Tax Collected</span>
          <span class="kpi-val" style="color: #0284c7;">₹${Math.round(totalGstCollected).toLocaleString('en-IN')}</span>
          <span class="kpi-trend neutral">CGST + SGST (5%)</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-title">Discounts Given</span>
          <span class="kpi-val" style="color: #dc2626;">₹${Math.round(totalDiscounts).toLocaleString('en-IN')}</span>
          <span class="kpi-trend neutral">Coupons & Promos</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-title">Average Ticket Size</span>
          <span class="kpi-val text-accent">₹${aov}</span>
          <span class="kpi-trend positive">Across ${totalOrders} orders</span>
        </div>
      </div>

      <!-- Grid of Analytical Breakdown Tables -->
      <div class="charts-grid">
        <!-- 1. Payment Method Breakdown -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Settlement by Payment Method</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
            ${Object.keys(paymentBreakdown).map(method => {
              const amount = paymentBreakdown[method];
              const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
              return `
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.84rem; font-weight: 600; margin-bottom: 4px;">
                    <span>${method}</span>
                    <span style="font-weight: 700; color: var(--text-main);">₹${amount.toLocaleString()} (${pct}%)</span>
                  </div>
                  <div style="width: 100%; height: 8px; background: var(--bg-subtle); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${pct}%; height: 100%; background: var(--primary); border-radius: 4px;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 2. Table Performance (Revenue per table) -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Top Revenue Tables</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
            ${Object.keys(tableSales).sort((a, b) => tableSales[b] - tableSales[a]).slice(0, 5).map(tbl => {
              const rev = tableSales[tbl];
              return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-subtle); border-radius: var(--radius-sm); font-size: 0.85rem;">
                  <span style="font-weight: 700;">🪑 Table #${tbl}</span>
                  <span style="font-weight: 800; color: var(--primary);">₹${rev.toLocaleString()}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }
};
