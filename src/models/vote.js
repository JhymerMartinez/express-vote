const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  comment: String,
  elector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Vote', VoteSchema);
