# Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)

## Step-by-Step Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup MongoDB
**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running on localhost:27017
```

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string
4. Use it in .env file

### 3. Setup Cloudinary
1. Create a free account at https://cloudinary.com
2. Go to Dashboard
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

### 4. Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values
```

Required `.env` values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/siuno-futbol
JWT_SECRET=your_random_secret_key_min_32_chars
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
DEFAULT_MONTHLY_FEE=100000
```

### 5. Start the Server
```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

You should see:
```
MongoDB Connected: localhost
Server running in development mode on port 5000
```

## Testing the API

### Using cURL

**1. Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "dob": "1990-01-15",
    "position": "Striker",
    "phone": "+1234567890"
  }'
```

**2. Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Save the token from the response!

**3. Create a team:**
```bash
curl -X POST http://localhost:5000/api/users/create-team \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "teamName": "FC Barcelona",
    "monthlyFeeAmount": 100000
  }'
```

**4. Get profile:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import the collection (see POSTMAN_COLLECTION.json)
2. Create an environment variable `token` 
3. After login, copy the token to the environment
4. Test all endpoints

## Common Issues

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running
```bash
# Windows (if installed as service)
net start MongoDB

# Or run manually
mongod
```

### Cloudinary Upload Error
```
Error: Must supply api_key
```
**Solution:** Check your `.env` file has correct Cloudinary credentials

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in `.env` or kill the process using port 5000
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

## Project Structure
```
backend/
├── config/
│   ├── cloudinary.js       # Cloudinary configuration
│   └── database.js         # MongoDB connection
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── userController.js   # User/Team management
│   ├── financeController.js # Finance operations
│   └── matchController.js  # Match and voting logic
├── middleware/
│   ├── auth.js            # JWT authentication
│   └── upload.js          # File upload (Multer + Cloudinary)
├── models/
│   ├── User.js            # User schema
│   ├── Team.js            # Team schema
│   ├── Match.js           # Match schema
│   ├── Vote.js            # Vote schema
│   └── Transaction.js     # Transaction schema
├── routes/
│   ├── authRoutes.js      # Auth endpoints
│   ├── userRoutes.js      # User/Team endpoints
│   ├── financeRoutes.js   # Finance endpoints
│   └── matchRoutes.js     # Match endpoints
├── .env                   # Environment variables (create from .env.example)
├── .env.example           # Environment template
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies
├── server.js             # Main entry point
└── README.md             # Documentation
```

## Next Steps

1. ✅ Complete backend setup
2. 📱 Build frontend (React/Vue/Angular)
3. 🔐 Implement refresh tokens
4. 📧 Add email notifications
5. 📊 Add analytics dashboard
6. 🚀 Deploy to production

## Deployment

### Heroku
```bash
heroku create siuno-futbol-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_atlas_uri
heroku config:set JWT_SECRET=your_secret
# ... set other env vars
git push heroku main
```

### Railway / Render
1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy automatically

## Support

For issues or questions, check:
- README.md for API documentation
- Database schema in models/
- Example requests in this file
