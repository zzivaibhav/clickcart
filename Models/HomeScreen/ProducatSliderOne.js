const mongoose = require('mongoose');
const productSliderOneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const ProducSliderOne = mongoose.model(
  'ProductSliderOne',
  productSliderOneSchema,
);
module.exports = ProducSliderOne;
