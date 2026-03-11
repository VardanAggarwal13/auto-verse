const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const admin = require('../firebaseAdmin');
const { sendMail, hasSmtpConfig } = require('../utils/mailer');

// @route   POST api/auth/google-login
// @desc    Authenticate user with Google credentials
// @access  Public
router.post('/google-login', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });

    if (user) {
      // If user exists but doesn't have firebaseUid (e.g., they re-used an email), link it
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        name: name || email.split('@')[0],
        email: email,
        firebaseUid: uid,
        role: 'customer',
        avatar: picture
      });
      await user.save();
    }

    // Create JWT token for our backend API
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Google login error:', err.message);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate password length
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // SECURITY: Never allow public registration to create privileged roles.
    // Only allow customer/dealer via this endpoint.
    const requestedRole = role || 'customer';
    if (!['customer', 'dealer'].includes(requestedRole)) {
      return res.status(403).json({ message: 'Invalid role for public registration' });
    }

    let user = new User({
      name,
      email,
      password,
      role: requestedRole
    });

    await user.save();

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// @route   POST api/auth/forgot-password
// @desc    Request password reset link (if account has password auth)
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    // Always return a generic success response to avoid leaking which emails exist.
    const okResponse = () =>
      res.json({ message: 'If an account exists for this email, a reset link has been sent.' });

    if (!user) return okResponse();

    // Google-only accounts won't have a password to reset.
    if (user.firebaseUid && !user.password) return okResponse();

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:8080').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(rawToken)}`;

    const subject = 'Reset your AutoVerse password';
    const text = `Reset your password using this link (valid for 1 hour):\n\n${resetUrl}\n`;

    if (hasSmtpConfig()) {
      await sendMail({
        to: email,
        subject,
        text,
        html: `<p>Reset your password (valid for 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
      });
      return okResponse();
    }

    // Dev fallback when SMTP isn't configured.
    console.log('[forgot-password] Reset link:', resetUrl);
    return res.json({
      message: 'Reset link generated (SMTP not configured). Check server logs for the link.',
      resetUrl,
    });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// @route   POST api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    const token = String(req.body?.token || '').trim();
    const password = String(req.body?.password || '');

    if (!email || !token || !password) {
      return res.status(400).json({ message: 'Email, token, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordTokenHash = '';
    user.resetPasswordExpiresAt = null;
    await user.save();

    res.json({ message: 'Password reset successful. Please log in.' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
