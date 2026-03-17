const express = require('express');
const router = express.Router();
const ServiceRequest = require('../models/ServiceRequest');
const VehicleInspection = require('../models/VehicleInspection');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const { auth, checkRole } = require('../middleware/auth');

const isValidServiceType = (value) => ['maintenance', 'repair', 'inspection', 'customization'].includes(value);
const isInspectionPass = (inspection) => {
  const ok = new Set(['excellent', 'good']);
  return ok.has(inspection.engineStatus) && ok.has(inspection.exteriorStatus) && ok.has(inspection.interiorStatus) && ok.has(inspection.tiresStatus);
};

// @route   GET api/staff/customers
// @desc    Get customers list (for staff workflows)
// @access  Private (Staff, Admin)
router.get('/customers', [auth, checkRole(['staff', 'admin'])], async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('name email role')
      .sort('name')
      .lean();
    res.json(customers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/staff/vehicles
// @desc    Get vehicles list (for staff workflows)
// @access  Private (Staff, Admin)
router.get('/vehicles', [auth, checkRole(['staff', 'admin'])], async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .select('title brand model year status seller createdAt')
      .populate('seller', 'name email role')
      .sort('-createdAt')
      .lean();
    res.json(vehicles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/staff/services
// @desc    Get all service requests
// @access  Private (Staff, Admin)
router.get('/services', [auth, checkRole(['staff', 'admin'])], async (req, res) => {
  try {
    const services = await ServiceRequest.find()
      .populate('customer', 'name email')
      .populate('vehicle', 'title brand')
      .sort('-createdAt')
      .lean();
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/staff/services
// @desc    Create a service request (staff/admin)
// @access  Private (Staff, Admin)
router.post('/services', [auth, checkRole(['staff', 'admin'])], async (req, res) => {
  try {
    const customerId = String(req.body?.customerId || '').trim();
    const vehicleId = String(req.body?.vehicleId || '').trim();
    const serviceType = String(req.body?.serviceType || '').trim();
    const description = String(req.body?.description || '').trim();
    const scheduledDate = req.body?.scheduledDate;

    if (!customerId || !vehicleId || !serviceType || !description) {
      return res.status(400).json({ message: 'customerId, vehicleId, serviceType, and description are required' });
    }
    if (!isValidServiceType(serviceType)) {
      return res.status(400).json({ message: 'Invalid serviceType' });
    }

    const customer = await User.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    if (customer.role !== 'customer') {
      return res.status(400).json({ message: 'Selected user must be a customer' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const newService = new ServiceRequest({
      customer: customer._id,
      vehicle: vehicle._id,
      serviceType,
      description,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      status: 'pending',
      assignedTo: req.user.id,
    });

    const saved = await newService.save();
    const populated = await ServiceRequest.findById(saved._id)
      .populate('customer', 'name email')
      .populate('vehicle', 'title brand');

    res.status(201).json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/staff/services/:id
// @desc    Update service request status
// @access  Private (Staff, Admin)
router.patch('/services/:id', [auth, checkRole(['staff', 'admin'])], async (req, res) => {
  try {
    const { status, scheduledDate } = req.body;
    let service = await ServiceRequest.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    if (status) service.status = status;
    if (scheduledDate) service.scheduledDate = scheduledDate;
    
    // Assign to the staff member who updates it if not already assigned
    if (!service.assignedTo) {
        service.assignedTo = req.user.id;
    }

    await service.save();
    res.json(service);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/staff/inspections
// @desc    Create a vehicle inspection report
// @access  Private (Staff, Admin)
router.post('/inspections', [auth, checkRole(['staff', 'admin'])], async (req, res) => {
  try {
    const inspectionData = {
        ...req.body,
        inspector: req.user.id
    };
    const newInspection = new VehicleInspection(inspectionData);
    const inspection = await newInspection.save();
    res.json(inspection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/staff/inspections
// @desc    Get all inspections (staff/admin)
// @access  Private (Staff, Admin)
router.get('/inspections', [auth, checkRole(['staff', 'admin'])], async (req, res) => {
  try {
    const inspections = await VehicleInspection.find()
      .populate('vehicle', 'title brand model year')
      .populate('inspector', 'name')
      .sort('-inspectionDate')
      .limit(50)
      .lean();

    res.json(
      inspections.map((i) => ({
        id: `INS-${String(i._id).slice(-6).toUpperCase()}`,
        vehicle: i.vehicle?.title || `${i.vehicle?.brand || ''} ${i.vehicle?.model || ''}`.trim() || 'Vehicle',
        result: isInspectionPass(i) ? 'Pass' : 'Requires Maintenance',
        date: i.inspectionDate ? new Date(i.inspectionDate).toISOString().slice(0, 10) : '',
        inspector: i.inspector?.name || 'Inspector',
      })),
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/staff/inspections/:vehicleId
// @desc    Get inspections for a vehicle
// @access  Private (Staff, Admin, Dealer)
router.get('/inspections/:vehicleId', auth, async (req, res) => {
  try {
    const inspections = await VehicleInspection.find({ vehicle: req.params.vehicleId })
      .populate('inspector', 'name')
      .sort('-inspectionDate')
      .lean();
    res.json(inspections);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
