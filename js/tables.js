/**
 * SPICE GARDEN POS & RESTAURANT SAAS PLATFORM
 * Table Floor Module (Seamless bridge to Waiter Floor POS & Table Actions)
 */

const TablesModule = {
  currentSectionFilter: 'all',

  init() {
    this.renderTableGrid();
    appState.on('tables:updated', () => this.renderTableGrid());
    appState.on('orders:updated', () => this.renderTableGrid());
  },

  setSectionFilter(section, btnEl) {
    this.currentSectionFilter = section;
    if (typeof WaiterModule !== 'undefined') {
      WaiterModule.setSectionFilter(section, btnEl);
    }
  },

  renderTableGrid() {
    if (typeof WaiterModule !== 'undefined') {
      WaiterModule.renderWaiterDashboard();
    }
  },

  openTableActionsModal(tableId) {
    if (typeof WaiterModule !== 'undefined') {
      WaiterModule.openTableModal(tableId);
    }
  },

  changeStatus(tableId, newStatus) {
    appState.updateTableStatus(tableId, newStatus);
    NotificationService.info(`Table status updated to ${newStatus}`);
  },

  setCustomerActiveTable(tableNumber) {
    appState.setActiveTable(tableNumber);
    NotificationService.success(`Selected Table #${tableNumber} for dining!`);
    App.switchView('customerMenuView');
  }
};
