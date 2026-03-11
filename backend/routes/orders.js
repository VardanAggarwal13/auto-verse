const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Vehicle = require('../models/Vehicle');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');

// @route   POST api/orders
// @desc    Place a vehicle order
// @access  Private (Customer)
router.post('/', [auth, checkRole(['customer'])], async (req, res) => {
  try {
    const { vehicleId, amount } = req.body;
    
    // Check if vehicle exists and get dealer
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const newOrder = new Order({
      customer: req.user.id,
      vehicle: vehicleId,
      dealer: vehicle.seller,
      amount: amount || vehicle.price
    });

    const order = await newOrder.save();

    // Notify dealer + admins
    const io = req.app.get('socketio');
    const dealerId = String(vehicle.seller);
    const dealerNotification = await Notification.create({
      recipient: dealerId,
      title: 'New order',
      message: `New order placed for ${vehicle.title || 'a vehicle'}.`,
      type: 'success',
      link: '/dashboard/dealer/orders',
    });
    if (io) {
      io.to(dealerId).emit('notification', {
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
          title: 'New order',
          message: `A new order was placed for ${vehicle.title || 'a vehicle'}.`,
          type: 'success',
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

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/orders/my
// @desc    Get current user's orders (as customer)
// @access  Private (Customer)
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('vehicle', 'title brand images')
      .populate('dealer', 'name email')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/orders/received
// @desc    Get received orders (as dealer)
// @access  Private (Dealer)
router.get('/received', [auth, checkRole(['dealer'])], async (req, res) => {
  try {
    const orders = await Order.find({ dealer: req.user.id })
      .populate('vehicle', 'title brand images')
      .populate('customer', 'name email')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/orders/:id
// @desc    Update order status
// @access  Private (Dealer, Admin)
router.patch('/:id', [auth, checkRole(['dealer', 'admin'])], async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization: must be the dealer who owns the vehicle OR an admin
    if (order.dealer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    // If order is completed, mark vehicle as sold
    if (orderStatus === 'completed') {
        await Vehicle.findByIdAndUpdate(order.vehicle, { status: 'sold' });
    }

    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
