const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Inquiry = require('../models/Inquiry');
const Booking = require('../models/Booking');
const { auth, checkRole } = require('../middleware/auth');

// @route   GET api/dealer/stats
// @desc    Get dealer dashboard stats
// @access  Private (Dealer)
router.get('/stats', [auth, checkRole(['dealer'])], async (req, res) => {
  try {
    const dealerId = req.user.id;

    const [totalVehicles, totalInquiries, totalBookings, soldVehicles] = await Promise.all([
      Vehicle.countDocuments({ seller: dealerId }),
      Inquiry.countDocuments({ dealer: dealerId }),
      Booking.countDocuments({ dealer: dealerId }),
      Vehicle.find({ seller: dealerId, status: 'sold' })
    ]);

    const totalSales = soldVehicles.reduce((acc, vehicle) => acc + vehicle.price, 0);

    // Get recent inquiries
    const recentInquiries = await Inquiry.find({ dealer: dealerId })
      .populate('customer', 'name')
      .populate('vehicle', 'title')
      .sort('-createdAt')
      .limit(5);

    // Get upcoming test drives
    const upcomingBookings = await Booking.find({ 
      dealer: dealerId, 
      status: 'confirmed', 
      bookingDate: { $gte: new Date() } 
    })
      .populate('customer', 'name')
      .populate('vehicle', 'title')
      .sort('bookingDate')
      .limit(5);

    res.json({
      stats: {
        totalVehicles,
        totalInquiries,
        totalBookings,
        totalSales
      },
      recentInquiries,
      upcomingBookings
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
