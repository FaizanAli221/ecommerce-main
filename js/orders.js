const user = requireAuth(['customer', 'vendor', 'admin']);

async function loadMyOrders() {
  const list = document.getElementById('orders-list');
  try {
    const { orders } = await API.orders.my();
    if (orders.length === 0) {
      list.innerHTML = '<p class="empty-msg">No orders yet. <a href="/">Start shopping</a></p>';
      return;
    }

    list.innerHTML = orders
      .map(
        (o) => `
      <div class="order-card">
        <div class="order-header">
          <span><strong>Order #${o._id.slice(-8).toUpperCase()}</strong></span>
          <span class="order-status">${o.status}</span>
        </div>
        <p class="order-meta">${formatDate(o.createdAt)} · ${o.items.length} item(s) · ${formatPrice(o.total)}</p>
        <p class="order-tracking">Tracking: <code>${o.trackingNumber || 'N/A'}</code></p>
        <div class="order-progress">
          ${['pending', 'confirmed', 'processing', 'shipped', 'delivered']
            .map(
              (step) =>
                `<span class="step ${getStepClass(o.status, step)}">${step}</span>`
            )
            .join('')}
        </div>
        <button class="view-order-btn" data-id="${o._id}">View Details</button>
      </div>`
      )
      .join('');

    list.querySelectorAll('.view-order-btn').forEach((btn) => {
      btn.addEventListener('click', () => showOrderDetail(btn.dataset.id));
    });

    const params = new URLSearchParams(window.location.search);
    if (params.get('orderId')) showOrderDetail(params.get('orderId'));
  } catch (err) {
    list.innerHTML = `<p class="empty-msg">${err.message}</p>`;
  }
}

function getStepClass(current, step) {
  const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentIdx = steps.indexOf(current);
  const stepIdx = steps.indexOf(step);
  if (current === 'cancelled') return 'cancelled';
  if (stepIdx <= currentIdx) return 'done';
  return '';
}

async function showOrderDetail(orderId) {
  try {
    const { order } = await API.orders.get(orderId);
    const detail = document.getElementById('order-detail');
    detail.style.display = 'block';
    detail.innerHTML = `
      <h3>Order #${order._id.slice(-8).toUpperCase()}</h3>
      <p>Status: <strong>${order.status}</strong></p>
      <p>Tracking: <code>${order.trackingNumber}</code></p>
      <h4>Items</h4>
      <ul>${order.items.map((i) => `<li>${i.name} x${i.quantity} — ${formatPrice(i.price * i.quantity)}</li>`).join('')}</ul>
      <h4>Shipping</h4>
      <p>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
      ${order.shippingAddress.address}, ${order.shippingAddress.city} ${order.shippingAddress.zipCode}</p>
      <p><strong>Total: ${formatPrice(order.total)}</strong></p>
    `;
    detail.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    showToastMessage(err.message, true);
  }
}

document.getElementById('track-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const trackingNumber = document.getElementById('tracking-input').value.trim();
  const result = document.getElementById('track-result');
  try {
    const { order } = await API.orders.track({ trackingNumber });
    result.innerHTML = `
      <div class="order-card">
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Tracking:</strong> ${order.trackingNumber}</p>
        <p><strong>Total:</strong> ${formatPrice(order.total)}</p>
        <p><strong>Updated:</strong> ${formatDate(order.updatedAt)}</p>
      </div>`;
  } catch (err) {
    result.innerHTML = `<p style="color:#dc2626">${err.message}</p>`;
  }
});

if (user?.role === 'customer') loadMyOrders();


