const File = require('../models/File');
const crypto = require('crypto');

// Function to generate file hash (SHA-256)
const generateFileHash = (fileBuffer) => {
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};

// Upload file and check for duplicates
const uploadFile = async (req, res) => {
  try {
    // Get file information from multer
    const { originalname: fileName, size: fileSize } = req.file;
    const fileBuffer = req.file.buffer;
    const { downloadPath, userId } = req.body;

    // Generate file hash using the file's content
    const fileHash = generateFileHash(fileBuffer);

    // Check if the file already exists (using fileHash)
    const duplicateFile = await File.findOne({ fileHash });

    if (duplicateFile) {
      return res.status(400).json({
        message: 'Duplicate file detected',
        duplicateFile,
      });
    }

    // If no duplicate is found, save the file metadata in the database
    const newFile = new File({
      fileName,
      fileSize,
      fileHash,
      downloadPath,
      downloadedBy: userId,
    });

    await newFile.save();
    res.status(201).json({ message: 'File uploaded successfully', fileId: newFile._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = { uploadFile };
