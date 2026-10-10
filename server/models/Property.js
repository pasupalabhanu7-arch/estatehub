const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 3000 },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    listingType: { type: String, enum: ['sale', 'rent'], required: [true, 'Listing type is required'] },
    propertyType: {
      type: String,
      enum: ['apartment', 'house', 'villa', 'plot', 'commercial'],
      default: 'apartment',
    },
    status: { type: String, enum: ['available', 'sold', 'rented'], default: 'available' },
    bedrooms: { type: Number, default: 0, min: 0 },
    bathrooms: { type: Number, default: 0, min: 0 },
    area: { type: Number, default: 0, min: 0 }, // square feet
    location: {
      address: { type: String, trim: true, default: '' },
      city: { type: String, required: [true, 'City is required'], trim: true },
      state: { type: String, trim: true, default: '' },
    },
    images: [{ type: String, trim: true }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

propertySchema.index({ title: 'text', description: 'text', 'location.city': 'text' });

module.exports = mongoose.model('Property', propertySchema);
