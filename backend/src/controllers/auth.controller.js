const User = require('../models/User');

exports.getMe = async (req, res) => {
  // req.user is set by the syncUser middleware
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

exports.syncFirebaseUser = async (req, res) => {
  try {
    const { firebaseUid, email, name, avatar } = req.body;
    
    if (!firebaseUid) {
      return res.status(400).json({ message: 'firebaseUid is required' });
    }

    let user = await User.findOne({ firebaseUid });

    if (user) {
      user.email = email || user.email;
      user.name = name || user.name;
      user.avatar = avatar || user.avatar;
      await user.save();
    } else {
      // Fallback check by email
      user = await User.findOne({ email });
      if (user) {
        user.firebaseUid = firebaseUid;
        await user.save();
      } else {
        user = await User.create({
          firebaseUid,
          email,
          name: name || email?.split('@')[0] || 'User',
          avatar
        });
      }
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
