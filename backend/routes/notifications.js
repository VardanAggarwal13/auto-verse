const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth, checkRole } = require('../middleware/auth');

// @route   GET api/notifications
// @desc    Get all notifications for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort('-createdAt')
      .limit(20);
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.patch('/:id/read', auth, async (req, res) => {
  try {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/notifications/read-all
// @desc    Mark all notifications as read for current user
// @access  Private
router.patch('/read-all', auth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.json({ modifiedCount: result.modifiedCount ?? result.nModified ?? 0 });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/notifications
// @desc    Create a notification (Internal use mainly)
// @access  Private (Admin, Staff)
router.post('/', [auth, checkRole(['admin', 'staff'])], async (req, res) => {
    try {
        const { recipient, title, message, type, link } = req.body;
        if (!recipient || !title || !message) {
            return res.status(400).json({ message: 'recipient, title, and message are required' });
        }
        const newNotification = new Notification({
            recipient,
            title,
            message,
            type,
            link
        });
        await newNotification.save();

        const io = req.app.get('socketio');
        if (io) {
            io.to(String(recipient)).emit('notification', {
                title: newNotification.title,
                message: newNotification.message,
                type: newNotification.type,
                link: newNotification.link,
            });
        }
        res.json(newNotification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
