# Development Checklist

## ✅ Pre-Installation Checklist

- [ ] Node.js installed (v14 or higher)
- [ ] MongoDB installed locally OR MongoDB Atlas account created
- [ ] Cloudinary account created (free tier is fine)
- [ ] Git installed (optional, for version control)
- [ ] Postman or similar API testing tool installed

## ✅ Installation Steps

- [ ] Navigate to backend directory: `cd backend`
- [ ] Install dependencies: `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in MongoDB URI in `.env`
- [ ] Fill in Cloudinary credentials in `.env`
- [ ] Generate a strong JWT secret (min 32 characters)
- [ ] Start MongoDB (if using local installation)
- [ ] Start the server: `npm run dev`
- [ ] Verify server is running (check console for "Server running...")

## ✅ Testing Checklist

### 1. Authentication
- [ ] Register a new user
- [ ] Login with credentials
- [ ] Get user profile with token
- [ ] Test invalid credentials
- [ ] Test missing token

### 2. Team Management
- [ ] Create a team (becomes Leader)
- [ ] Get invite code from response
- [ ] Register a second user
- [ ] Join team with invite code
- [ ] Renew invite link as Leader
- [ ] Try to join with old code (should fail)
- [ ] Try to leave team without debt
- [ ] Try to leave team with debt (should fail)

### 3. Match Management
- [ ] Create a match as Leader/Treasurer
- [ ] Get list of upcoming matches
- [ ] Vote for a match before deadline
- [ ] Try to vote after deadline (should fail)
- [ ] Request vote change after deadline
- [ ] Approve vote change as Leader
- [ ] Lock a match as Leader
- [ ] Try to vote on locked match (should fail)

### 4. Finance Management
- [ ] Get finance stats
- [ ] Trigger monthly fee collection
- [ ] Verify all users have debt added
- [ ] Create a simple expense transaction
- [ ] Upload proof image with transaction
- [ ] Create a match expense with guest calculation
- [ ] Verify fund balance updated correctly
- [ ] Clear a user's debt
- [ ] Verify fund balance increased

### 5. Error Handling
- [ ] Test with invalid ObjectId
- [ ] Test with missing required fields
- [ ] Test with invalid file types
- [ ] Test with file too large (>5MB)
- [ ] Test unauthorized access (no token)
- [ ] Test forbidden access (wrong role)

## ✅ Code Quality Checklist

- [x] All models have proper validation
- [x] All routes are protected with authentication
- [x] Role-based access control implemented
- [x] Error handling in all controllers
- [x] Consistent response format
- [x] Passwords are hashed
- [x] JWT tokens are used correctly
- [x] File uploads are validated
- [x] Database connections are handled properly
- [x] Environment variables are used for sensitive data

## ✅ Documentation Checklist

- [x] README.md with API documentation
- [x] SETUP_GUIDE.md with installation steps
- [x] POSTMAN_COLLECTION.json for testing
- [x] PROJECT_SUMMARY.md with overview
- [x] .env.example with all variables
- [x] Code comments where needed
- [x] All endpoints documented

## ✅ Security Checklist

- [x] Passwords are hashed with bcrypt
- [x] JWT secrets are in environment variables
- [x] Sensitive data not exposed in responses
- [x] File upload validation (type and size)
- [x] MongoDB injection prevention (Mongoose)
- [x] CORS enabled
- [x] Error messages don't leak sensitive info

## 🚀 Deployment Checklist (When Ready)

- [ ] Set NODE_ENV to production
- [ ] Use strong JWT secret (32+ characters)
- [ ] Use MongoDB Atlas for database
- [ ] Set up Cloudinary production account
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Add rate limiting
- [ ] Set up logging
- [ ] Add monitoring (e.g., Sentry)
- [ ] Set up automated backups
- [ ] Configure environment variables on hosting platform
- [ ] Test all endpoints in production
- [ ] Set up CI/CD (optional)

## 📝 Known Limitations & Future Enhancements

### Current Limitations
- No email notifications
- No password reset functionality
- No refresh tokens (only access tokens)
- No pagination on list endpoints
- No search/filter functionality
- No rate limiting

### Planned Enhancements
- [ ] Add email verification
- [ ] Add password reset via email
- [ ] Implement refresh tokens
- [ ] Add pagination for matches/transactions
- [ ] Add search and filtering
- [ ] Add rate limiting
- [ ] Add Swagger documentation
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add caching (Redis)
- [ ] Add real-time notifications (Socket.io)
- [ ] Add analytics dashboard data

## 🐛 Troubleshooting

### Server won't start
1. Check if MongoDB is running
2. Check if port 5000 is available
3. Check .env file exists and has all variables
4. Check npm install completed successfully

### Cannot upload files
1. Check Cloudinary credentials in .env
2. Check file type is allowed (jpg, jpeg, png, pdf)
3. Check file size is under 5MB
4. Check internet connection

### Database connection error
1. Check MongoDB is running
2. Check MONGODB_URI is correct
3. For Atlas: check IP whitelist
4. For Atlas: check username/password

### Authentication errors
1. Check token is included in Authorization header
2. Check token format: "Bearer <token>"
3. Check token hasn't expired (default 30 days)
4. Check JWT_SECRET is set correctly

## 💡 Tips

1. **Use Postman collection** - Import the provided JSON file
2. **Save tokens** - Set up environment variable in Postman
3. **Check console logs** - Server logs all requests in dev mode
4. **Test incrementally** - Start with auth, then teams, then matches
5. **Read error messages** - They're descriptive and helpful
6. **Check model files** - See what fields are required
7. **Use .env.example** - Don't commit your .env file

## 📞 Getting Help

If you encounter issues:
1. Check this checklist
2. Read the error message carefully
3. Check the console logs
4. Review the relevant controller/model
5. Check the API documentation in README.md
6. Verify your .env variables are correct

---

**Last Updated:** December 11, 2025
