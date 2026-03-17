const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const { auth } = require('../middleware/auth');

// @route   GET api/users/wishlist
// @desc    Get current user's wishlist
// @access  Private
router.get('/wishlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.json(user.wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/users/wishlist/:vehicleId
// @desc    Add vehicle to wishlist
// @access  Private
router.post('/wishlist/:vehicleId', auth, async (req, res) => {
  try {
    const vehicleId = String(req.params.vehicleId || '').trim();
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ message: 'Invalid vehicle id' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const user = await User.findById(req.user.id);
    const alreadySaved = user.wishlist.some((id) => id.toString() === vehicleId);
    if (!alreadySaved) {
      user.wishlist.push(vehicleId);
      await user.save();
    }
    res.json(user.wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/users/wishlist/:vehicleId
// @desc    Remove vehicle from wishlist
// @access  Private
router.delete('/wishlist/:vehicleId', auth, async (req, res) => {
  try {
    const vehicleId = String(req.params.vehicleId || '').trim();
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ message: 'Invalid vehicle id' });
    }

    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== vehicleId);
    await user.save();
    res.json(user.wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
