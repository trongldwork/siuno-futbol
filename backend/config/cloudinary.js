import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
const config = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
};

console.log('Cloudinary config values:', {
  cloud_name: config.cloud_name || 'undefined',
  api_key: config.api_key ? '***' : 'undefined',
  api_secret: config.api_secret ? '***' : 'undefined'
});

cloudinary.config(config);

// Bypass SSL certificate verification in development (not recommended for production)
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('⚠️  SSL certificate verification disabled for development');
}

export default cloudinary;
