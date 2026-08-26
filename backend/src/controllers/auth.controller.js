const User = require('../models/User');

exports.getMe = async (req, res) => {
  // req.user is set by the syncUser middleware
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

exports.syncClerkUser = async (req, res) => {
  try {
    const { clerkId, email, name, avatar } = req.body;
    let user = await User.findOne({ clerkId });

    if (user) {
      user.email = email || user.email;
      user.name = name || user.name;
      user.avatar = avatar || user.avatar;
      await user.save();
    } else {
      user = await User.create({
        clerkId,
        email,
        name,
        avatar
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
