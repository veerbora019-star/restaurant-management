/**
 * SPICE GARDEN POS & RESTAURANT SAAS PLATFORM
 * Staff & Role-Based Access Control (RBAC) Management
 */

const StaffModule = {
  init() {
    this.renderStaffManager();

    appState.on('staff:updated', () => {
      this.renderStaffManager();
    });
  },

  renderStaffManager() {
    const container = document.getElementById('adminStaffSection');
    if (!container) return;

    const staffList = appState.getStaff();

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
        <div>
          <h3 style="font-weight: 700;">Staff Members & Access Roles</h3>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Manage employee accounts, role-based permissions (Owner, Manager, Waiter, Kitchen).</p>
        </div>
        <button class="nav-btn primary" onclick="StaffModule.openAddStaffModal()">+ Add Employee</button>
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Username / Email</th>
              <th>Assigned Role</th>
              <th>Permissions</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${staffList.map(s => {
              const roleObj = ROLES[s.role.toUpperCase()] || { name: s.role, permissions: ['basic'] };
              return `
                <tr>
                  <td style="font-weight: 700;">${s.name}</td>
                  <td style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-muted);">${s.email}</td>
                  <td>
                    <span class="table-status-pill ${s.role === 'owner' ? 'available' : (s.role === 'manager' ? 'occupied' : 'reserved')}" style="font-size: 0.72rem;">
                      ${roleObj.name}
                    </span>
                  </td>
                  <td style="font-size: 0.78rem; color: var(--text-muted);">
                    ${roleObj.permissions.join(', ')}
                  </td>
                  <td>
                    <button class="nav-btn ${s.active ? 'primary' : ''}" style="padding: 3px 8px; font-size: 0.75rem;" onclick="StaffModule.toggleActive(${s.id})">
                      ${s.active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="nav-btn" style="padding: 3px 8px; font-size: 0.75rem;" onclick="StaffModule.editStaff(${s.id})">Edit</button>
                      <button class="nav-btn" style="padding: 3px 8px; font-size: 0.75rem; color: var(--danger);" onclick="StaffModule.deleteStaff(${s.id})">Delete</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  openAddStaffModal() {
    const name = prompt('Enter employee name:');
    if (!name || !name.trim()) return;

    const email = prompt('Enter username/email:');
    if (!email || !email.trim()) return;

    const role = prompt('Enter role ("owner", "manager", "waiter", "kitchen"):', 'waiter') || 'waiter';

    const newStaff = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      role: role.toLowerCase(),
      password: 'staff' + Math.floor(100 + Math.random() * 900),
      active: true
    };

    const updated = [...appState.getStaff(), newStaff];
    appState.saveStaff(updated);
    NotificationService.success(`Added staff member "${newStaff.name}" as ${newStaff.role.toUpperCase()}`);
  },

  toggleActive(id) {
    const updated = appState.getStaff().map(s => s.id === id ? { ...s, active: !s.active } : s);
    appState.saveStaff(updated);
  },

  deleteStaff(id) {
    if (confirm('Delete this staff user account?')) {
      const updated = appState.getStaff().filter(s => s.id !== id);
      appState.saveStaff(updated);
      NotificationService.warning('Staff account removed');
    }
  }
};
