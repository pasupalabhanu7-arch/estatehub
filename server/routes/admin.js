const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('admin'));

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [users, properties, available, inquiries] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Property.countDocuments({ status: 'available' }),
      Inquiry.countDocuments(),
    ]);
    res.json({ users, properties, available, closed: properties - available, inquiries });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const items = await User.find().sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:id  (also removes their listings)
router.delete('/users/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const props = await Property.find({ owner: user._id }).select('_id');
    const ids = props.map((p) => p._id);
    await Property.deleteMany({ owner: user._id });
    await Inquiry.deleteMany({ $or: [{ from: user._id }, { to: user._id }, { property: { $in: ids } }] });
    await User.updateMany({}, { $pull: { favorites: { $in: ids } } });
    await user.deleteOne();
    res.json({ message: 'User and their listings deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
