/**
 * SPICE GARDEN POS & RESTAURANT SAAS PLATFORM
 * Staff Login Portal Module
 */

const LoginModule = {
  render() {
    const container = document.getElementById('staffLoginContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="login-card">
        <div class="login-card-header">
          <div style="font-size: 2.5rem; margin-bottom: 6px;">🔐</div>
          <h1 style="font-family: var(--font-serif); font-size: 1.6rem; font-weight: 800; color: var(--text-main);">
            Restaurant Staff Terminal
          </h1>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
            Secure role-based login for Floor Waiters, Kitchen Chefs, and Restaurant Owners.
          </p>
        </div>

        <!-- 1-CLICK INSTANT DEMO LOGIN BUTTONS -->
        <div style="background: var(--primary-light); border: 2px solid var(--primary-border); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 20px;">
          <div style="font-size: 0.82rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <span>⚡</span> 1-Click Instant Login (No typing needed):
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="nav-btn" style="background: var(--bg-surface); border: 1.5px solid var(--border-medium); padding: 10px 14px; font-weight: 700; display: flex; align-items: center; justify-content: space-between; text-align: left;" onclick="LoginModule.quickLogin('waiter', 'waiter123')">
              <span>📋 <strong>Waiter POS</strong> (Suresh Patil)</span>
              <span style="color: var(--primary); font-size: 0.78rem;">Enter &rarr;</span>
            </button>

            <button class="nav-btn" style="background: var(--bg-surface); border: 1.5px solid var(--border-medium); padding: 10px 14px; font-weight: 700; display: flex; align-items: center; justify-content: space-between; text-align: left;" onclick="LoginModule.quickLogin('kitchen', 'kitchen123')">
              <span>🍳 <strong>Kitchen KDS</strong> (Chef Sanjeev)</span>
              <span style="color: var(--primary); font-size: 0.78rem;">Enter &rarr;</span>
            </button>

            <button class="nav-btn" style="background: var(--bg-surface); border: 1.5px solid var(--border-medium); padding: 10px 14px; font-weight: 700; display: flex; align-items: center; justify-content: space-between; text-align: left;" onclick="LoginModule.quickLogin('owner', 'admin123')">
              <span>⚙️ <strong>Owner / Admin</strong> (Rajesh Sharma)</span>
              <span style="color: var(--primary); font-size: 0.78rem;">Enter &rarr;</span>
            </button>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <div style="flex: 1; height: 1px; background: var(--border-light);"></div>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Or Sign In Manually</span>
          <div style="flex: 1; height: 1px; background: var(--border-light);"></div>
        </div>

        <!-- MANUAL FORM -->
        <form id="staffLoginForm" onsubmit="LoginModule.handleSubmit(event)" class="login-form">
          <div id="staffLoginAlert" class="login-alert" style="display: none; margin-bottom: 12px;"></div>

          <div class="form-group">
            <label class="form-label">Username / Role / Email</label>
            <input 
              type="text" 
              id="loginUsername" 
              class="form-input" 
              placeholder="e.g. waiter, kitchen, or owner" 
              value="owner"
              required 
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input 
              type="password" 
              id="loginPassword" 
              class="form-input" 
              placeholder="Password" 
              value="admin123"
              required 
              autocomplete="current-password"
            />
          </div>

          <button type="submit" class="nav-btn primary full" style="padding: 12px; font-size: 0.95rem; font-weight: 700; margin-top: 8px;">
            Sign In &rarr;
          </button>
        </form>

        <!-- CREDENTIALS TABLE -->
        <div style="margin-top: 20px; background: var(--bg-subtle); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-light); font-size: 0.78rem;">
          <strong style="color: var(--text-main); display: block; margin-bottom: 6px;">Staff Passwords Quick Reference:</strong>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; color: var(--text-muted);">
            <div>&bull; Waiter: <code>waiter</code> / <code>waiter123</code></div>
            <div>&bull; Kitchen: <code>kitchen</code> / <code>kitchen123</code></div>
            <div style="grid-column: 1 / -1;">&bull; Owner/Admin: <code>owner</code> / <code>admin123</code></div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 16px;">
          <a href="#order?res=res_spice_garden&table=12" class="text-primary" style="font-size: 0.82rem; font-weight: 600;">
            &larr; Return to Customer Table Menu
          </a>
        </div>
      </div>
    `;
  },

  async quickLogin(role, password) {
    const res = await AuthService.login(role, password);
    if (res.success) {
      NotificationService.success(`Signed in as ${res.user.name} (${res.user.role.toUpperCase()})`);
      AppRouter.navigate(res.redirectUrl);
    } else {
      NotificationService.error('Login failed');
    }
  },

  async handleSubmit(e) {
    if (e) e.preventDefault();

    const userIn = document.getElementById('loginUsername');
    const passIn = document.getElementById('loginPassword');
    const alertEl = document.getElementById('staffLoginAlert');

    if (!userIn || !passIn) return;

    const username = userIn.value.trim();
    const password = passIn.value.trim();

    if (!username || !password) {
      if (alertEl) {
        alertEl.style.display = 'block';
        alertEl.textContent = 'Please enter both username and password';
      }
      return;
    }

    const res = await AuthService.login(username, password);

    if (res.success) {
      if (alertEl) alertEl.style.display = 'none';
      NotificationService.success(`Welcome, ${res.user.name}! (${res.user.role.toUpperCase()})`);
      AppRouter.navigate(res.redirectUrl);
    } else {
      if (alertEl) {
        alertEl.style.display = 'block';
        alertEl.textContent = res.error || 'Invalid credentials';
      }
      NotificationService.error('Authentication failed');
    }
  }
};
