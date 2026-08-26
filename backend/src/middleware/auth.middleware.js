const User = require('../models/User');
const { getAuth } = require('@clerk/express');

// Middleware to verify Clerk authentication token
const protect = (req, res, next) => {
  const auth = getAuth(req);
  if (auth && auth.userId) {
    next();
  } else {
    console.log('Protect middleware failed: no auth.userId', auth);
    res.status(401).json({ message: 'Not authorized, no user ID' });
  }
};

// Middleware to sync Clerk user with MongoDB and attach to req.user
const syncUser = async (req, res, next) => {
  try {
    const auth = getAuth(req);
    const clerkId = auth.userId;
    if (!clerkId) {
      return res.status(401).json({ message: 'Not authorized, no user ID' });
    }

    let user = await User.findOne({ clerkId });

    if (!user) {
      // Create user if they don't exist yet in our DB.
      // In a real app, you might want to fetch details from Clerk API here if needed.
      user = await User.create({
        clerkId,
        name: 'New User', // Placeholder until synced from frontend
        email: `${clerkId}@placeholder.com`, // Placeholder
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Middleware to check for Admin role
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, syncUser, admin };
