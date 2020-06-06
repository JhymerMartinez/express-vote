const mongoose = require('mongoose');

const AreaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
});

AreaSchema
  .path('name')
  .validate(async function(value) {
    const area =  await this.constructor.findOne({ name: value });
    if(area) {
      return false;
    }
    return true;
  }, 'The specified area name already exists.');

module.exports = mongoose.model('Area', AreaSchema);
