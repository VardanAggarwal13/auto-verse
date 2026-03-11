const express = require('express');
const router = express.Router();
const User = require('../models/User');
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
    const user = await User.findById(req.user.id);
    if (!user.wishlist.includes(req.params.vehicleId)) {
      user.wishlist.push(req.params.vehicleId);
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
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.vehicleId);
    await user.save();
    res.json(user.wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
