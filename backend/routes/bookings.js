const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');

// @route   POST api/bookings
// @desc    Create a test drive booking
// @access  Private (Customer)
router.post('/', [auth, checkRole(['customer'])], async (req, res) => {
  try {
    const { vehicleId, dealerId, bookingDate, timeSlot, message } = req.body;

    if (!vehicleId) {
      return res.status(400).json({ message: 'vehicleId is required' });
    }
    if (!bookingDate) {
      return res.status(400).json({ message: 'bookingDate is required' });
    }
    const slot = String(timeSlot || '').trim();
    if (!slot) {
      return res.status(400).json({ message: 'timeSlot is required' });
    }

    const vehicle = await Vehicle.findById(vehicleId).select('seller title brand');
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const resolvedDealerId = String(vehicle.seller);
    if (dealerId && String(dealerId) !== resolvedDealerId) {
      return res.status(400).json({ message: 'dealerId does not match the vehicle seller' });
    }

    const newBooking = new Booking({
      customer: req.user.id,
      vehicle: vehicleId,
      dealer: resolvedDealerId,
      bookingDate: new Date(bookingDate),
      timeSlot: slot,
      message: typeof message === 'string' ? message.trim() : undefined
    });

    const booking = await newBooking.save();

    // Notify dealer + admins
    const io = req.app.get('socketio');
    const dealerNotification = await Notification.create({
      recipient: resolvedDealerId,
      title: 'New test drive request',
      message: `New test drive request for ${vehicle.title || 'a vehicle'}.`,
      type: 'info',
      link: '/dashboard/dealer/bookings',
    });
    if (io) {
      io.to(String(resolvedDealerId)).emit('notification', {
        title: dealerNotification.title,
        message: dealerNotification.message,
        type: dealerNotification.type,
        link: dealerNotification.link,
      });
    }

    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(
      admins.map(async (a) => {
        const n = await Notification.create({
          recipient: a._id,
          title: 'New test drive request',
          message: `A new test drive request was created for ${vehicle.title || 'a vehicle'}.`,
          type: 'info',
          link: '/dashboard/admin/activity',
        });
        if (io) {
          io.to(String(a._id)).emit('notification', {
            title: n.title,
            message: n.message,
            type: n.type,
            link: n.link,
          });
        }
      }),
    );

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET api/bookings/my
// @desc    Get current user's bookings (as customer)
// @access  Private (Customer)
router.get('/my', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('vehicle', 'title brand images')
      .populate('dealer', 'name email')
      .sort('bookingDate');
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/bookings/received
// @desc    Get received bookings (as dealer)
// @access  Private (Dealer)
router.get('/received', [auth, checkRole(['dealer'])], async (req, res) => {
  try {
    const bookings = await Booking.find({ dealer: req.user.id })
      .populate('vehicle', 'title brand images')
      .populate('customer', 'name email')
      .sort('bookingDate');
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/bookings/:id
// @desc    Update booking status
// @access  Private (Dealer, Admin)
router.patch('/:id', [auth, checkRole(['dealer', 'admin'])], async (req, res) => {
  try {
    const { status } = req.body;
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && booking.dealer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
