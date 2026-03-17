const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const Vehicle = require('../models/Vehicle');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');

// @route   POST api/inquiries
// @desc    Create an inquiry
// @access  Private (Customer)
router.post('/', [auth, checkRole(['customer'])], async (req, res) => {
  try {
    const { vehicleId, dealerId, message } = req.body;

    if (!vehicleId) {
      return res.status(400).json({ message: 'vehicleId is required' });
    }
    const msg = String(message || '').trim();
    if (!msg) {
      return res.status(400).json({ message: 'message is required' });
    }

    const vehicle = await Vehicle.findById(vehicleId).select('seller title brand').lean();
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const resolvedDealerId = String(vehicle.seller);
    if (dealerId && String(dealerId) !== resolvedDealerId) {
      return res.status(400).json({ message: 'dealerId does not match the vehicle seller' });
    }

    const newInquiry = new Inquiry({
      customer: req.user.id,
      vehicle: vehicleId,
      dealer: resolvedDealerId,
      message: msg
    });

    const inquiry = await newInquiry.save();

    // Notify dealer + admins
    const io = req.app.get('socketio');
    const dealerNotification = await Notification.create({
      recipient: resolvedDealerId,
      title: 'New inquiry',
      message: `New inquiry for ${vehicle.title || 'a vehicle'}.`,
      type: 'info',
      link: '/dashboard/dealer/inquiries',
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
          title: 'New inquiry',
          message: `A new inquiry was created for ${vehicle.title || 'a vehicle'}.`,
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

    res.json(inquiry);
  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET api/inquiries/my
// @desc    Get current user's inquiries (as customer)
// @access  Private (Customer)
router.get('/my', auth, async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ customer: req.user.id })
      .populate('vehicle', 'title brand images')
      .populate('dealer', 'name email')
      .sort('-createdAt')
      .lean();
    res.json(inquiries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/inquiries/received
// @desc    Get received inquiries (as dealer)
// @access  Private (Dealer)
router.get('/received', [auth, checkRole(['dealer'])], async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ dealer: req.user.id })
      .populate('vehicle', 'title brand images')
      .populate('customer', 'name email')
      .sort('-createdAt')
      .lean();
    res.json(inquiries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/inquiries/:id
// @desc    Update inquiry status
// @access  Private (Dealer, Admin)
router.patch('/:id', [auth, checkRole(['dealer', 'admin'])], async (req, res) => {
  try {
    const { status } = req.body;
    let inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    if (req.user.role !== 'admin' && inquiry.dealer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    inquiry.status = status;
    await inquiry.save();

    res.json(inquiry);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
