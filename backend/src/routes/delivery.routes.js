const express = require('express');
const router = express.Router();
const { calculateDistance } = require('../utils/geoDistance');
const Settings = require('../models/Settings');

router.post('/check', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        message: 'Latitude and longitude are required to check delivery eligibility.' 
      });
    }

    // Fetch store settings for coordinates and max distance
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if they don't exist
      settings = await Settings.create({});
    }

    const distance = calculateDistance(
      settings.shopLatitude, 
      settings.shopLongitude, 
      Number(latitude), 
      Number(longitude)
    );

    const isEligible = distance <= settings.maxDeliveryDistance;

    res.json({
      success: true,
      distance: Number(distance.toFixed(2)),
      isEligible,
      maxDistance: settings.maxDeliveryDistance,
      message: isEligible 
        ? 'Delivery is available to your location.'
        : `Sorry, we currently deliver only within ${settings.maxDeliveryDistance} km of our store. Your location is approximately ${distance.toFixed(1)} km away.`
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
