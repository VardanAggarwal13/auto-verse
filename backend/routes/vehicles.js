const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const { auth, checkRole } = require('../middleware/auth');

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @route   GET api/vehicles/dealer
// @desc    Get current dealer's vehicles
// @access  Private (Dealer)
router.get('/dealer', [auth, checkRole(['dealer'])], async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ seller: req.user.id }).sort('-createdAt').lean();
    res.json(vehicles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/vehicles
// @desc    Get all vehicles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { brand, fuelType, transmission, minPrice, maxPrice, q, sort, page, limit } = req.query;
    let query = { status: 'available' };

    if (brand) query.brand = new RegExp(`^${escapeRegExp(brand)}$`, 'i');
    if (fuelType) query.fuelType = fuelType;
    if (transmission) query.transmission = transmission;
    const search = String(q || '').trim();
    if (search) {
      const rx = new RegExp(escapeRegExp(search), 'i');
      query.$or = [{ title: rx }, { brand: rx }, { model: rx }];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortKey = String(sort || 'latest');
    const sortSpec =
      sortKey === 'price-asc'
        ? { price: 1, createdAt: -1 }
        : sortKey === 'price-desc'
          ? { price: -1, createdAt: -1 }
          : { createdAt: -1 };

    let cursor = Vehicle.find(query)
      .select('title brand model year price mileage fuelType transmission images status isFeatured createdAt')
      .sort(sortSpec)
      .lean();

    // Optional pagination (keeps backwards compatibility when page/limit not provided).
    const limitNum = limit ? Math.min(Math.max(Number(limit) || 0, 1), 200) : null;
    const pageNum = page ? Math.max(Number(page) || 1, 1) : null;
    if (limitNum && pageNum) {
      cursor = cursor.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const vehicles = await cursor;
    res.json(vehicles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/vehicles/:id
// @desc    Get vehicle by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('seller', 'name email').lean();
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/vehicles
// @desc    Create a vehicle
// @access  Private (Dealer, Admin)
router.post('/', [auth, checkRole(['dealer', 'admin'])], async (req, res) => {
  try {
    const newVehicle = new Vehicle({
      ...req.body,
      seller: req.user.id
    });

    const vehicle = await newVehicle.save();
    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/vehicles/:id
// @desc    Update a vehicle
// @access  Private (Dealer, Admin)
router.patch('/:id', [auth, checkRole(['dealer', 'admin'])], async (req, res) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check ownership or admin role
    if (vehicle.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this vehicle' });
    }

    vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/vehicles/:id
// @desc    Delete a vehicle
// @access  Private (Dealer, Admin)
router.delete('/:id', [auth, checkRole(['dealer', 'admin'])], async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check ownership or admin role
    if (vehicle.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await vehicle.deleteOne();
    res.json({ message: 'Vehicle removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
