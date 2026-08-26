const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Review = require('../models/Review');

dotenv.config({ path: '../../.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce-shop');
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();

    console.log('Data Cleared!');

    // Create Users
    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@example.com', role: 'admin', clerkId: 'admin_123' },
      { name: 'Test User', email: 'user@example.com', role: 'user', clerkId: 'user_123' }
    ]);
    console.log('Users Seeded');

    // Create Categories
    const categories = await Category.insertMany([
      { name: 'Men', slug: 'men', image: 'men-category.jpg' },
      { name: 'Women', slug: 'women', image: 'women-category.jpg' },
      { name: 'Kids', slug: 'kids', image: 'kids-category.jpg' },
      { name: 'Accessories', slug: 'accessories', image: 'acc-category.jpg' }
    ]);
    console.log('Categories Seeded');

    // Create Products
    const products = [
      // Men's Products
      {
        name: 'Essential Oversized T-Shirt',
        slug: 'essential-oversized-tshirt-men',
        description: 'A premium heavy-weight cotton oversized t-shirt designed for a relaxed, modern fit.',
        category: categories[0]._id,
        price: 34.99,
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1780&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1887&auto=format&fit=crop'
        ],
        stock: 100,
        sizes: [{ size: 'S', stock: 20 }, { size: 'M', stock: 40 }, { size: 'L', stock: 30 }, { size: 'XL', stock: 10 }],
        colors: ['White', 'Black', 'Olive'],
        isFeatured: true
      },
      {
        name: 'Slim Fit Denim Jeans',
        slug: 'slim-fit-denim-jeans',
        description: 'Classic raw blue slim fit denim jeans with a slight stretch for comfort.',
        category: categories[0]._id,
        price: 89.99,
        images: [
          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1887&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=1770&auto=format&fit=crop'
        ],
        stock: 50,
        sizes: [{ size: '30', stock: 10 }, { size: '32', stock: 20 }, { size: '34', stock: 15 }, { size: '36', stock: 5 }],
        colors: ['Indigo', 'Washed Blue'],
        isFeatured: true
      },
      {
        name: 'Wool Blend Overcoat',
        slug: 'wool-blend-overcoat-men',
        description: 'A sophisticated camel wool blend overcoat perfect for winter layering.',
        category: categories[0]._id,
        price: 189.99,
        images: [
          'https://images.unsplash.com/photo-1520975954732-57dd22299614?q=80&w=1887&auto=format&fit=crop'
        ],
        stock: 30,
        sizes: [{ size: 'M', stock: 10 }, { size: 'L', stock: 15 }, { size: 'XL', stock: 5 }],
        colors: ['Camel'],
        isFeatured: false
      },
      
      // Women's Products
      {
        name: 'Silk Slip Dress',
        slug: 'silk-slip-dress-women',
        description: 'An elegant midi-length silk slip dress with delicate spaghetti straps.',
        category: categories[1]._id,
        price: 110.00,
        images: [
          'https://images.unsplash.com/photo-1515347619253-1254a6db249b?q=80&w=1770&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1495385794356-15371f348c31?q=80&w=1740&auto=format&fit=crop'
        ],
        stock: 45,
        sizes: [{ size: 'XS', stock: 10 }, { size: 'S', stock: 15 }, { size: 'M', stock: 15 }, { size: 'L', stock: 5 }],
        colors: ['Champagne', 'Black'],
        isFeatured: true
      },
      {
        name: 'Chunky Knit Sweater',
        slug: 'chunky-knit-sweater-women',
        description: 'Stay cozy with this oversized chunky knit wool blend sweater.',
        category: categories[1]._id,
        price: 65.50,
        images: [
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1964&auto=format&fit=crop'
        ],
        stock: 60,
        sizes: [{ size: 'S', stock: 20 }, { size: 'M', stock: 25 }, { size: 'L', stock: 15 }],
        colors: ['Cream', 'Grey'],
        isFeatured: false
      },
      {
        name: 'High-Waisted Wide Leg Trousers',
        slug: 'high-waisted-wide-leg-trousers',
        description: 'Tailored high-waisted trousers with a sweeping wide leg silhouette.',
        category: categories[1]._id,
        price: 75.00,
        images: [
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1888&auto=format&fit=crop'
        ],
        stock: 40,
        sizes: [{ size: 'XS', stock: 5 }, { size: 'S', stock: 15 }, { size: 'M', stock: 15 }, { size: 'L', stock: 5 }],
        colors: ['Navy', 'Beige'],
        isFeatured: true
      },

      // Accessories
      {
        name: 'Minimalist Leather Watch',
        slug: 'minimalist-leather-watch',
        description: 'A timeless analog watch with a sleek black dial and genuine leather strap.',
        category: categories[3]._id,
        price: 145.00,
        images: [
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1888&auto=format&fit=crop'
        ],
        stock: 25,
        sizes: [], // One size
        colors: ['Black/Silver'],
        isFeatured: true
      },
      {
        name: 'Classic Aviator Sunglasses',
        slug: 'classic-aviator-sunglasses',
        description: 'Premium polarized aviator sunglasses with gold-tone frames.',
        category: categories[3]._id,
        price: 85.00,
        images: [
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1780&auto=format&fit=crop'
        ],
        stock: 50,
        sizes: [],
        colors: ['Gold/Green'],
        isFeatured: false
      },
      {
        name: 'Leather Crossbody Bag',
        slug: 'leather-crossbody-bag-acc',
        description: 'Elegant structured leather crossbody bag with adjustable strap and gold hardware.',
        category: categories[3]._id,
        price: 120.00,
        images: [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1769&auto=format&fit=crop'
        ],
        stock: 15,
        sizes: [],
        colors: ['Tan'],
        isFeatured: true
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log('Products Seeded');

    // Create Reviews
    await Review.create({
      user: users[1]._id,
      product: createdProducts[0]._id,
      rating: 5,
      comment: 'The fit is absolutely perfect. Extremely high quality cotton!'
    });
    
    await Review.create({
      user: users[1]._id,
      product: createdProducts[3]._id,
      rating: 4,
      comment: 'Beautiful dress, but runs slightly small.'
    });
    console.log('Reviews Seeded');

    // Create Orders
    await Order.create({
      user: users[1]._id,
      orderItems: [
        {
          product: createdProducts[0]._id,
          name: createdProducts[0].name,
          image: createdProducts[0].images[0],
          qty: 2,
          size: 'M',
          color: 'White',
          price: createdProducts[0].price
        },
        {
          product: createdProducts[6]._id,
          name: createdProducts[6].name,
          image: createdProducts[6].images[0],
          qty: 1,
          price: createdProducts[6].price
        }
      ],
      shippingAddress: {
        name: 'Test User',
        phone: '1234567890',
        address: '456 Novara Ave',
        city: 'Metropolis',
        state: 'NY',
        pincode: '10001'
      },
      paymentMethod: 'Razorpay',
      isPaid: true,
      paidAt: new Date(),
      itemsPrice: (createdProducts[0].price * 2) + createdProducts[6].price,
      shippingPrice: 0,
      taxPrice: 20.00,
      totalPrice: (createdProducts[0].price * 2) + createdProducts[6].price + 20.00,
      orderStatus: 'shipped',
      trackingId: 'TRK-NVRA-982347X'
    });

    console.log('Orders Seeded');
    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error('Error with data import:', error);
    process.exit(1);
  }
};

seedData();
