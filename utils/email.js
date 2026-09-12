const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const transport = getTransporter();
  const from = process.env.EMAIL_FROM || 'NexMart <noreply@nexmart.com>';

  if (!transport) {
    console.log('[Email — dev mode]', { to, subject, text: text || html });
    return { dev: true };
  }

  return transport.sendMail({ from, to, subject, html, text });
}

async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to NexMart',
    html: `<h2>Welcome, ${user.firstName}!</h2>
      <p>Your ${user.role} account has been created successfully.</p>
      <p><a href="http://localhost:${process.env.PORT || 3000}">Start shopping</a></p>`,
    text: `Welcome, ${user.firstName}! Your ${user.role} account is ready.`,
  });
}

async function sendOrderConfirmationEmail(user, order) {
  const itemsList = order.items
    .map((i) => `${i.name} x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`)
    .join('<br>');

  return sendEmail({
    to: user.email,
    subject: `Order Confirmed #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `<h2>Thank you for your order!</h2>
      <p>Order ID: <strong>${order._id}</strong></p>
      <p>Status: <strong>${order.status}</strong></p>
      <p>Total: <strong>$${order.total.toFixed(2)}</strong></p>
      <h3>Items</h3><p>${itemsList}</p>
      <p>Track your order in your account.</p>`,
    text: `Order ${order._id} confirmed. Total: $${order.total.toFixed(2)}`,
  });
}

async function sendOrderStatusEmail(user, order) {
  return sendEmail({
    to: user.email,
    subject: `Order Update — ${order.status}`,
    html: `<h2>Order status updated</h2>
      <p>Order <strong>${order._id}</strong> is now <strong>${order.status}</strong>.</p>
      ${order.trackingNumber ? `<p>Tracking: ${order.trackingNumber}</p>` : ''}`,
    text: `Order ${order._id} status: ${order.status}`,
  });
}

async function sendVendorOrderEmail(vendor, order) {
  const vendorItems = order.items.filter(
    (i) => i.vendor.toString() === vendor._id.toString()
  );
  if (vendorItems.length === 0) return null;

  return sendEmail({
    to: vendor.email,
    subject: 'New order for your store',
    html: `<h2>New order received</h2>
      <p>You have ${vendorItems.length} item(s) in order ${order._id}.</p>
      <p>Check your vendor dashboard to fulfill.</p>`,
    text: `New order ${order._id} includes your products.`,
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendVendorOrderEmail,
};

