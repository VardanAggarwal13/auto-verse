/* eslint-disable no-console */
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Inquiry = require("../models/Inquiry");
const Booking = require("../models/Booking");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const ServiceRequest = require("../models/ServiceRequest");
const VehicleInspection = require("../models/VehicleInspection");

const getArgFlag = (name) => process.argv.includes(name);

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (items) => items[rand(0, items.length - 1)];
const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
const hoursFromNow = (n) => new Date(Date.now() + n * 60 * 60 * 1000);
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function ensureUser({ email, name, role, phone, location, password, setPassword }) {
  const existing = await User.findOne({ email });
  if (!existing) {
    const created = new User({
      email,
      name,
      role,
      phone: phone || "",
      location: location || "",
      password,
      createdAt: daysAgo(rand(2, 120)),
    });
    await created.save();
    return created;
  }

  existing.name = name || existing.name;
  existing.role = role || existing.role;
  existing.phone = phone ?? existing.phone;
  existing.location = location ?? existing.location;
  if (setPassword) existing.password = password;
  await existing.save();
  return existing;
}

async function ensureVehicle(vehicle) {
  const existing = await Vehicle.findOne({ title: vehicle.title, seller: vehicle.seller });
  if (existing) return existing;
  const created = new Vehicle(vehicle);
  await created.save();
  return created;
}

async function resetSeedData(seedEmails) {
  const users = await User.find({ email: { $in: seedEmails } }).select("_id email");
  const userIds = users.map((u) => u._id);
  if (userIds.length === 0) return;

  await Promise.all([
    Inquiry.deleteMany({ $or: [{ customer: { $in: userIds } }, { dealer: { $in: userIds } }] }),
    Booking.deleteMany({ $or: [{ customer: { $in: userIds } }, { dealer: { $in: userIds } }] }),
    Order.deleteMany({ $or: [{ customer: { $in: userIds } }, { dealer: { $in: userIds } }] }),
    Notification.deleteMany({ recipient: { $in: userIds } }),
    ServiceRequest.deleteMany({ $or: [{ customer: { $in: userIds } }, { assignedTo: { $in: userIds } }] }),
    VehicleInspection.deleteMany({ inspector: { $in: userIds } }),
    Vehicle.deleteMany({ seller: { $in: userIds } }),
  ]);

  await User.deleteMany({ _id: { $in: userIds } });
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing. Set it in backend/.env before running.");
  }

  const seedPassword = process.env.SEED_PASSWORD || "DemoPass123!";
  const reset = getArgFlag("--reset");
  const setPassword = getArgFlag("--set-password");

  const seedUsers = {
    admin: { email: "admin.demo@autoverse.local", name: "Demo Admin", role: "admin" },
    staff: [
      { email: "staff.sana@autoverse.local", name: "Sana Khan", role: "staff", location: "Delhi", phone: "+91 98765 43210" },
      { email: "staff.rohit@autoverse.local", name: "Rohit Verma", role: "staff", location: "Pune", phone: "+91 91234 56789" },
    ],
    dealers: [
      { email: "dealer.vikram@autoverse.local", name: "Vikram Sharma", role: "dealer", location: "Mumbai", phone: "+91 90000 11111" },
      { email: "dealer.neha@autoverse.local", name: "Neha Kapoor", role: "dealer", location: "Bengaluru", phone: "+91 90000 22222" },
      { email: "dealer.arjun@autoverse.local", name: "Arjun Mehta", role: "dealer", location: "Hyderabad", phone: "+91 90000 33333" },
    ],
    customers: [
      { email: "customer.aanya@autoverse.local", name: "Aanya Gupta", role: "customer", location: "Gurugram" },
      { email: "customer.ishaan@autoverse.local", name: "Ishaan Singh", role: "customer", location: "Noida" },
      { email: "customer.kavya@autoverse.local", name: "Kavya Iyer", role: "customer", location: "Chennai" },
      { email: "customer.rahul@autoverse.local", name: "Rahul Jain", role: "customer", location: "Jaipur" },
      { email: "customer.meera@autoverse.local", name: "Meera Nair", role: "customer", location: "Kochi" },
      { email: "customer.arnav@autoverse.local", name: "Arnav Joshi", role: "customer", location: "Indore" },
      { email: "customer.priya@autoverse.local", name: "Priya Das", role: "customer", location: "Kolkata" },
      { email: "customer.samar@autoverse.local", name: "Samar Kulkarni", role: "customer", location: "Nagpur" },
    ],
  };

  const seedEmails = [
    seedUsers.admin.email,
    ...seedUsers.staff.map((u) => u.email),
    ...seedUsers.dealers.map((u) => u.email),
    ...seedUsers.customers.map((u) => u.email),
  ];

  await mongoose.connect(mongoUri);

  if (reset) {
    await resetSeedData(seedEmails);
  }

  const admin = await ensureUser({ ...seedUsers.admin, password: seedPassword, setPassword });
  const staff = [];
  for (const s of seedUsers.staff) staff.push(await ensureUser({ ...s, password: seedPassword, setPassword }));
  const dealers = [];
  for (const d of seedUsers.dealers) dealers.push(await ensureUser({ ...d, password: seedPassword, setPassword }));
  const customers = [];
  for (const c of seedUsers.customers) customers.push(await ensureUser({ ...c, password: seedPassword, setPassword }));

  const imageSets = {
    sedan: [
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1400&q=60",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=60",
    ],
    suv: [
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1400&q=60",
      "https://images.unsplash.com/photo-1517949908119-720d6f7c63b6?auto=format&fit=crop&w=1400&q=60",
    ],
    ev: [
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1400&q=60",
      "https://images.unsplash.com/photo-1605559424843-9e5c1b3c0f6b?auto=format&fit=crop&w=1400&q=60",
    ],
    bike: [
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1400&q=60",
    ],
  };

  const vehicleTemplates = [
    // Dealer 1
    {
      title: "Honda CD 110 Dream",
      brand: "Honda",
      model: "CD 110 Dream",
      year: 2025,
      price: 45000,
      mileage: 60,
      fuelType: "Petrol",
      transmission: "Manual",
      bodyType: "Commuter",
      color: "Black",
      description: "Reliable daily commuter with excellent mileage and low maintenance costs.",
      images: imageSets.bike,
      features: ["Low maintenance", "High mileage", "Comfort seat"],
      status: "available",
      isFeatured: true,
    },
    {
      title: "Toyota Corolla Altis",
      brand: "Toyota",
      model: "Corolla Altis",
      year: 2022,
      price: 1450000,
      mileage: 24000,
      fuelType: "Petrol",
      transmission: "Automatic",
      bodyType: "Sedan",
      color: "White",
      description: "Well maintained sedan with smooth automatic transmission and premium interior.",
      images: imageSets.sedan,
      features: ["Cruise control", "Airbags", "Rear camera"],
      status: "available",
      isFeatured: false,
    },
    {
      title: "BMW X1 sDrive",
      brand: "BMW",
      model: "X1",
      year: 2021,
      price: 3890000,
      mileage: 32000,
      fuelType: "Diesel",
      transmission: "Automatic",
      bodyType: "SUV",
      color: "Blue",
      description: "Compact luxury SUV with strong performance and comfortable ride.",
      images: imageSets.suv,
      features: ["Panoramic sunroof", "Leather seats", "Navigation"],
      status: "available",
      isFeatured: true,
    },
    // Dealer 2
    {
      title: "Tesla Model 3 Long Range",
      brand: "Tesla",
      model: "Model 3",
      year: 2024,
      price: 5200000,
      mileage: 9000,
      fuelType: "Electric",
      transmission: "Automatic",
      bodyType: "Sedan",
      color: "Red",
      description: "Long range EV with fast acceleration and advanced driver assistance.",
      images: imageSets.ev,
      features: ["Autopilot", "Fast charging", "Glass roof"],
      status: "available",
      isFeatured: true,
    },
    {
      title: "Audi A4 Premium",
      brand: "Audi",
      model: "A4",
      year: 2020,
      price: 3650000,
      mileage: 41000,
      fuelType: "Petrol",
      transmission: "Automatic",
      bodyType: "Sedan",
      color: "Grey",
      description: "Premium sedan with refined cabin, powerful engine and excellent handling.",
      images: imageSets.sedan,
      features: ["LED headlights", "Virtual cockpit", "Parking sensors"],
      status: "available",
      isFeatured: false,
    },
    {
      title: "Hyundai Creta SX",
      brand: "Hyundai",
      model: "Creta",
      year: 2023,
      price: 1650000,
      mileage: 16000,
      fuelType: "Diesel",
      transmission: "Manual",
      bodyType: "SUV",
      color: "Silver",
      description: "Feature-packed SUV with great ground clearance and comfortable seating.",
      images: imageSets.suv,
      features: ["Sunroof", "Connected car tech", "ABS"],
      status: "available",
      isFeatured: false,
    },
    // Dealer 3
    {
      title: "Mercedes-Benz GLA 200",
      brand: "Mercedes",
      model: "GLA",
      year: 2022,
      price: 4850000,
      mileage: 21000,
      fuelType: "Petrol",
      transmission: "Automatic",
      bodyType: "SUV",
      color: "Black",
      description: "Luxury compact SUV with premium interiors and smooth automatic gearbox.",
      images: imageSets.suv,
      features: ["MBUX", "Ambient lighting", "360 camera"],
      status: "available",
      isFeatured: false,
    },
    {
      title: "Kia Seltos GTX+",
      brand: "Kia",
      model: "Seltos",
      year: 2021,
      price: 1780000,
      mileage: 28000,
      fuelType: "Petrol",
      transmission: "Automatic",
      bodyType: "SUV",
      color: "Orange",
      description: "Sporty SUV with premium features and strong performance.",
      images: imageSets.suv,
      features: ["Ventilated seats", "Bose audio", "HUD"],
      status: "available",
      isFeatured: true,
    },
    {
      title: "Honda City ZX CVT",
      brand: "Honda",
      model: "City",
      year: 2022,
      price: 1420000,
      mileage: 19500,
      fuelType: "Petrol",
      transmission: "Automatic",
      bodyType: "Sedan",
      color: "Blue",
      description: "Popular sedan with smooth CVT and excellent comfort for city commutes.",
      images: imageSets.sedan,
      features: ["LaneWatch", "6 airbags", "Auto climate"],
      status: "available",
      isFeatured: false,
    },
  ];

  const vehicles = [];
  for (let i = 0; i < vehicleTemplates.length; i += 1) {
    const template = vehicleTemplates[i];
    const dealer = dealers[i % dealers.length];
    const created = await ensureVehicle({
      ...template,
      seller: dealer._id,
      createdAt: daysAgo(rand(1, 60)),
    });
    vehicles.push(created);
  }

  // Add extra inventory per dealer for richer listings/stats
  const extraBrands = [
    { brand: "Toyota", model: "Fortuner", bodyType: "SUV", fuelType: "Diesel", transmission: "Automatic" },
    { brand: "BMW", model: "3 Series", bodyType: "Sedan", fuelType: "Petrol", transmission: "Automatic" },
    { brand: "Audi", model: "Q3", bodyType: "SUV", fuelType: "Petrol", transmission: "Automatic" },
    { brand: "Mercedes", model: "C-Class", bodyType: "Sedan", fuelType: "Petrol", transmission: "Automatic" },
    { brand: "Tesla", model: "Model Y", bodyType: "SUV", fuelType: "Electric", transmission: "Automatic" },
    { brand: "Honda", model: "WR-V", bodyType: "SUV", fuelType: "Petrol", transmission: "Manual" },
  ];

  for (const dealer of dealers) {
    for (let i = 0; i < 6; i += 1) {
      const base = pick(extraBrands);
      const statusPool = ["available", "available", "available", "pending", "sold"];
      const status = pick(statusPool);
      const title = `${base.brand} ${base.model} ${status === "sold" ? "Sold" : "Edition"} ${rand(2020, 2025)}`;
      const created = await ensureVehicle({
        title,
        brand: base.brand,
        model: base.model,
        year: rand(2020, 2025),
        price: rand(800000, 5500000),
        mileage: rand(5000, 78000),
        fuelType: base.fuelType,
        transmission: base.transmission,
        bodyType: base.bodyType,
        color: pick(["White", "Black", "Grey", "Blue", "Red", "Silver"]),
        description: "Dealer listed vehicle with verified service history and transparent pricing.",
        images: base.fuelType === "Electric" ? imageSets.ev : base.bodyType === "SUV" ? imageSets.suv : imageSets.sedan,
        features: ["Service history", "Insurance", "Extended warranty"].slice(0, rand(2, 3)),
        seller: dealer._id,
        status,
        isFeatured: Math.random() < 0.25,
        createdAt: daysAgo(rand(1, 90)),
      });
      vehicles.push(created);
    }
  }

  // Build wishlists (so customer dashboard shows data)
  for (const customer of customers) {
    const wish = [];
    const available = vehicles.filter((v) => v.status === "available");
    for (let i = 0; i < rand(2, 5); i += 1) wish.push(pick(available)._id);
    customer.wishlist = Array.from(new Set(wish.map(String))).map((id) => mongoose.Types.ObjectId.createFromHexString(id));
    await customer.save();
  }

  // Inquiries
  const inquiryMessages = [
    "Is this vehicle still available? Can I schedule a viewing?",
    "What is the service history and ownership details?",
    "Can you share the best final price and financing options?",
    "Any accidents or major repairs done previously?",
  ];
  for (let i = 0; i < 28; i += 1) {
    const customer = pick(customers);
    const vehicle = pick(vehicles.filter((v) => v.status !== "sold"));
    const dealer = dealers.find((d) => String(d._id) === String(vehicle.seller)) || pick(dealers);
    await Inquiry.create({
      customer: customer._id,
      vehicle: vehicle._id,
      dealer: dealer._id,
      message: pick(inquiryMessages),
      status: pick(["pending", "responded", "closed"]),
      createdAt: daysAgo(rand(0, 45)),
    });
  }

  // Bookings (dealer dashboard expects confirmed future bookings)
  const slots = ["10:00 AM", "12:30 PM", "03:00 PM", "05:30 PM"];
  for (let i = 0; i < 18; i += 1) {
    const customer = pick(customers);
    const vehicle = pick(vehicles.filter((v) => v.status === "available"));
    const dealer = dealers.find((d) => String(d._id) === String(vehicle.seller)) || pick(dealers);
    const isFuture = Math.random() < 0.65;
    const status = isFuture ? pick(["confirmed", "confirmed", "pending"]) : pick(["completed", "cancelled"]);
    await Booking.create({
      customer: customer._id,
      vehicle: vehicle._id,
      dealer: dealer._id,
      bookingDate: isFuture ? daysFromNow(rand(1, 20)) : daysAgo(rand(2, 30)),
      timeSlot: pick(slots),
      status,
      message: Math.random() < 0.4 ? "Please confirm the address and required documents." : undefined,
      createdAt: isFuture ? daysAgo(rand(0, 10)) : daysAgo(rand(5, 40)),
    });
  }

  // Orders (admin revenue counts paid orders; dealer totalSales sums sold vehicles)
  const paidOrders = [];
  const orderCandidates = vehicles.filter((v) => v.status === "available").slice(0, 8);
  for (let i = 0; i < orderCandidates.length; i += 1) {
    const vehicle = orderCandidates[i];
    const customer = customers[i % customers.length];
    const dealer = dealers.find((d) => String(d._id) === String(vehicle.seller)) || pick(dealers);
    const isPaid = Math.random() < 0.6;
    const isCompleted = isPaid && Math.random() < 0.7;
    const order = await Order.create({
      customer: customer._id,
      vehicle: vehicle._id,
      dealer: dealer._id,
      amount: vehicle.price,
      paymentStatus: isPaid ? "paid" : "pending",
      orderStatus: isCompleted ? "completed" : pick(["pending", "processing", "cancelled"]),
      createdAt: daysAgo(rand(0, 35)),
    });
    if (order.paymentStatus === "paid") paidOrders.push(order);
    if (order.orderStatus === "completed") {
      vehicle.status = "sold";
      await vehicle.save();
    }
  }

  // Notifications (unread + recent)
  const notify = async (recipient, title, message, type, link) =>
    Notification.create({
      recipient,
      title,
      message,
      type,
      link,
      read: Math.random() < 0.45,
      createdAt: hoursFromNow(-rand(2, 240)),
    });

  for (const c of customers.slice(0, 5)) {
    await notify(c._id, "Welcome to AutoVerse", "Explore inventory and book a test drive when you’re ready.", "info", "/cars");
    await notify(c._id, "Wishlist updated", "We saved a few vehicles you might like based on your searches.", "success", "/dashboard/wishlist");
  }

  for (const d of dealers) {
    await notify(d._id, "New inquiry", "You have new customer inquiries waiting for your response.", "info", "/dashboard/dealer/inquiries");
    await notify(d._id, "Upcoming test drives", "Check your calendar for confirmed test drives this week.", "warning", "/dashboard/dealer/bookings");
  }

  await notify(admin._id, "Demo data seeded", "Dashboard now has richer demo data for users, vehicles and orders.", "success", "/dashboard/admin");
  for (const s of staff) {
    await notify(s._id, "Service queue updated", "New service requests are available in your console.", "info", "/dashboard/staff/services");
  }

  // Service requests (staff dashboard uses these)
  const serviceTypes = ["maintenance", "repair", "inspection", "customization"];
  for (let i = 0; i < 16; i += 1) {
    const customer = pick(customers);
    const vehicle = pick(vehicles);
    const assignee = pick(staff);
    const status = pick(["pending", "pending", "in-progress", "completed", "cancelled"]);
    await ServiceRequest.create({
      customer: customer._id,
      vehicle: vehicle._id,
      serviceType: pick(serviceTypes),
      description: pick([
        "Routine maintenance and fluid checks.",
        "Brake pads inspection and replacement.",
        "Engine noise diagnosis and fix.",
        "AC cooling performance issue.",
        "Pre-delivery inspection and detailing.",
      ]),
      status,
      assignedTo: assignee._id,
      scheduledDate: status === "pending" || status === "in-progress" ? daysFromNow(rand(1, 12)) : undefined,
      createdAt: daysAgo(rand(0, 25)),
    });
  }

  // Vehicle inspections (optional but useful for staff inspections page/api)
  const grade = ["excellent", "good", "fair", "poor"];
  for (let i = 0; i < 10; i += 1) {
    const vehicle = pick(vehicles);
    const inspector = pick(staff);
    await VehicleInspection.create({
      vehicle: vehicle._id,
      inspector: inspector._id,
      engineStatus: pick(grade),
      exteriorStatus: pick(grade),
      interiorStatus: pick(grade),
      tiresStatus: pick(grade),
      notes: Math.random() < 0.5 ? "Overall condition is consistent with mileage. Minor cosmetic wear." : "",
      inspectionDate: daysAgo(rand(0, 40)),
    });
  }

  console.log("Seed completed.");
  console.log(`Seed users created/updated: ${seedEmails.length} (password: ${seedPassword})`);
  console.log(`Vehicles ensured: ${vehicles.length}`);
  console.log(`Paid orders created: ${paidOrders.length}`);
}

main()
  .catch((err) => {
    console.error(err?.message || err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });

