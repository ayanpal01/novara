const mongoose = require('mongoose');
const Category = require('./backend/src/models/Category');

mongoose.connect('mongodb://localhost:27017/shop', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  try {
    const category = new Category({
      name: "Test",
      slug: "test-slug",
      description: "",
      image: "",
      parentCategory: null,
      isActive: true
    });
    await category.save();
    console.log("Success");
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
});
