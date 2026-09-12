const user = requireAuth();

const pathParts = window.location.pathname.split('/');
const productId = pathParts[pathParts.length - 1];

async function loadProduct() {
  const container = document.getElementById('product-detail');
  try {
    const { product, reviews } = await API.products.get(productId);
    document.title = `${product.name} | NexMart`;

    container.innerHTML = `
      <div class="product-detail-grid">
        <img src="${product.image}" alt="${product.name}" class="detail-image">
        <div class="detail-info">
          <span class="product-vendor">Sold by ${product.vendorName}</span>
          <h1>${product.name}</h1>
          <div class="product-rating">
            <i class='bx bxs-star'></i>
            <span>${product.rating || 0} (${product.reviewCount || 0} reviews)</span>
          </div>
          <p class="detail-price">${formatPrice(product.price)}</p>
          <p class="detail-desc">${product.description}</p>
          <div class="detail-meta">
            <span><i class='bx bx-category'></i> ${product.category}</span>
            <span><i class='bx bx-package'></i> ${product.stock > 0 ? product.stock + ' in stock' : 'Out of stock'}</span>
            <span><i class='bx bx-store'></i> ${product.vendorName}</span>
          </div>
          <button class="cta-button" id="add-detail-cart" ${product.stock < 1 ? 'disabled' : ''}>
            Add to Cart <i class='bx bx-shopping-bag'></i>
          </button>
        </div>
      </div>
      <section class="reviews-section">
        <h2>Customer Reviews</h2>
        <div id="reviews-list">${renderReviews(reviews)}</div>
        ${API.getUser()?.role === 'customer' ? renderReviewForm() : '<p>Login as customer to leave a review.</p>'}
      </section>
    `;

    document.getElementById('add-detail-cart')?.addEventListener('click', () => {
      addProductToCart(product);
    });

    document.getElementById('review-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await API.reviews.create(productId, {
          rating: Number(document.getElementById('review-rating').value),
          comment: document.getElementById('review-comment').value.trim(),
        });
        showToastMessage('Review submitted!');
        loadProduct();
      } catch (err) {
        showToastMessage(formatApiError(err), true);
      }
    });
  } catch (err) {
    const msg = formatApiError(err);
    container.innerHTML = `<div class="api-error-box"><p>${msg}</p><a href="/" class="cta-button">Back to shop</a></div>`;
  }
}

function renderReviews(reviews) {
  if (!reviews?.length) return '<p>No reviews yet. Be the first!</p>';
  return reviews
    .map(
      (r) => `
    <div class="review-card">
      <div class="review-header">
        <strong>${r.customerName}</strong>
        <span>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
      </div>
      <p>${r.comment}</p>
      <small>${formatDate(r.createdAt)}</small>
    </div>`
    )
    .join('');
}

function renderReviewForm() {
  return `
    <form id="review-form" class="review-form">
      <h3>Write a Review</h3>
      <select id="review-rating" required>
        <option value="5">5 Stars</option>
        <option value="4">4 Stars</option>
        <option value="3">3 Stars</option>
        <option value="2">2 Stars</option>
        <option value="1">1 Star</option>
      </select>
      <textarea id="review-comment" placeholder="Share your experience..." required minlength="3"></textarea>
      <button type="submit" class="cta-button">Submit Review</button>
    </form>`;
}

function addProductToCart(product) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find((item) => item._id === product._id);
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
  localStorage.setItem('cart', JSON.stringify(cart));
  showToastMessage('Added to cart!');
}

loadProduct();


