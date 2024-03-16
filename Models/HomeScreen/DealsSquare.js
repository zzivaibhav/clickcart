const mongoose = require('mongoose');
const dealsSquare = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  off: {
    type: Number,
    required: true,
  },
});

const DealsSquare = mongoose.model('DealsSquare', dealsSquare);
module.exports = DealsSquare;
