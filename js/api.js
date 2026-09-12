const API_PORT = 3000;

function getApiBase() {
  if (window.location.protocol === 'file:') {
    return `http://localhost:${API_PORT}`;
  }
  if (window.location.port && window.location.port !== String(API_PORT)) {
    return `${window.location.protocol}//${window.location.hostname}:${API_PORT}`;
  }
  return '';
}

const API = {
  getBase() {
    return getApiBase() || window.location.origin;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUser() {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },

  async request(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${getApiBase()}${url}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let res;
    try {
      res = await fetch(fullUrl, { ...options, headers });
    } catch {
      const err = new Error('Cannot reach the backend server.');
      err.code = 'NETWORK';
      throw err;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(data.message || `Request failed (${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  async checkHealth() {
    return this.request('/api/health');
  },

  auth: {
    register: (body) => API.request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => API.request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => API.request('/api/auth/me'),
  },

  products: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return API.request(`/api/products${qs ? `?${qs}` : ''}`);
    },
    get: (id) => API.request(`/api/products/${id}`),
    vendors: () => API.request('/api/products/vendors/list'),
  },

  orders: {
    create: (body) => API.request('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
    my: () => API.request('/api/orders/my'),
    get: (id) => API.request(`/api/orders/${id}`),
    track: (params) => {
      const qs = new URLSearchParams(params).toString();
      return API.request(`/api/orders/track?${qs}`);
    },
    updateStatus: (id, body) =>
      API.request(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
  },

  reviews: {
    list: (productId) => API.request(`/api/reviews/product/${productId}`),
    create: (productId, body) =>
      API.request(`/api/reviews/product/${productId}`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  vendor: {
    stats: () => API.request('/api/vendor/stats'),
    products: () => API.request('/api/vendor/products'),
    createProduct: (body) =>
      API.request('/api/vendor/products', { method: 'POST', body: JSON.stringify(body) }),
    updateProduct: (id, body) =>
      API.request(`/api/vendor/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteProduct: (id) => API.request(`/api/vendor/products/${id}`, { method: 'DELETE' }),
    orders: () => API.request('/api/vendor/orders'),
  },

  admin: {
    dashboard: () => API.request('/api/admin/dashboard'),
    users: () => API.request('/api/admin/users'),
    updateUser: (id, body) =>
      API.request(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    products: () => API.request('/api/admin/products'),
    deleteProduct: (id) => API.request(`/api/admin/products/${id}`, { method: 'DELETE' }),
    orders: () => API.request('/api/admin/orders'),
    updateOrder: (id, body) =>
      API.request(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
  },
};

function formatApiError(err) {
  if (window.location.protocol === 'file:') {
    return `Do not open HTML files directly. Run npm start, then visit http://localhost:${API_PORT}`;
  }
  if (err.code === 'NETWORK') {
    return `Backend not reachable. Run npm start, then open http://localhost:${API_PORT}`;
  }
  if (err.status === 404) {
    return 'API route not found. Restart the server with npm start (use the latest server.js).';
  }
  if (err.status === 503) {
    return err.message || 'Database is still connecting. Wait a few seconds and refresh.';
  }
  return err.message || 'Something went wrong. Check that npm start is running.';
}

function showToastMessage(message, isError = false) {
  const el = document.createElement('div');
  el.style.cssText = `
    position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
    background: ${isError ? '#dc2626' : 'var(--text-main, #1e293b)'}; color: white;
    padding: 1rem 2rem; border-radius: 2rem; z-index: 3000; max-width: 90vw; text-align: center;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  `;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.5s';
    setTimeout(() => el.remove(), 500);
  }, 4000);
}

function redirectByRole(role) {
  if (role === 'vendor') window.location.href = '/vendor';
  else if (role === 'admin') window.location.href = '/admin';
  else window.location.href = '/';
}

function requireAuth(roles = []) {
  const user = API.getUser();
  const token = API.getToken();
  if (!token || !user) {
    window.location.href = '/login';
    return null;
  }
  if (roles.length && !roles.includes(user.role)) {
    window.location.href = '/';
    return null;
  }
  return user;
}

function formatPrice(n) {
  return `$${Number(n).toFixed(2)}`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
