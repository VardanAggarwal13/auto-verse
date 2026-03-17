const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Required when running behind proxies (e.g., Render) so req.protocol works via X-Forwarded-Proto.
app.set('trust proxy', 1);

const corsOriginsRaw = (process.env.CORS_ORIGINS || '').trim();
const allowedOrigins = corsOriginsRaw
  ? corsOriginsRaw.split(',').map((o) => o.trim()).filter(Boolean)
  : [
      'http://localhost:8080',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
    ];

const parseOrigin = (origin) => {
  try {
    return new URL(origin);
  } catch {
    return null;
  }
};

// Supports:
// - Exact match: https://example.com
// - Host wildcard: *.vercel.app or https://*.vercel.app
// - Optional port: http://localhost:5173 or *.example.com:443
const originMatchesRule = (originUrl, rule) => {
  if (!originUrl) return false;
  if (rule === '*') return true;
  if (rule === originUrl.origin) return true;

  const hasScheme = rule.includes('://');
  const [ruleScheme, ruleRest] = hasScheme ? rule.split('://') : [null, rule];
  const hostPort = (ruleRest || '').split('/')[0].trim();
  if (!hostPort) return false;

  const [ruleHostRaw, rulePortRaw] = hostPort.split(':');
  const ruleHost = (ruleHostRaw || '').trim().toLowerCase();
  const rulePort = (rulePortRaw || '').trim();
  if (!ruleHost) return false;

  if (ruleScheme && `${ruleScheme.toLowerCase()}:` !== originUrl.protocol) return false;
  if (rulePort && rulePort !== originUrl.port) return false;

  const originHost = originUrl.hostname.toLowerCase();
  if (ruleHost.startsWith('*.')) {
    const suffix = ruleHost.slice(1); // ".vercel.app"
    return originHost.endsWith(suffix);
  }

  return originHost === ruleHost;
};

const isOriginAllowed = (origin) => {
  if (!origin) return true; // same-origin / non-browser clients
  const originUrl = parseOrigin(origin);
  if (!originUrl) return false;
  return allowedOrigins.some((rule) => originMatchesRule(originUrl, rule));
};

// Middleware
app.use(cors({
  // If CORS_ORIGINS="*", reflect request origin (works with credentials).
  origin: allowedOrigins.includes('*')
    ? true
    : (origin, callback) => {
        if (isOriginAllowed(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked origin: ${origin}`));
      },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
// Serve locally uploaded files (used when Cloudinary isn't configured).
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const http = require('http');
const { Server } = require('socket.io');

// Routes Placeholder
app.get('/', (req, res) => {
  res.send('Auto Hub API is running...');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.includes('*')
      ? '*'
      : (origin, callback) => {
          if (isOriginAllowed(origin)) return callback(null, true);
          return callback(new Error(`CORS blocked origin: ${origin}`));
        },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Make io accessible to routes
app.set('socketio', io);

// Import Routes
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const inquiryRoutes = require('./routes/inquiries');
const userRoutes = require('./routes/users');
const bookingRoutes = require('./routes/bookings');
const dealerRoutes = require('./routes/dealer');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const staffRoutes = require('./routes/staff');
const notificationRoutes = require('./routes/notifications');
const uploadRoutes = require('./routes/uploads');

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dealer', dealerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MongoDB connection error: MONGODB_URI is not set');
  process.exit(1);
}

const mongoFamilyRaw = (process.env.MONGO_FAMILY || '').trim();
const mongoFamily = mongoFamilyRaw ? Number(mongoFamilyRaw) : undefined;

mongoose.connect(MONGODB_URI, {
  ...(mongoFamily ? { family: mongoFamily } : {}),
  serverSelectionTimeoutMS: process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS
    ? Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS)
    : undefined,
  connectTimeoutMS: process.env.MONGO_CONNECT_TIMEOUT_MS
    ? Number(process.env.MONGO_CONNECT_TIMEOUT_MS)
    : undefined,
})
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
