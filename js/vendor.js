const user = requireAuth(['vendor']);
if (!user) {
  /* redirected */
}
let vendorProducts = [];

document.getElementById('vendor-name').textContent = user.storeName || user.firstName;

async function loadDashboard() {
  try {
    const { stats } = await API.vendor.stats();
    document.getElementById('stat-sales').textContent = formatPrice(stats.totalSales);
    document.getElementById('stat-orders').textContent = stats.activeOrders;
    document.getElementById('stat-sold').textContent = stats.productsSold;
    document.getElementById('stat-rating').textContent = `${stats.rating} / 5.0`;
  } catch (err) {
    showToastMessage(err.message, true);
  }
}

async function loadProducts() {
  const tbody = document.getElementById('products-tbody');
  try {
    const { products } = await API.vendor.products();
    vendorProducts = products;
    tbody.innerHTML = products
      .map(
        (p) => `
      <tr>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>${formatPrice(p.price)}</td>
        <td>${p.stock}</td>
        <td><span class="status ${p.stock > 0 ? 'status-active' : 'status-pending'}">${p.stock > 0 ? 'Active' : 'Out of Stock'}</span></td>
        <td>
          <button class="edit-product" data-id="${p._id}" title="Edit"><i class='bx bx-edit-alt'></i></button>
          <button class="delete-product" data-id="${p._id}" title="Delete"><i class='bx bx-trash'></i></button>
        </td>
      </tr>`
      )
      .join('');

    tbody.querySelectorAll('.delete-product').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this product?')) return;
        try {
          await API.vendor.deleteProduct(btn.dataset.id);
          showToastMessage('Product deleted');
          loadProducts();
        } catch (err) {
          showToastMessage(err.message, true);
        }
      });
    });

    tbody.querySelectorAll('.edit-product').forEach((btn) => {
      btn.addEventListener('click', () => openProductModal(btn.dataset.id, vendorProducts));
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6">${err.message}</td></tr>`;
  }
}

async function loadOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  try {
    const { orders } = await API.vendor.orders();
    tbody.innerHTML = orders
      .map((order) => {
        const myItems = order.items.filter(
          (i) => String(i.vendor) === String(user.id) || String(i.vendor?._id) === String(user.id)
        );
        const total = myItems.reduce((s, i) => s + i.price * i.quantity, 0);
        return `
        <tr>
          <td>#${order._id.slice(-8)}</td>
          <td>${order.customer?.firstName || ''} ${order.customer?.lastName || ''}</td>
          <td>${myItems.length} item(s)</td>
          <td>${formatPrice(total)}</td>
          <td><span class="status status-active">${order.status}</span></td>
          <td>
            <select class="order-status-select" data-id="${order._id}">
              ${['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
                .map((s) => `<option value="${s}" ${s === order.status ? 'selected' : ''}>${s}</option>`)
                .join('')}
            </select>
          </td>
        </tr>`;
      })
      .join('');

    tbody.querySelectorAll('.order-status-select').forEach((sel) => {
      sel.addEventListener('change', async () => {
        try {
          await API.orders.updateStatus(sel.dataset.id, { status: sel.value });
          showToastMessage('Order status updated');
        } catch (err) {
          showToastMessage(err.message, true);
        }
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6">${err.message}</td></tr>`;
  }
}

function openProductModal(productId, productsList) {
  const modal = document.getElementById('product-modal');
  const form = document.getElementById('product-form');
  const product = productsList?.find((p) => p._id === productId);

  document.getElementById('modal-title').textContent = product ? 'Edit Product' : 'Add New Product';
  form.reset();
  form.dataset.editId = productId || '';

  if (product) {
    form.name.value = product.name;
    form.description.value = product.description;
    form.price.value = product.price;
    form.category.value = product.category;
    form.image.value = product.image;
    form.stock.value = product.stock;
  }

  modal.classList.add('open');
}

document.getElementById('add-product-btn')?.addEventListener('click', () => {
  openProductModal(null, []);
});

document.getElementById('close-product-modal')?.addEventListener('click', () => {
  document.getElementById('product-modal').classList.remove('open');
});

document.getElementById('product-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const body = {
    name: form.name.value.trim(),
    description: form.description.value.trim(),
    price: Number(form.price.value),
    category: form.category.value,
    image: form.image.value.trim(),
    stock: Number(form.stock.value),
  };

  try {
    if (form.dataset.editId) {
      await API.vendor.updateProduct(form.dataset.editId, body);
      showToastMessage('Product updated');
    } else {
      await API.vendor.createProduct(body);
      showToastMessage('Product created');
    }
    document.getElementById('product-modal').classList.remove('open');
    loadProducts();
    loadDashboard();
  } catch (err) {
    showToastMessage(err.message, true);
  }
});

document.querySelectorAll('.menu-item[data-panel]').forEach((item) => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.menu-item').forEach((m) => m.classList.remove('active'));
    item.classList.add('active');
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
    document.getElementById(item.dataset.panel)?.classList.add('active');
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
loadProducts();


