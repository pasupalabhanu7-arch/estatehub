const express = require('express');
const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/inquiries  { property, message }
router.post('/', protect, async (req, res, next) => {
  try {
    const { property, message } = req.body;
    if (!mongoose.isValidObjectId(property)) {
      return res.status(400).json({ message: 'Valid property id is required' });
    }
    const prop = await Property.findById(property);
    if (!prop) return res.status(404).json({ message: 'Property not found' });
    if (prop.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot send an inquiry on your own listing' });
    }
    const inquiry = await Inquiry.create({
      property: prop._id,
      from: req.user._id,
      to: prop.owner,
      message,
    });
    res.status(201).json(inquiry);
  } catch (err) {
    next(err);
  }
});

// GET /api/inquiries/received  -> inquiries about my listings
router.get('/received', protect, async (req, res, next) => {
  try {
    const items = await Inquiry.find({ to: req.user._id })
      .sort({ createdAt: -1 })
      .populate('property', 'title')
      .populate('from', 'name email phone');
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// GET /api/inquiries/sent  -> inquiries I sent
router.get('/sent', protect, async (req, res, next) => {
  try {
    const items = await Inquiry.find({ from: req.user._id })
      .sort({ createdAt: -1 })
      .populate('property', 'title');
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
