# NexMart — Multi-Vendor E-Commerce

Full-stack marketplace built with **Express.js**, **MongoDB**, and vanilla **HTML/CSS/JavaScript**.

## Features

- Product listings, search, and category filters
- Shopping cart and checkout with order processing
- **Customer**, **Vendor**, and **Admin** roles
- Vendor dashboard: add/edit/delete products, view orders, update status
- Admin dashboard: manage users, products, and orders
- Product detail page with **reviews & ratings**
- **Order tracking** by tracking number or order ID
- **Email notifications** (console in dev; SMTP when configured)
- Mobile-first responsive UI

## Requirements

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/) running locally (or MongoDB Atlas URI)

## Setup

```bash
npm install
cp .env.example .env
# Edit .env if needed (MongoDB URI, SMTP, JWT secret)
npm start
```

Open http://localhost:3000

## Author & Maintainer
- **Faizan Ali** ([fa577207@gmail.com](mailto:fa577207@gmail.com))

## Demo accounts (auto-seeded on first run)

| Role     | Email                 | Password        |
|----------|-----------------------|-----------------|
| Admin    | fa577207@gmail.com    | Admin@12345     |
| Vendor   | vendor1@nexmart.com   | Vendor@12345    |
| Customer | customer@nexmart.com  | Customer@12345  |

## Email (optional)

Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` in `.env`. Without SMTP, emails are logged to the server console.

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register customer/vendor |
| POST | `/api/auth/login` | Login |
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | Product + reviews |
| POST | `/api/orders` | Place order (customer) |
| GET | `/api/orders/my` | Customer orders |
| GET | `/api/orders/track` | Track order |
| GET | `/api/vendor/stats` | Vendor dashboard |
| GET | `/api/admin/dashboard` | Admin stats |

## Project structure

```
config/         Database connection
models/         User, Product, Order, Review
routes/         API routes
controllers/    Business logic
middleware/     Auth, validation (Zod)
js/             Frontend API client & pages
pages/          HTML pages
css/            Styles
```
