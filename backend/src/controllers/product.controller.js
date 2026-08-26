const Product = require('../models/Product');
const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');

// Helper to convert legacy sizes to options/variants for Admin UI
const transformLegacyProduct = (product) => {
  const p = product.toObject ? product.toObject() : product;
  
  if ((!p.options || p.options.length === 0) && p.sizes && p.sizes.length > 0) {
    const sizeValues = [...new Set(p.sizes.map(s => s.size).filter(Boolean))].map(s => ({
      label: s,
      value: s.toLowerCase().replace(/[^a-z0-9]/g, '-')
    }));
    
    const colorValues = [...new Set(p.sizes.map(s => s.color).filter(Boolean))].map(c => ({
      label: c,
      value: c.toLowerCase().replace(/[^a-z0-9]/g, '-')
    }));
    
    const options = [];
    if (sizeValues.length > 0) options.push({ name: 'Size', values: sizeValues });
    if (colorValues.length > 0) options.push({ name: 'Color', values: colorValues });
    
    const variants = p.sizes.map(s => {
      const attributes = {};
      if (s.size) attributes['Size'] = s.size.toLowerCase().replace(/[^a-z0-9]/g, '-');
      if (s.color) attributes['Color'] = s.color.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      return {
        attributes,
        price: p.price,
        inventory: {
          quantity: s.stock || 0,
          reserved: 0,
          trackInventory: true
        },
        isActive: true
      };
    });
    
    p.options = options;
    p.variants = variants;
  }
  return p;
};

// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    
    let query = {};
    
    // Search
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }
    
    // Filters
    if (req.query.category) {
      const categoryDoc = await Category.findOne({ slug: req.query.category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        query.category = null; // No products should match
      }
    }
    if (req.query.size) query['sizes.size'] = req.query.size;
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }
    if (req.query.featured === 'true') query.isFeatured = true;

    // Sorting
    let sort = {};
    if (req.query.sort) {
      if (req.query.sort === 'price_asc') sort = { price: 1 };
      if (req.query.sort === 'price_desc') sort = { price: -1 };
      if (req.query.sort === 'newest') sort = { createdAt: -1 };
      if (req.query.sort === 'rating') sort = { rating: -1 };
    } else {
      sort = { createdAt: -1 }; // default newest
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));
      
    res.json({
      products: products.map(transformLegacyProduct),
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/:slug
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');
    if (product) {
      res.json(transformLegacyProduct(product));
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to upload buffer to Cloudinary
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      { folder: 'ecommerce-products' },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    stream.end(buffer);
  });
};

// POST /api/products (Admin)
exports.createProduct = async (req, res) => {
  try {
    const images = [];
    
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await streamUpload(file.buffer);
        images.push(result.secure_url);
      }
    }
    
    // Parse options and variants
    let options = [];
    if (req.body.options) {
       options = typeof req.body.options === 'string' ? JSON.parse(req.body.options) : req.body.options;
    }
    let variants = [];
    if (req.body.variants) {
       variants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants;
    }

    const product = new Product({
      ...req.body,
      images: images.length > 0 ? images : undefined,
      options,
      variants
    });
    
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/products/:id (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const images = [...product.images]; // Keep old images
    
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await streamUpload(file.buffer);
        images.push(result.secure_url);
      }
    }
    
    let options = product.options;
    if (req.body.options) {
       options = typeof req.body.options === 'string' ? JSON.parse(req.body.options) : req.body.options;
    }
    let variants = product.variants;
    if (req.body.variants) {
       variants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants;
    }

    Object.assign(product, req.body, { images, options, variants });
    
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/products/:id (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
