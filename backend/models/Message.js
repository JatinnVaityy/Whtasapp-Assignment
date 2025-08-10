const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  wa_id: String,
  name: String,
  from: String,
  timestamp: String,
  type: String,
  text: Object,
  status: { type: String, default: 'sent' }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
