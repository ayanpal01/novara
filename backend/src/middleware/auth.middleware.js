const User = require('../models/User');
const { getAuth } = require('firebase-admin/auth');

// Middleware to verify Firebase authentication token
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    require('fs').appendFileSync('auth-errors.log', new Date().toISOString() + ': ' + error.toString() + '\\n');
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Middleware to sync Firebase user with MongoDB and attach to req.user
const syncUser = async (req, res, next) => {
  try {
    if (!req.firebaseUser) {
      return res.status(401).json({ message: 'Not authorized, no firebase user' });
    }

    const { uid: firebaseUid, email, name, picture } = req.firebaseUser;

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      // Check if user exists with the same email (if manual signup was used before Google)
      user = await User.findOne({ email });
      if (user) {
        // Link firebaseUid to existing user
        user.firebaseUid = firebaseUid;
        await user.save();
      } else {
        // Create user if they don't exist yet in our DB.
        user = await User.create({
          firebaseUid,
          name: name || email.split('@')[0], 
          email: email,
          avatar: picture || '',
        });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized, token failed during sync' });
  }
};

// Middleware to check for Admin role
const adminCheck = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, syncUser, admin: adminCheck };
