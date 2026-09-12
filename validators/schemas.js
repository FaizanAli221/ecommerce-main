const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['customer', 'vendor']).default('customer'),
    storeName: z.string().max(100).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const productCreateSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().min(10),
    price: z.coerce.number().positive(),
    category: z.enum(['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Beauty']),
    image: z.string().url(),
    stock: z.coerce.number().int().min(0),
  }),
});

const productUpdateSchema = z.object({
  body: z
    .object({
      name: z.string().min(1).max(200).optional(),
      description: z.string().min(10).optional(),
      price: z.coerce.number().positive().optional(),
      category: z.enum(['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Beauty']).optional(),
      image: z.string().url().optional(),
      stock: z.coerce.number().int().min(0).optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' }),
  params: z.object({ id: z.string().min(1) }),
});

const orderCreateSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.coerce.number().int().min(1),
        })
      )
      .min(1),
    shippingAddress: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      address: z.string().min(1),
      city: z.string().min(1),
      zipCode: z.string().min(1),
      phone: z.string().optional(),
    }),
    paymentMethod: z.enum(['card', 'paypal', 'cod']).default('card'),
  }),
});

const reviewSchema = z.object({
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().min(3).max(1000),
  }),
  params: z.object({ productId: z.string().min(1) }),
});

const orderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
    trackingNumber: z.string().optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
});

const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

module.exports = {
  registerSchema,
  loginSchema,
  productCreateSchema,
  productUpdateSchema,
  orderCreateSchema,
  reviewSchema,
  orderStatusSchema,
  idParamSchema,
};

