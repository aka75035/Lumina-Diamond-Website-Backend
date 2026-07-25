const mongoose = require('mongoose');

const { Schema } = mongoose;

const simplePriceSchema = new Schema(
  {
    metalType: { type: String, required: true },
    purity: { type: String, default: '999' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SimplePrice', simplePriceSchema);
