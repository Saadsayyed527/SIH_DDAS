const express = require('express');
const router = express.Router();
const Dataset = require('../models/Dataset');
const Dataset2 = require('../models/Dataset2');

// Handle a download request
router.post('/download', async (req, res) => {
  const { fileName, fileSize, userId, uniqueIdentifier } = req.body;

  try {
    // Check if the file has already been downloaded by anyone
    const duplicateDataset = await Dataset.findOne({ uniqueIdentifier });

    if (duplicateDataset) {
      return res.status(400).json({
        message: 'Duplicate dataset found. No need to download again.',
        data: {
          fileName: duplicateDataset.fileName,
          fileSize: duplicateDataset.fileSize,
          downloadLocation: duplicateDataset.downloadLocation,
          timestamp: duplicateDataset.timestamp,
        },
      });
    }

    // If not a duplicate, proceed with the download (simulation)
    const newDataset = new Dataset({
      fileName,
      fileSize,
      downloadLocation: `/downloads/${fileName}`,
      userId,
      uniqueIdentifier,
    });

    await newDataset.save();

    res.status(200).json({
      message: 'Download successful',
      data: {
        fileName: newDataset.fileName,
        downloadLocation: newDataset.downloadLocation,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get all datasets in the database
router.get('/all', async (req, res) => {
  try {
    const datasets = await Dataset.find();  // Fetch all datasets from MongoDB
    res.status(200).json(datasets);         // Return the datasets as a JSON response
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// "Year Mean" 
router.post('/yearmean', async (req, res) => {
  const { year, userId } = req.body;

  // Manual validation
  if (!year || !Number.isInteger(year) || year < 0) {
    return res.status(400).json({ message: 'Year must be a positive integer' });
  }
  
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: 'User ID is required and must be a string' });
  }

  try {
    // Check if the user has already requested data for the given year
    const duplicateRequest = await Dataset2.findOne({ year, userId });

    if (duplicateRequest) {
      return res.status(400).json({
        message: 'Duplicate download detected. You have already downloaded data for this year.',
        data: {
          year: duplicateRequest.year,
          date: duplicateRequest.date,
          values: duplicateRequest.values,
          uncertainties: duplicateRequest.uncertainties
        }
      });
    }

    // Fetch the dataset for the requested year
    const datasetForYear = await Dataset2.findOne({ year });

    if (!datasetForYear) {
      return res.status(404).json({ message: `No data available for the year ${year}.` });
    }

    // Save the request to the database (to track this download)
    const newRequest = new Dataset2({
      date: datasetForYear.date,
      values: datasetForYear.values,
      uncertainties: datasetForYear.uncertainties,
      year: datasetForYear.year,
      userId
    });

    await newRequest.save();

    res.status(200).json({
      message: `Data for year ${year} retrieved successfully.`,
      data: {
        year: datasetForYear.year,
        date: datasetForYear.date,
        values: datasetForYear.values,
        uncertainties: datasetForYear.uncertainties
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

router.post('/addyear', async (req, res) => {
  const { yearData } = req.body; // Expecting an array of data

  // Validate yearData format
  if (!Array.isArray(yearData)) {
    return res.status(400).json({ message: 'Invalid data format. Expected an array of year data.' });
  }

  try {
    // Prepare an array of documents to be inserted
    const documents = yearData.map(item => ({
      date: new Date(item.date),
      values: item.values,
      uncertainties: item.uncertainties,
      year: new Date(item.date).getFullYear() // Extract the year from the date
    }));

    // Insert documents into the dataset
    await Dataset2.insertMany(documents);

    res.status(201).json({
      message: 'Year data added successfully',
      data: documents
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});



module.exports = router;
