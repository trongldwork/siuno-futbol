import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

// Verify Cloudinary env vars
console.log('Cloudinary Config Check:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing');

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/database.js';
import swaggerSpec from './config/swagger.js';

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Siuno Futbol API Docs'
}));

// API Routes - using dynamic imports to ensure env vars are loaded first
const setupRoutes = async () => {
  const authRoutes = (await import('./routes/authRoutes.js')).default;
  const userRoutes = (await import('./routes/userRoutes.js')).default;
  const financeRoutes = (await import('./routes/financeRoutes.js')).default;
  const matchRoutes = (await import('./routes/matchRoutes.js')).default;
  const adminRoutes = (await import('./routes/adminRoutes.js')).default;

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/finance', financeRoutes);
  app.use('/api/matches', matchRoutes);
  app.use('/api/admin', adminRoutes);

  // 404 handler - must be after all routes
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  });

  // Global error handler - must be last
  app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    // Mongoose duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    // Multer file upload error
    if (err.name === 'MulterError') {
      return res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`
      });
    }

    // Default error
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });
};

// Start server
const PORT = process.env.PORT || 5000;

// Setup routes and start server
setupRoutes().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to setup routes:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
