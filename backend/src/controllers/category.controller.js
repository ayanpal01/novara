const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('parentCategory', 'name slug');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, image, parentCategory, isActive } = req.body;
    
    // Check if slug already exists
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await Category.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const category = new Category({
      name,
      slug,
      description: description || '',
      image: image || '',
      parentCategory: parentCategory || null,
      isActive: isActive !== undefined ? isActive : true
    });
    
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description, image, parentCategory, isActive } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;
    category.image = image !== undefined ? image : category.image;
    category.parentCategory = parentCategory !== undefined ? parentCategory : category.parentCategory;
    category.isActive = isActive !== undefined ? isActive : category.isActive;

    if (name && name !== category.name) {
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check for child categories
    const children = await Category.countDocuments({ parentCategory: category._id });
    if (children > 0) {
      return res.status(400).json({ message: 'Cannot delete category with sub-categories. Reassign them first.' });
    }

    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
