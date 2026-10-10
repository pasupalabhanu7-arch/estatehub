const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
