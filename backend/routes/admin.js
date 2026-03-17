const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Inquiry = require('../models/Inquiry');
const Booking = require('../models/Booking');
const Order = require('../models/Order');
const { auth, checkRole } = require('../middleware/auth');

const isValidRole = (role) => ['customer', 'dealer', 'admin', 'staff'].includes(role);
const isValidVehicleStatus = (status) => ['available', 'sold', 'pending'].includes(status);

// @route   GET api/admin/stats
// @desc    Get admin dashboard stats
// @access  Private (Admin)
router.get('/stats', [auth, checkRole(['admin'])], async (req, res) => {
  try {
    const [
      totalUsers,
      totalDealers,
      totalStaff,
      totalAdmins,
      totalVehicles,
      totalInquiries,
      totalBookings,
      totalOrders,
      recentOrders,
      recentUsers
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'dealer' }),
      User.countDocuments({ role: 'staff' }),
      User.countDocuments({ role: 'admin' }),
      Vehicle.countDocuments(),
      Inquiry.countDocuments(),
      Booking.countDocuments(),
      Order.countDocuments(),
      Order.find()
        .select('customer vehicle dealer amount paymentStatus orderStatus createdAt')
        .populate('customer', 'name')
        .populate('vehicle', 'title')
        .sort('-createdAt')
        .limit(5)
        .lean(),
      User.find()
        .select('name email role createdAt')
        .sort('-createdAt')
        .limit(5)
        .lean()
    ]);

    // Calculate total revenue (paid orders only) without loading all rows into memory.
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueAgg?.[0]?.totalRevenue || 0;

    res.json({
      stats: {
        totalUsers,
        totalDealers,
        totalStaff,
        totalAdmins,
        totalAccounts: totalUsers + totalDealers + totalStaff + totalAdmins,
        totalVehicles,
        totalInquiries,
        totalBookings,
        totalOrders,
        totalRevenue
      },
      recentOrders,
      recentUsers
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', [auth, checkRole(['admin'])], async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt').select('-password').lean();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/users
// @desc    Create a new admin (or staff) user
// @access  Private (Admin)
router.post('/users', [auth, checkRole(['admin'])], async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').toLowerCase().trim();
    const password = String(req.body?.password || '');
    const role = String(req.body?.role || 'customer').trim();

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    if (!isValidRole(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = new User({ name, email, password, role });
    await user.save();

    const created = await User.findById(user._id).select('-password');
    res.status(201).json(created);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/admin/users/:id
// @desc    Update user (e.g., status/role)
// @access  Private (Admin)
router.patch('/users/:id', [auth, checkRole(['admin'])], async (req, res) => {
  try {
    const { role } = req.body;
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role) {
      if (!isValidRole(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      // Avoid locking yourself out of the admin area.
      if (String(req.user._id) === String(user._id) && role !== 'admin') {
        return res.status(403).json({ message: 'You cannot change your own admin role' });
      }
      user.role = role;
    }
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin)
router.delete('/users/:id', [auth, checkRole(['admin'])], async (req, res) => {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(403).json({ message: 'You cannot delete your own account' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/vehicles
// @desc    Get all vehicles
// @access  Private (Admin)
router.get('/vehicles', [auth, checkRole(['admin'])], async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('seller', 'name email').sort('-createdAt').lean();
    res.json(vehicles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/vehicles
// @desc    Create a vehicle (admin can assign seller)
// @access  Private (Admin)
router.post('/vehicles', [auth, checkRole(['admin'])], async (req, res) => {
  try {
    const {
      sellerId,
      title,
      brand,
      model,
      year,
      price,
      mileage,
      fuelType,
      transmission,
      bodyType,
      color,
      description,
      images,
      features,
      status,
      isFeatured,
    } = req.body || {};

    if (!title || !brand || !model || !year || !price || !mileage || !fuelType || !transmission || !bodyType || !color || !description) {
      return res.status(400).json({ message: 'Missing required vehicle fields' });
    }

    if (status && !isValidVehicleStatus(status)) {
      return res.status(400).json({ message: 'Invalid vehicle status' });
    }

    let seller = req.user.id;
    if (sellerId) {
      const sellerUser = await User.findById(sellerId);
      if (!sellerUser) return res.status(404).json({ message: 'Seller not found' });
      if (sellerUser.role !== 'dealer') {
        return res.status(400).json({ message: 'Seller must be a dealer' });
      }
      seller = sellerUser._id;
    }

    const newVehicle = new Vehicle({
      title,
      brand,
      model,
      year,
      price,
      mileage,
      fuelType,
      transmission,
      bodyType,
      color,
      description,
      images: Array.isArray(images) ? images : [],
      features: Array.isArray(features) ? features : [],
      status: status || 'available',
      isFeatured: Boolean(isFeatured),
      seller,
    });

    const saved = await newVehicle.save();
    const populated = await Vehicle.findById(saved._id).populate('seller', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/admin/vehicles/:id
// @desc    Update a vehicle (admin)
// @access  Private (Admin)
router.patch('/vehicles/:id', [auth, checkRole(['admin'])], async (req, res) => {
  try {
    const { sellerId, status } = req.body || {};

    if (status && !isValidVehicleStatus(status)) {
      return res.status(400).json({ message: 'Invalid vehicle status' });
    }

    const update = { ...req.body };
    delete update.sellerId;

    if (sellerId) {
      const sellerUser = await User.findById(sellerId);
      if (!sellerUser) return res.status(404).json({ message: 'Seller not found' });
      if (sellerUser.role !== 'dealer') {
        return res.status(400).json({ message: 'Seller must be a dealer' });
      }
      update.seller = sellerUser._id;
    }

    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { $set: update }, { new: true })
      .populate('seller', 'name email');

    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/vehicles/:id
// @desc    Delete a vehicle (admin)
// @access  Private (Admin)
router.delete('/vehicles/:id', [auth, checkRole(['admin'])], async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    await vehicle.deleteOne();
    res.json({ message: 'Vehicle removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/inquiries
// @desc    Get all inquiries (admin)
// @access  Private (Admin)
router.get('/inquiries', [auth, checkRole(['admin'])], async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate('vehicle', 'title brand images')
      .populate('customer', 'name email')
      .populate('dealer', 'name email')
      .sort('-createdAt')
      .limit(200)
      .lean();
    res.json(inquiries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/bookings
// @desc    Get all bookings (admin)
// @access  Private (Admin)
router.get('/bookings', [auth, checkRole(['admin'])], async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('vehicle', 'title brand images')
      .populate('customer', 'name email')
      .populate('dealer', 'name email')
      .sort('-createdAt')
      .limit(200)
      .lean();
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/orders
// @desc    Get all orders (admin)
// @access  Private (Admin)
router.get('/orders', [auth, checkRole(['admin'])], async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('vehicle', 'title brand images price')
      .populate('customer', 'name email')
      .populate('dealer', 'name email')
      .sort('-createdAt')
      .limit(200)
      .lean();
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
