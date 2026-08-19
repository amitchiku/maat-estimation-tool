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
  async getCatalog(type) {
    if (isGas) {
      return runGas('getCatalog', type);
    }
    const url = type ? `/api/catalog/${type}` : '/api/catalog';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch catalog');
    return response.json();
  },

  async upsertCatalog(type, data) {
    if (isGas) {
      return runGas('upsertCatalog', type, data);
    }
    let targetType = type;
    let payload = data;
    if (data === undefined && typeof type === 'object') {
      targetType = null;
      payload = type;
    }

    const url = targetType ? `/api/catalog/${targetType}` : '/api/catalog';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      let errMsg = 'Failed to upsert catalog';
      try {
        const errJson = await response.json();
        if (errJson && errJson.error) errMsg = errJson.error;
      } catch (e) {}
      throw new Error(errMsg);
    }
    return response.json();
  },

  async saveCatalog(catalog) {
    return this.upsertCatalog(null, catalog);
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
