// frontend/Navbar/store.js
// Single shared client-side store for transactions & monthly outflow
(function (global) {
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
     * Sum actual expense transactions for the current month
     */
    calculateMonthOutflow(txList) {
      if (!Array.isArray(txList) || txList.length === 0) return 0.0;
      const now = new Date();
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const expenseSum = txList
        .filter(t => {
          const isExpense = String(t.type || '').toLowerCase() === 'expense';
          const d = t.date || (t.created_at ? String(t.created_at).split('T')[0] : '');
          return isExpense && d.startsWith(currentYearMonth);
        })
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      return Math.round(expenseSum * 100) / 100;
    },

    /**
     * Calculate actual all-time total expenditure
     */
    calculateTotalExpenditure(txList) {
      if (!Array.isArray(txList) || txList.length === 0) return 0.0;
      const expenseSum = txList
        .filter(t => String(t.type || '').toLowerCase() === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      return Math.round(expenseSum * 100) / 100;
    },

    /**
     * Get the current month outflow
     */
    getCurrentMonthOutflow() {
      const stored = localStorage.getItem('rv_current_month_outflow');
      if (stored !== null && !isNaN(Number(stored))) return Number(stored);
      const txs = this.getTransactions();
      if (txs) return this.calculateMonthOutflow(txs);
      return 0.0;
    }
  };

  global.RVStore = Store;
})(typeof window !== 'undefined' ? window : this);
