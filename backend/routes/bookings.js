const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');

const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime());

const emitNotification = (req, recipientId, payload) => {
  const io = req.app.get('socketio');
  if (io) {
    io.to(String(recipientId)).emit('notification', payload);
  }
};

const createAndEmitNotification = async (req, recipientId, notification) => {
  const n = await Notification.create({ recipient: recipientId, ...notification });
  emitNotification(req, recipientId, {
    title: n.title,
    message: n.message,
    type: n.type,
    link: n.link,
  });
  return n;
};

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
    await createAndEmitNotification(req, resolvedDealerId, {
      title: 'New test drive request',
      message: `New test drive request for ${vehicle.title || 'a vehicle'}.`,
      type: 'info',
      link: '/dashboard/dealer/bookings',
    });

    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(
      admins.map(async (a) => {
        await createAndEmitNotification(req, a._id, {
          title: 'New test drive request',
          message: `A new test drive request was created for ${vehicle.title || 'a vehicle'}.`,
          type: 'info',
          link: '/dashboard/admin/activity',
        });
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
      .sort('bookingDate')
      .lean();
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/bookings/:id/cancel
// @desc    Cancel own booking (as customer)
// @access  Private (Customer)
router.patch('/:id/cancel', [auth, checkRole(['customer'])], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('vehicle', 'title');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Completed bookings cannot be cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    const vehicleTitle = booking?.vehicle?.title || 'a vehicle';

    await createAndEmitNotification(req, booking.dealer, {
      title: 'Test drive cancelled',
      message: `A customer cancelled a test drive for ${vehicleTitle}.`,
      type: 'warning',
      link: '/dashboard/dealer/bookings',
    });

    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(
      admins.map((a) =>
        createAndEmitNotification(req, a._id, {
          title: 'Test drive cancelled',
          message: `A test drive was cancelled for ${vehicleTitle}.`,
          type: 'warning',
          link: '/dashboard/admin/activity',
        }),
      ),
    );

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PATCH api/bookings/:id/reschedule
// @desc    Reschedule own booking (as customer)
// @access  Private (Customer)
router.patch('/:id/reschedule', [auth, checkRole(['customer'])], async (req, res) => {
  try {
    const { bookingDate, timeSlot } = req.body || {};
    const slot = String(timeSlot || '').trim();
    if (!bookingDate) return res.status(400).json({ message: 'bookingDate is required' });
    if (!slot) return res.status(400).json({ message: 'timeSlot is required' });

    const nextDate = new Date(bookingDate);
    if (!isValidDate(nextDate)) {
      return res.status(400).json({ message: 'Invalid bookingDate' });
    }
    if (nextDate.getTime() < Date.now() - 60 * 1000) {
      return res.status(400).json({ message: 'bookingDate must be in the future' });
    }

    const booking = await Booking.findById(req.params.id).populate('vehicle', 'title');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cancelled bookings cannot be rescheduled' });
    }
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Completed bookings cannot be rescheduled' });
    }

    booking.bookingDate = nextDate;
    booking.timeSlot = slot;
    booking.status = 'pending';
    await booking.save();

    const vehicleTitle = booking?.vehicle?.title || 'a vehicle';

    await createAndEmitNotification(req, booking.dealer, {
      title: 'Test drive rescheduled',
      message: `A customer rescheduled a test drive for ${vehicleTitle}.`,
      type: 'info',
      link: '/dashboard/dealer/bookings',
    });

    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(
      admins.map((a) =>
        createAndEmitNotification(req, a._id, {
          title: 'Test drive rescheduled',
          message: `A test drive was rescheduled for ${vehicleTitle}.`,
          type: 'info',
          link: '/dashboard/admin/activity',
        }),
      ),
    );

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
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
      .sort('bookingDate')
      .lean();
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
