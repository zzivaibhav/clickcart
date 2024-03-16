const mongoose = require('mongoose');
const carousalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const Carousal = mongoose.model('carousal', carousalSchema);
module.exports = Carousal;
