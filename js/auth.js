document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const expectedRole = document.getElementById('userRole')?.value;

  try {
    const data = await API.auth.login({ email, password });
    if (expectedRole && data.user.role !== expectedRole) {
      showToastMessage(`This account is a ${data.user.role}, not ${expectedRole}`, true);
      return;
    }
    API.setAuth(data.token, data.user);
    showToastMessage('Login successful!');
    setTimeout(() => redirectByRole(data.user.role), 500);
  } catch (err) {
    showToastMessage(formatApiError(err), true);
  }
});

document.getElementById('register-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const role = document.getElementById('userRole').value;
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const storeName = document.getElementById('storeName')?.value.trim();

  if (password !== confirmPassword) {
    showToastMessage('Passwords do not match', true);
    return;
  }

  if (role === 'vendor' && !storeName) {
    showToastMessage('Store name is required for vendors', true);
    return;
  }

  try {
    const body = { firstName, lastName, email, password, role };
    if (role === 'vendor') body.storeName = storeName;
    await API.auth.register(body);
    window.location.href = '/login?registered=true';
  } catch (err) {
    showToastMessage(formatApiError(err), true);
  }
});

const storeNameGroup = document.getElementById('storeNameGroup');
document.getElementById('userRole')?.addEventListener('change', (e) => {
  if (storeNameGroup) {
    storeNameGroup.style.display = e.target.value === 'vendor' ? 'block' : 'none';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('registered') === 'true') {
    showToastMessage('You have successfully created the account');
  }
});


