requireAuth(['admin']);

async function loadDashboard() {
  try {
    const { stats } = await API.admin.dashboard();
    document.getElementById('stat-revenue').textContent = formatPrice(stats.totalRevenue);
    document.getElementById('stat-users').textContent = stats.totalUsers;
    document.getElementById('stat-vendors').textContent = stats.totalVendors;
    document.getElementById('stat-orders').textContent = stats.activeOrders;
  } catch (err) {
    showToastMessage(err.message, true);
  }
}

async function loadUsers() {
  const tbody = document.getElementById('users-tbody');
  try {
    const { users } = await API.admin.users();
    tbody.innerHTML = users
      .map(
        (u) => `
      <tr>
        <td>${u.firstName} ${u.lastName}</td>
        <td>${u.email}</td>
        <td><span class="badge badge-${u.role}">${u.role}</span></td>
        <td>${u.isActive ? 'Active' : 'Inactive'}</td>
        <td>${formatDate(u.createdAt)}</td>
        <td>
          <button class="toggle-user" data-id="${u._id}" data-active="${u.isActive}">
            ${u.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </td>
      </tr>`
      )
      .join('');

    tbody.querySelectorAll('.toggle-user').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await API.admin.updateUser(btn.dataset.id, {
            isActive: btn.dataset.active !== 'true',
          });
          showToastMessage('User updated');
          loadUsers();
        } catch (err) {
          showToastMessage(err.message, true);
        }
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6">${err.message}</td></tr>`;
  }
}

async function loadProducts() {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;
  try {
    const { products } = await API.admin.products();
    tbody.innerHTML = products
      .map(
        (p) => `
      <tr>
        <td>${p.name}</td>
        <td>${p.vendorName}</td>
        <td>${formatPrice(p.price)}</td>
        <td>${p.stock}</td>
        <td>
          <button class="delete-product" data-id="${p._id}">Delete</button>
        </td>
      </tr>`
      )
      .join('');

    tbody.querySelectorAll('.delete-product').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete product?')) return;
        try {
          await API.admin.deleteProduct(btn.dataset.id);
          showToastMessage('Product deleted');
          loadProducts();
        } catch (err) {
          showToastMessage(err.message, true);
        }
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">${err.message}</td></tr>`;
  }
}

async function loadOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  try {
    const { orders } = await API.admin.orders();
    tbody.innerHTML = orders
      .map(
        (o) => `
      <tr>
        <td>#${o._id.slice(-8)}</td>
        <td>${o.customer?.firstName || ''} ${o.customer?.lastName || ''}</td>
        <td>${formatPrice(o.total)}</td>
        <td>${o.status}</td>
        <td>
          <select class="admin-order-status" data-id="${o._id}">
            ${['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
              .map((s) => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`)
              .join('')}
          </select>
        </td>
      </tr>`
      )
      .join('');

    tbody.querySelectorAll('.admin-order-status').forEach((sel) => {
      sel.addEventListener('change', async () => {
        try {
          await API.admin.updateOrder(sel.dataset.id, { status: sel.value });
          showToastMessage('Order updated');
        } catch (err) {
          showToastMessage(err.message, true);
        }
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">${err.message}</td></tr>`;
  }
}

document.querySelectorAll('.menu-item[data-panel]').forEach((item) => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.menu-item').forEach((m) => m.classList.remove('active'));
    item.classList.add('active');
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
    document.getElementById(item.dataset.panel)?.classList.add('active');
    if (item.dataset.panel === 'users-panel') loadUsers();
    if (item.dataset.panel === 'products-panel') loadProducts();
    if (item.dataset.panel === 'orders-panel') loadOrders();
  });
});

document.getElementById('logout-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  API.clearAuth();
  window.location.href = '/login';
});

// Mobile Sidebar Drawer Navigation
const sidebar = document.getElementById('dashboard-sidebar');
const toggleBtn = document.getElementById('mobile-sidebar-toggle');
const closeBtn = document.getElementById('sidebar-close-btn');

if (toggleBtn && sidebar) {
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.add('open');
  });
}

if (closeBtn && sidebar) {
  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('open');
  });
}

// Close mobile sidebar drawer when switching tabs on mobile
document.querySelectorAll('.sidebar-menu .menu-item').forEach((item) => {
  item.addEventListener('click', () => {
    sidebar?.classList.remove('open');
  });
});

loadDashboard();
loadUsers();


