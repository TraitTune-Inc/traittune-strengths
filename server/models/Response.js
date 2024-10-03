// server/models/Response.js

const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Убрали required: true
  tempId: { type: String },
  responses: [
    {
      questionId: String,
      domain: String,
      value: Number,
    },
  ],
  domainScores: { type: Map, of: Number },
  totalScore: Number,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Response', responseSchema);
