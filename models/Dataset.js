const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const datasetSchema = new Schema({
  fileName: String,
  fileSize: Number,
  downloadLocation: String,
  userId: String,
  uniqueIdentifier: String,
});

const Dataset = mongoose.models.Dataset || mongoose.model('Dataset', datasetSchema);

module.exports = Dataset;
