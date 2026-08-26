const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB.');
    const result = await User.updateMany({}, { $set: { role: 'admin' } });
    console.log(`Promoted ${result.modifiedCount} user(s) to admin.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
