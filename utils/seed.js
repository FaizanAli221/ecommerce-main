const User = require('../models/User');
const Product = require('../models/Product');

const sampleProducts = [
  {
    name: 'Wireless Noise Cancelling Headphones',
    price: 299.99,
    category: 'Electronics',
    vendorName: 'TechGadgets Pro',
    rating: 4.8,
    reviewCount: 124,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    description:
      'Experience premium sound quality with our latest noise-cancelling technology. Perfect for travel and focused work.',
    stock: 45,
  },
  {
    name: 'Minimalist Leather Watch',
    price: 149.0,
    category: 'Fashion',
    vendorName: 'Timeless Crafts',
    rating: 4.6,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    description:
      'A sleek, minimalist timepiece designed for the modern individual. Features genuine Italian leather and Swiss movement.',
    stock: 30,
  },
  {
    name: 'Smart Home Security Camera',
    price: 79.99,
    category: 'Electronics',
    vendorName: 'SecureHome',
    rating: 4.5,
    reviewCount: 210,
    image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=500&q=80',
    description:
      'Keep an eye on your home from anywhere with our 1080p HD smart camera. Features night vision and two-way audio.',
    stock: 12,
  },
  {
    name: 'Organic Cotton Hoodie',
    price: 55.0,
    category: 'Fashion',
    vendorName: 'EcoWear',
    rating: 4.9,
    reviewCount: 45,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80',
    description: 'Super soft, sustainably sourced organic cotton hoodie. Designed for comfort and durability.',
    stock: 80,
  },
  {
    name: 'Portable Bluetooth Speaker',
    price: 45.0,
    category: 'Electronics',
    vendorName: 'SonicBlast',
    rating: 4.4,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80',
    description:
      'Waterproof portable speaker with 20 hours of battery life. Deep bass and crystal clear sound for your outdoor adventures.',
    stock: 60,
  },
  {
    name: 'Ergonomic Office Chair',
    price: 249.0,
    category: 'Home & Living',
    vendorName: 'ComfortWorks',
    rating: 4.7,
    reviewCount: 320,
    image: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=500&q=80',
    description:
      'Fully adjustable ergonomic chair designed to support your posture during long work hours. Premium breathable mesh.',
    stock: 15,
  },
  {
    name: 'Professional Camera Lens',
    price: 899.0,
    category: 'Electronics',
    vendorName: 'Optix Pro',
    rating: 4.9,
    reviewCount: 67,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80',
    description:
      'Ultra-sharp prime lens for professional photographers. Stunning bokeh and incredible low-light performance.',
    stock: 8,
  },
  {
    name: 'Yoga Mat with Carrier',
    price: 35.0,
    category: 'Sports',
    vendorName: 'ZenFlow',
    rating: 4.6,
    reviewCount: 112,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&q=80',
    description:
      'Non-slip eco-friendly yoga mat with extra cushioning. Includes a convenient carrying strap for travel.',
    stock: 100,
  },
  {
    name: 'Rose Water Hydrating Face Mist',
    price: 18.50,
    category: 'Beauty',
    vendorName: 'GlowBeauty',
    rating: 4.7,
    reviewCount: 82,
    image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=500&q=80',
    description:
      'Revitalize your skin with our 100% organic, steam-distilled rose water mist. Hydrates, tones, and refreshes all skin types.',
    stock: 120,
  },
  {
    name: 'Organic Coconut Hair Oil',
    price: 24.00,
    category: 'Beauty',
    vendorName: 'GlowBeauty',
    rating: 4.5,
    reviewCount: 64,
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=500&q=80',
    description:
      'Extra virgin, cold-pressed coconut oil infused with nourishing herbs. Restores shine, strengthens roots, and promotes healthy hair growth.',
    stock: 95,
  },
  {
    name: 'Smart Fitness Tracker Band',
    price: 49.99,
    category: 'Sports',
    vendorName: 'ZenFlow',
    rating: 4.3,
    reviewCount: 198,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80',
    description:
      'Track your steps, heart rate, sleep quality, and workouts. Features a high-res color touchscreen and 10-day battery life.',
    stock: 40,
  },
  {
    name: 'Stainless Steel Insulated Water Bottle',
    price: 28.00,
    category: 'Sports',
    vendorName: 'ZenFlow',
    rating: 4.8,
    reviewCount: 312,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80',
    description:
      'Double-wall vacuum insulated bottle keeps drinks ice-cold for 24 hours or piping hot for 12. Leak-proof and BPA-free.',
    stock: 150,
  },
  {
    name: 'Ceramic Non-Stick Cookware Set',
    price: 189.99,
    category: 'Home & Living',
    vendorName: 'ComfortWorks',
    rating: 4.6,
    reviewCount: 145,
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&q=80',
    description:
      'Premium 10-piece non-stick ceramic pots and pans set. Eco-friendly, toxin-free coating for effortless cooking and cleaning.',
    stock: 25,
  },
  {
    name: 'Soy Wax Scented Candles (Set of 3)',
    price: 29.99,
    category: 'Home & Living',
    vendorName: 'ComfortWorks',
    rating: 4.7,
    reviewCount: 215,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&q=80',
    description:
      'Hand-poured natural soy wax candles with lavender, vanilla, and eucalyptus essential oils. Eco-friendly cotton wicks.',
    stock: 85,
  },
  {
    name: 'Canvas Travel Duffle Bag',
    price: 69.00,
    category: 'Fashion',
    vendorName: 'EcoWear',
    rating: 4.9,
    reviewCount: 76,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
    description:
      'Spacious and rugged duffle bag crafted from water-resistant canvas and full-grain leather details. Perfect weekend getaway companion.',
    stock: 30,
  },
  {
    name: 'Polarized Sports Sunglasses',
    price: 39.99,
    category: 'Fashion',
    vendorName: 'Timeless Crafts',
    rating: 4.4,
    reviewCount: 118,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80',
    description:
      'UV400 protection polarized lenses block glare, perfect for running, cycling, or outdoor adventure. Lightweight flexible frames.',
    stock: 75,
  },
  {
    name: 'Classic Denim Jacket',
    price: 75.00,
    category: 'Fashion',
    vendorName: 'EcoWear',
    rating: 4.6,
    reviewCount: 92,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80',
    description:
      'Timeless denim jacket made from 100% recycled cotton. Features a relaxed fit, button closure, and chest pockets.',
    stock: 45,
  },
  {
    name: 'Vintage Leather Backpack',
    price: 110.00,
    category: 'Fashion',
    vendorName: 'Timeless Crafts',
    rating: 4.8,
    reviewCount: 104,
    image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=500&q=80',
    description:
      'Beautifully handcrafted vintage leather backpack with adjustable straps and secure brass buckles. Spacious main compartment.',
    stock: 20,
  },
  {
    name: 'Mechanical Backlit Gaming Keyboard',
    price: 89.99,
    category: 'Electronics',
    vendorName: 'TechGadgets Pro',
    rating: 4.8,
    reviewCount: 240,
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&q=80',
    description:
      'Tactile blue switches mechanical keyboard with vibrant RGB backlighting and customizable lighting profiles. Anti-ghosting keys.',
    stock: 50,
  },
  {
    name: 'Ergonomic Wireless Mouse',
    price: 34.99,
    category: 'Electronics',
    vendorName: 'TechGadgets Pro',
    rating: 4.6,
    reviewCount: 185,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80',
    description:
      'Comfortable contoured design wireless mouse with adjustable DPI and silent clicks. Connects seamlessly up to 10 meters.',
    stock: 65,
  },
];

async function seedDatabase() {
  const productCount = await Product.countDocuments();
  if (productCount > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'fa577207@gmail.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      firstName: process.env.ADMIN_FIRST_NAME || 'Faizan',
      lastName: process.env.ADMIN_LAST_NAME || 'Ali',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
    });
    console.log(`Admin created: ${adminEmail}`);
  }

  const vendorStores = [
    { storeName: 'TechGadgets Pro', email: 'vendor1@nexmart.com', firstName: 'Tech', lastName: 'Gadgets' },
    { storeName: 'Timeless Crafts', email: 'vendor2@nexmart.com', firstName: 'Timeless', lastName: 'Crafts' },
    { storeName: 'SecureHome', email: 'vendor3@nexmart.com', firstName: 'Secure', lastName: 'Home' },
    { storeName: 'EcoWear', email: 'vendor4@nexmart.com', firstName: 'Eco', lastName: 'Wear' },
    { storeName: 'SonicBlast', email: 'vendor5@nexmart.com', firstName: 'Sonic', lastName: 'Blast' },
    { storeName: 'ComfortWorks', email: 'vendor6@nexmart.com', firstName: 'Comfort', lastName: 'Works' },
    { storeName: 'Optix Pro', email: 'vendor7@nexmart.com', firstName: 'Optix', lastName: 'Pro' },
    { storeName: 'ZenFlow', email: 'vendor8@nexmart.com', firstName: 'Zen', lastName: 'Flow' },
    { storeName: 'GlowBeauty', email: 'vendor9@nexmart.com', firstName: 'Glow', lastName: 'Beauty' },
  ];

  const vendorMap = {};
  for (const v of vendorStores) {
    let vendor = await User.findOne({ email: v.email });
    if (!vendor) {
      vendor = await User.create({
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        password: 'Vendor@12345',
        role: 'vendor',
        storeName: v.storeName,
      });
    }
    vendorMap[v.storeName] = vendor;
  }

  const customerExists = await User.findOne({ email: 'customer@nexmart.com' });
  if (!customerExists) {
    await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'customer@nexmart.com',
      password: 'Customer@12345',
      role: 'customer',
    });
  }

  for (const p of sampleProducts) {
    const vendor = vendorMap[p.vendorName];
    if (!vendor) continue;
    await Product.create({
      ...p,
      vendor: vendor._id,
    });
  }

  console.log('Database seeded with vendors, products, and demo accounts');
  console.log('Demo logins — Admin:', adminEmail, '| Vendor: vendor1@nexmart.com | Customer: customer@nexmart.com');
  console.log('Demo password: Admin@12345 / Vendor@12345 / Customer@12345');
}

module.exports = seedDatabase;

