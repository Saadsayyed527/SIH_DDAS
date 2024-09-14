const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dataset2Schema = new Schema({
  year: Number,
  date: Date,
  values: [Number],
  uncertainties: [Number],
  userId: String,
});

const Dataset2 = mongoose.models.Dataset2 || mongoose.model('Dataset2', dataset2Schema);

module.exports = Dataset2;
