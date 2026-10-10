const express = require('express');
const mongoose = require('mongoose');
const Property = require('../models/Property');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Reject malformed ids early so we return 400/404 instead of a CastError
const validId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Property not found' });
  }
  next();
};

// Fields an owner is allowed to set
const pickFields = (body) => {
  const out = {};
  [
    'title', 'description', 'price', 'listingType', 'propertyType', 'status',
    'bedrooms', 'bathrooms', 'area', 'images',
  ].forEach((k) => {
    if (body[k] !== undefined) out[k] = body[k];
  });
  if (body.location) out.location = body.location;
  if (Array.isArray(out.images)) out.images = out.images.map((s) => String(s).trim()).filter(Boolean);
  return out;
};

// GET /api/properties  -> public list with search + filters + pagination
router.get('/', async (req, res, next) => {
  try {
    const { q, city, listingType, propertyType, status, minPrice, maxPrice, bedrooms, sort } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 9, 1), 50);

    const filter = {};
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ title: rx }, { description: rx }, { 'location.city': rx }, { 'location.address': rx }];
    }
    if (city) filter['location.city'] = new RegExp(escapeRegex(city), 'i');
    if (listingType) filter.listingType = listingType;
    if (propertyType) filter.propertyType = propertyType;
    if (status) filter.status = status;
    if (bedrooms) filter.bedrooms = { $gte: Number(bedrooms) };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
    };

    const [items, total] = await Promise.all([
      Property.find(filter)
        .sort(sortMap[sort] || sortMap.newest)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('owner', 'name email phone'),
      Property.countDocuments(filter),
    ]);

    res.json({ items, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
  } catch (err) {
    next(err);
  }
});

// GET /api/properties/mine  -> listings of the logged in owner (admin sees none here)
router.get('/mine', protect, authorize('owner', 'admin'), async (req, res, next) => {
  try {
    const items = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// GET /api/properties/favorites  -> saved listings of the logged in user
router.get('/favorites', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'owner', select: 'name email phone' },
    });
    res.json({ items: user.favorites.filter(Boolean) });
  } catch (err) {
    next(err);
  }
});

// GET /api/properties/:id
router.get('/:id', validId, async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email phone');
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (err) {
    next(err);
  }
});

// POST /api/properties  -> owner or admin
router.post('/', protect, authorize('owner', 'admin'), async (req, res, next) => {
  try {
    const property = await Property.create({ ...pickFields(req.body), owner: req.user._id });
    res.status(201).json(property);
  } catch (err) {
    next(err);
  }
});

// PUT /api/properties/:id  -> only the owner of the listing, or an admin
router.put('/:id', protect, validId, async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    const isOwner = property.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own listings' });
    }
    property.set(pickFields(req.body));
    await property.save();
    res.json(property);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/properties/:id  -> only the owner of the listing, or an admin
router.delete('/:id', protect, validId, async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    const isOwner = property.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own listings' });
    }
    await property.deleteOne();
    await User.updateMany({ favorites: property._id }, { $pull: { favorites: property._id } });
    res.json({ message: 'Property deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /api/properties/:id/favorite  -> toggle favorite
router.post('/:id/favorite', protect, validId, async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    const user = await User.findById(req.user._id);
    const exists = user.favorites.some((f) => f.toString() === property._id.toString());
    if (exists) user.favorites.pull(property._id);
    else user.favorites.push(property._id);
    await user.save();
    res.json({ favorited: !exists, favorites: user.favorites });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
