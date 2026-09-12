let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const productContainer = document.getElementById('product-container');
const cartIcon = document.getElementById('cart-icon');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCart = document.getElementById('close-cart');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartBadge = document.getElementById('cart-badge');
const productModal = document.getElementById('product-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.getElementById('close-modal');

async function init() {
  await loadProducts();
  updateCartUI();
  updateNavUser();
  setupCategoryCards();
}

function showSkeleton() {
  if (!productContainer) return;
  productContainer.innerHTML = Array(8)
    .fill(
      `<div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-text"></div><div class="skeleton-text short"></div></div>`
    )
    .join('');
  productContainer.className = 'skeleton-grid';
}

async function loadProducts(params = {}) {
  showSkeleton();
  try {
    const data = await API.products.list(params);
    products = data.products || [];
    productContainer.className = 'product-grid';
    if (typeof applySidebarFilters === 'function') {
      applySidebarFilters();
    } else {
      renderProducts(products);
    }
  } catch (err) {
    productContainer.className = 'product-grid';
    const msg = formatApiError(err);
    showToastMessage(msg, true);
    if (productContainer) {
      productContainer.innerHTML = `
        <div class="api-error-box" style="grid-column:1/-1">
          <i class='bx bx-wifi-off'></i>
          <p>${msg}</p>
          <button type="button" class="cta-button" onclick="location.reload()">Retry</button>
        </div>`;
    }
  }
}

function updateNavUser() {
  const user = API.getUser();
  const accountLink = document.querySelector('.nav-item.dropdown .nav-link');
  const dropdownMenu = document.querySelector('.nav-item.dropdown .dropdown-menu');
  const mobileNavPanel = document.querySelector('.mobile-nav-panel');

  if (user) {
    if (accountLink) {
      accountLink.innerHTML = `<i class='bx bx-user-circle'></i> ${user.firstName}`;
    }

    if (dropdownMenu) {
      let menuHtml = '';
      if (user.role === 'admin') {
        menuHtml += `<a href="/admin"><i class='bx bx-shield'></i> Admin Dashboard</a>`;
      } else if (user.role === 'vendor') {
        menuHtml += `<a href="/vendor"><i class='bx bx-store'></i> Vendor Portal</a>`;
      } else {
        menuHtml += `<a href="/orders"><i class='bx bx-package'></i> My Orders</a>`;
      }
      menuHtml += `<a href="#" id="nav-logout-btn"><i class='bx bx-log-out'></i> Logout</a>`;
      dropdownMenu.innerHTML = menuHtml;

      document.getElementById('nav-logout-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        API.clearAuth();
        window.location.href = '/login';
      });
    }

    if (mobileNavPanel) {
      let mobileHtml = `
        <button type="button" class="mobile-nav-close" id="mobile-nav-close"><i class='bx bx-x'></i></button>
        <a href="/">Home</a>
        <a href="#categories">Categories</a>
      `;
      if (user.role === 'admin') {
        mobileHtml += `<a href="/admin">Admin Dashboard</a>`;
      } else if (user.role === 'vendor') {
        mobileHtml += `<a href="/vendor">Vendor Portal</a>`;
      } else {
        mobileHtml += `<a href="/orders">My Orders</a>`;
      }
      mobileHtml += `<a href="#" id="mobile-logout-btn">Logout</a>`;
      mobileNavPanel.innerHTML = mobileHtml;

      document.getElementById('mobile-nav-close')?.addEventListener('click', closeMobileNav);
      document.getElementById('mobile-logout-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        API.clearAuth();
        window.location.href = '/login';
      });
    }
  } else {
    if (accountLink) {
      accountLink.innerHTML = `<i class='bx bx-user-circle'></i> Account`;
    }
    if (dropdownMenu) {
      dropdownMenu.innerHTML = `
        <a href="/login"><i class='bx bx-log-in'></i> Login</a>
        <a href="/register"><i class='bx bx-user-plus'></i> Register</a>
      `;
    }
    if (mobileNavPanel) {
      mobileNavPanel.innerHTML = `
        <button type="button" class="mobile-nav-close" id="mobile-nav-close"><i class='bx bx-x'></i></button>
        <a href="/">Home</a>
        <a href="#categories">Categories</a>
        <a href="/login">Login</a>
        <a href="/register">Register</a>
        <a href="/vendor">Sell on NexMart</a>
      `;
      document.getElementById('mobile-nav-close')?.addEventListener('click', closeMobileNav);
    }
  }
}


function renderProducts(productsToRender) {
  if (!productContainer) return;
  productContainer.innerHTML = '';

  if (productsToRender.length === 0) {
    productContainer.innerHTML =
      '<p style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted)">No products found.</p>';
    return;
  }

  productsToRender.forEach((product) => {
    const id = product._id;
    const el = document.createElement('div');
    el.classList.add('product-card');
    const badge =
      product.rating >= 4.5
        ? '<span class="product-badge">Top Rated</span>'
        : product.stock < 10
          ? '<span class="product-badge">Low Stock</span>'
          : '';
    el.innerHTML = `
      <div class="product-image-wrap" onclick="openProductDetail('${id}')">
        ${badge}
        <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
      </div>
      <div class="product-info">
        <span class="product-vendor">${product.vendorName}</span>
        <a href="/product/${id}" class="product-name">${product.name}</a>
        <div class="product-rating">
          <i class='bx bxs-star'></i>
          <span>${product.rating || 0} · ${product.reviewCount || 0} reviews</span>
        </div>
        <div class="product-bottom">
          <span class="product-price">${formatPrice(product.price)}</span>
          <button type="button" class="add-to-cart-btn" onclick="event.stopPropagation();addToCart('${id}')" aria-label="Add to cart">
            <i class='bx bx-cart-add'></i>
          </button>
        </div>
      </div>
    `;
    productContainer.appendChild(el);
  });
}

function getProductById(id) {
  return products.find((p) => p._id === id);
}

async function addToCart(productId) {
  let product = getProductById(productId);
  if (!product) {
    try {
      const data = await API.products.get(productId);
      product = data.product;
    } catch {
      showToastMessage('Product not found', true);
      return;
    }
  }

  const existing = cart.find((item) => item._id === productId);
  if (existing) existing.quantity += 1;
  else {
    cart.push({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      vendorName: product.vendorName,
      quantity: 1,
    });
  }

  saveCart();
  updateCartUI();
  showToastMessage(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item._id !== productId);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
  if (!cartBadge) return;
  cartBadge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!cartItemsContainer) return;
  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <i class='bx bx-shopping-bag'></i>
        <p>Your cart is empty</p>
        <a href="#products" class="cta-button" style="margin-top:1rem;font-size:0.9rem;padding:0.65rem 1.25rem" onclick="document.getElementById('cart-sidebar').classList.remove('open');document.getElementById('cart-overlay').classList.remove('open')">Browse Products</a>
      </div>`;
    if (cartTotalPrice) cartTotalPrice.textContent = formatPrice(0);
    return;
  }

  cartItemsContainer.innerHTML = '';

  cart.forEach((item) => {
    total += item.price * item.quantity;
    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item');
    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <h4 class="cart-item-name">${item.name}</h4>
        <p class="cart-item-price">${item.quantity} x ${formatPrice(item.price)}</p>
      </div>
      <button onclick="removeFromCart('${item._id}')"><i class='bx bx-trash'></i></button>
    `;
    cartItemsContainer.appendChild(cartItem);
  });

  if (cartTotalPrice) cartTotalPrice.textContent = formatPrice(total);
}

async function openProductDetail(productId) {
  let product = getProductById(productId);
  if (!product) {
    try {
      const data = await API.products.get(productId);
      product = data.product;
    } catch {
      window.location.href = `/product/${productId}`;
      return;
    }
  }

  modalBody.innerHTML = `
    <div class="modal-image">
      <img src="${product.image}" alt="${product.name}" style="width:100%;border-radius:1rem;">
    </div>
    <div class="modal-info">
      <span class="product-vendor">${product.vendorName}</span>
      <h2 style="font-size:2rem;margin-bottom:1rem;">${product.name}</h2>
      <div class="product-rating" style="margin-bottom:1.5rem;">
        <i class='bx bxs-star'></i>
        <span>${product.rating || 0} (${product.reviewCount || 0} reviews)</span>
      </div>
      <p style="color:var(--text-muted);margin-bottom:2rem;">${product.description}</p>
      <div style="font-size:2rem;font-weight:700;margin-bottom:2rem;">${formatPrice(product.price)}</div>
      <div style="display:flex;gap:1rem;flex-wrap:wrap;">
        <button class="cta-button" onclick="addToCart('${product._id}')" style="flex:1;justify-content:center;">
          Add to Cart <i class='bx bx-shopping-bag'></i>
        </button>
        <a href="/product/${product._id}" class="cta-button" style="flex:1;justify-content:center;background:var(--bg-secondary);color:var(--text-main);display:flex;align-items:center;">
          Full Details
        </a>
      </div>
    </div>
  `;
  productModal.style.display = 'flex';
}

function setupCategoryCards() {
  document.querySelectorAll('.category-card').forEach((card) => {
    card.addEventListener('click', () => {
      const category = card.dataset.category || card.querySelector('h3')?.textContent;
      if (category) loadProducts({ category });
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

if (cartIcon) {
  cartIcon.addEventListener('click', (e) => {
    e.preventDefault();
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
  });
}

if (closeCart) {
  closeCart.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
  });
}

if (cartOverlay) {
  cartOverlay.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
  });
}

if (closeModal) {
  closeModal.addEventListener('click', () => {
    productModal.style.display = 'none';
  });
}

window.addEventListener('click', (e) => {
  if (e.target === productModal) productModal.style.display = 'none';
});

const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => loadProducts({ search: e.target.value }), 300);
  });
}

document.querySelectorAll('.filter-tabs button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter-tabs button.active')?.classList.remove('active');
    btn.classList.add('active');
    const label = btn.textContent;
    if (label === 'All') loadProducts();
    else if (label === 'Top Rated') loadProducts({ sort: 'rating' });
    else loadProducts({ category: label });
  });
});

document.querySelector('.checkout-btn')?.addEventListener('click', () => {
  if (cart.length === 0) {
    showToastMessage('Your cart is empty!', true);
    return;
  }
  if (!API.getUser()) {
    showToastMessage('Please login to checkout');
    window.location.href = '/login';
    return;
  }
  window.location.href = '/checkout';
});

document.querySelector('.vendor-cta .btn-primary')?.addEventListener('click', () => {
  window.location.href = '/register';
});

// --- DYNAMIC FASHION FILTERS OVERLAY ---
const colorMap = {
  blue: ['Wireless Noise Cancelling Headphones', 'Portable Bluetooth Speaker', 'Classic Denim Jacket', 'Smart Fitness Tracker Band', 'Stainless Steel Insulated Water Bottle'],
  black: ['Wireless Noise Cancelling Headphones', 'Minimalist Leather Watch', 'Smart Home Security Camera', 'Ergonomic Office Chair', 'Professional Camera Lens', 'Polarized Sports Sunglasses', 'Mechanical Backlit Gaming Keyboard', 'Ergonomic Wireless Mouse'],
  white: ['Rose Water Hydrating Face Mist', 'Smart Home Security Camera', 'Soy Wax Scented Candles (Set of 3)', 'Organic Coconut Hair Oil'],
  red: ['Smart Fitness Tracker Band', 'Organic Cotton Hoodie', 'Ergonomic Wireless Mouse'],
  yellow: ['Minimalist Leather Watch', 'Soy Wax Scented Candles (Set of 3)'],
  green: ['Yoga Mat with Carrier', 'Canvas Travel Duffle Bag', 'Stainless Steel Insulated Water Bottle'],
  pink: ['Rose Water Hydrating Face Mist', 'Organic Cotton Hoodie']
};

function applySidebarFilters() {
  const checkedCategories = Array.from(document.querySelectorAll('.filters-sidebar input[name="category"]:checked')).map(cb => cb.value);
  const maxPriceInput = document.getElementById('price-slider-input');
  const maxPrice = maxPriceInput ? Number(maxPriceInput.value) : 1000;
  
  // Update price display text
  const priceValDisplay = document.getElementById('price-slider-val');
  if (priceValDisplay) {
    priceValDisplay.textContent = formatPrice(maxPrice);
  }

  const activeColorSwatch = document.querySelector('.color-swatch.active');
  const selectedColor = activeColorSwatch ? activeColorSwatch.dataset.color : 'all';

  let filtered = [...products];

  // 1. Filter by category checkbox list
  if (checkedCategories.length > 0) {
    filtered = filtered.filter(p => checkedCategories.includes(p.category));
  }

  // 2. Filter by price slider
  filtered = filtered.filter(p => p.price <= maxPrice);

  // 3. Filter by color swatch
  if (selectedColor && selectedColor !== 'all') {
    const validProductNames = colorMap[selectedColor] || [];
    filtered = filtered.filter(p => {
      const nameMatch = validProductNames.some(name => p.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(p.name.toLowerCase()));
      const keywordMatch = p.name.toLowerCase().includes(selectedColor) || p.description.toLowerCase().includes(selectedColor);
      return nameMatch || keywordMatch;
    });
  }

  renderProducts(filtered);
}

function setupSidebarFilters() {
  // 1. Listen for Category checkbox changes
  document.querySelectorAll('.filters-sidebar input[name="category"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = Array.from(document.querySelectorAll('.filters-sidebar input[name="category"]:checked')).map(c => c.value);
      const tabs = document.querySelectorAll('.filter-tabs button');
      tabs.forEach(tab => tab.classList.remove('active'));
      
      if (checked.length === 1) {
        tabs.forEach(tab => {
          if (tab.textContent === checked[0]) tab.classList.add('active');
        });
      } else if (checked.length === 0) {
        tabs.forEach(tab => {
          if (tab.textContent === 'All') tab.classList.add('active');
        });
      }
      
      applySidebarFilters();
    });
  });

  // 2. Listen for Price Slider input
  const priceSlider = document.getElementById('price-slider-input');
  if (priceSlider) {
    priceSlider.addEventListener('input', applySidebarFilters);
  }

  // 3. Listen for Color Swatch clicks
  document.querySelectorAll('.color-swatches .color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.color-swatches .color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      applySidebarFilters();
    });
  });

  // 4. Listen for Clear All click
  const clearBtn = document.getElementById('clear-filters-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document.querySelectorAll('.filters-sidebar input[name="category"]').forEach(cb => cb.checked = false);
      if (priceSlider) {
        priceSlider.value = 1000;
      }
      document.querySelectorAll('.color-swatches .color-swatch').forEach(s => s.classList.remove('active'));
      const allColorSwatch = document.querySelector('.color-swatches .color-swatch[data-color="all"]');
      if (allColorSwatch) {
        allColorSwatch.classList.add('active');
      }

      document.querySelectorAll('.filter-tabs button').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent === 'All') tab.classList.add('active');
      });

      applySidebarFilters();
    });
  }
}

// 5. Connect bi-directional tab-sidebar synchronization
document.querySelectorAll('.filter-tabs button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const label = btn.textContent;
    
    // Clear all checkboxes
    document.querySelectorAll('.filters-sidebar input[name="category"]').forEach(cb => cb.checked = false);
    
    if (label !== 'All' && label !== 'Top Rated') {
      const cb = document.querySelector(`.filters-sidebar input[name="category"][value="${label}"]`);
      if (cb) cb.checked = true;
    }
    
    const priceSlider = document.getElementById('price-slider-input');
    if (priceSlider) priceSlider.value = 1000;
    
    document.querySelectorAll('.color-swatches .color-swatch').forEach(s => s.classList.remove('active'));
    document.querySelector('.color-swatches .color-swatch[data-color="all"]')?.classList.add('active');
    
    // Trigger filters apply
    applySidebarFilters();
  });
});

// Run Init and Filters Setup
init();
setupSidebarFilters();


