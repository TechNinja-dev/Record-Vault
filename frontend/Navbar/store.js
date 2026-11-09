// frontend/Navbar/store.js
// Single shared client-side store for transactions & monthly outflow
(function (global) {
  const BASE_MONTH_OUTFLOW = 37341.0;
  const BASE_TOTAL_OUTFLOW = 477661.0;

  const Store = {
    /**
     * Retrieve locally cached transactions list
     */
    getTransactions() {
      try {
        const raw = localStorage.getItem('rv_transactions');
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },

    /**
     * Save transactions and recompute shared monthly outflow
     */
    saveTransactions(txList) {
      try {
        localStorage.setItem('rv_transactions', JSON.stringify(txList));
        const monthExp = this.calculateMonthOutflow(txList);
        localStorage.setItem('rv_current_month_outflow', String(monthExp));

        // Dispatch a custom event for real-time reactive sync across components
        window.dispatchEvent(new CustomEvent('rv-store-updated', {
          detail: { transactions: txList, monthOutflow: monthExp }
        }));
      } catch (e) {
        console.warn('Store save failed:', e);
      }
    },

    /**
     * Sum all current expense transactions + baseline
     */
    calculateMonthOutflow(txList) {
      if (!Array.isArray(txList)) return 42180.0;
      const expenseSum = txList
        .filter(t => String(t.type).toLowerCase() === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      return Math.round((BASE_MONTH_OUTFLOW + expenseSum) * 100) / 100;
    },

    /**
     * Calculate all-time total expenditure
     */
    calculateTotalExpenditure(txList) {
      if (!Array.isArray(txList)) return 482500.0;
      const expenseSum = txList
        .filter(t => String(t.type).toLowerCase() === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      return Math.round((BASE_TOTAL_OUTFLOW + expenseSum) * 100) / 100;
    },

    /**
     * Get the current month outflow
     */
    getCurrentMonthOutflow() {
      const stored = localStorage.getItem('rv_current_month_outflow');
      if (stored && !isNaN(stored)) return Number(stored);
      const txs = this.getTransactions();
      if (txs) return this.calculateMonthOutflow(txs);
      return 42180.0;
    }
  };

  global.RVStore = Store;
})(typeof window !== 'undefined' ? window : this);
