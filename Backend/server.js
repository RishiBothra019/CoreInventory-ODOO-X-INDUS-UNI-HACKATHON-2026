const express = require('express');
const cors = require('cors');
require('dotenv').config();
const apiRoutes = require('./routes');

const app = express();

// Middleware
app.use(cors()); // Allows your frontend to talk to your backend
app.use(express.json()); // Allows backend to understand JSON data

// Routes
app.use('/api', apiRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 CoreInventory Backend running on http://localhost:${PORT}`);
});