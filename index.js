const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const downloadRoutes = require('./routes/downloadRoutes');

const app = express();
const PORT = 3000;

// Connect to the database
connectDB();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api', downloadRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
