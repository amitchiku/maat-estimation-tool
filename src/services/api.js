const isGas = typeof window !== 'undefined' && window.google && window.google.script && window.google.script.run;

function runGas(functionName, ...args) {
  return new Promise((resolve, reject) => {
    if (!isGas) {
      reject(new Error('Google Apps Script context not available'));
      return;
    }
    window.google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)[functionName](...args);
  });
}

export const api = {
  async getCatalog() {
    if (isGas) {
      return runGas('getCatalog');
    }
    const response = await fetch('/api/catalog');
    if (!response.ok) throw new Error('Failed to fetch catalog');
    return response.json();
  },

  async saveCatalog(catalog) {
    if (isGas) {
      return runGas('saveCatalog', catalog);
    }
    const response = await fetch('/api/catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(catalog)
    });
    if (!response.ok) throw new Error('Failed to save catalog');
    return response.json();
  },

  async getQuotes() {
    if (isGas) {
      return runGas('getQuotes');
    }
    const response = await fetch('/api/quotes');
    if (!response.ok) throw new Error('Failed to fetch quotes');
    return response.json();
  },

  async getQuote(id) {
    if (isGas) {
      return runGas('getQuote', id);
    }
    const response = await fetch(`/api/quotes/${id}`);
    if (!response.ok) throw new Error('Failed to fetch quote');
    return response.json();
  },

  async saveQuote(quote) {
    if (isGas) {
      return runGas('saveQuote', quote);
    }
    const response = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote)
    });
    if (!response.ok) throw new Error('Failed to save quote');
    return response.json();
  },

  async deleteQuote(id) {
    if (isGas) {
      return runGas('deleteQuote', id);
    }
    const response = await fetch(`/api/quotes/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete quote');
    return response.json();
  }
};
