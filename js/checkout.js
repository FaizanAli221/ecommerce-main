const cart = JSON.parse(localStorage.getItem('cart')) || [];
const summaryContainer = document.getElementById('checkout-summary');
let selectedPayment = 'card';

function renderSummary() {
  let subtotal = 0;
  summaryContainer.innerHTML = '';

  cart.forEach((item) => {
    subtotal += item.price * item.quantity;
    const div = document.createElement('div');
    div.className = 'summary-item';
    div.style.fontSize = '0.9rem';
    div.style.color = 'var(--text-muted)';
    div.innerHTML = `<span>${item.name} (x${item.quantity})</span><span>${formatPrice(item.price * item.quantity)}</span>`;
    summaryContainer.appendChild(div);
  });

  const shipping = subtotal >= 500 ? 0 : 9.99;
  const total = subtotal + shipping;

  document.getElementById('subtotal').textContent = formatPrice(subtotal);
  document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : formatPrice(shipping);
  document.getElementById('final-total').textContent = formatPrice(total);

  return { subtotal, shipping, total };
}

document.querySelectorAll('[data-payment]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-payment]').forEach((b) => {
      b.style.border = '1px solid #ccc';
    });
    btn.style.border = '2px solid var(--primary-color)';
    selectedPayment = btn.dataset.payment;
  });
});

document.getElementById('place-order-btn')?.addEventListener('click', async () => {
  const user = requireAuth(['customer']);
  if (!user) return;

  if (cart.length === 0) {
    showToastMessage('Your cart is empty', true);
    return;
  }

  const shippingAddress = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    address: document.getElementById('address').value.trim(),
    city: document.getElementById('city').value.trim(),
    zipCode: document.getElementById('zipCode').value.trim(),
    phone: document.getElementById('phone')?.value.trim() || '',
  };

  if (Object.values(shippingAddress).some((v) => !v && v !== shippingAddress.phone)) {
    showToastMessage('Please fill all shipping fields', true);
    return;
  }

  const items = cart.map((item) => ({
    productId: item._id,
    quantity: item.quantity,
  }));

  try {
    const data = await API.orders.create({
      items,
      shippingAddress,
      paymentMethod: selectedPayment,
    });
    localStorage.removeItem('cart');
    showToastMessage('Order placed successfully!');
    setTimeout(() => {
      window.location.href = `/orders?orderId=${data.order._id}`;
    }, 800);
  } catch (err) {
    showToastMessage(formatApiError(err), true);
  }
});

if (!API.getUser()) {
  showToastMessage('Please login as a customer to checkout');
  setTimeout(() => {
    window.location.href = '/login';
  }, 1500);
} else if (cart.length === 0) {
  showToastMessage('Your cart is empty');
} else {
  renderSummary();
}


