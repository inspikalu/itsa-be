// Import required modules
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import route files
const adminRoutes = require('./routes/adminRoutes');
const subAdminRoutes = require('./routes/subAdminRoutes')
const organizationRoutes = require('./routes/organizationRoutes');
const staffRoutes = require('./routes/staffRoutes');
const technicianRoutes = require('./routes/technicianRoutes');

// Import database configuration
const connectDB = require('./config/database'); // Ensure this path is correct

// Initialize Express app
const app = express();

// Middleware setup
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

app.use((req, res, next)=>{console.log(req.body, req.headers); next()})

// Define routes
app.post('/api/device', (req, res)=>{res.send(req.body)})
app.use('/api/admin', adminRoutes);
app.use('/api/subadmin', subAdminRoutes )
app.use('/api/organization', organizationRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/technician', technicianRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
