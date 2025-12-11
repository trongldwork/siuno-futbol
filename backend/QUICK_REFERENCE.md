# 🚀 Quick Reference Card

## 🎯 New Features
- ✨ **ES Modules** - Modern import/export syntax
- 📚 **Swagger UI** - Interactive API docs at http://localhost:5000/api-docs

## Installation (One-Time Setup)
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

## Access Points
- **API Base:** http://localhost:5000/api
- **Swagger UI:** http://localhost:5000/api-docs ⭐ NEW
- **Health Check:** http://localhost:5000/health

## Environment Variables (Required)
```env
MONGODB_URI=mongodb://localhost:27017/siuno-futbol
JWT_SECRET=your_secret_key_min_32_characters
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Common Commands
```bash
# Start development server
npm run dev

# Start production server
npm start

# Install dependencies
npm install

# Check for errors
npm run dev (and watch console)
```

## API Endpoints Cheat Sheet

### Auth
```
POST   /api/auth/register          # Create account
POST   /api/auth/login             # Get token
GET    /api/auth/profile           # Get user info
```

### Team
```
POST   /api/users/create-team      # Create team (becomes Leader)
POST   /api/users/join             # Join with invite code
POST   /api/users/leave            # Leave team (no debt)
POST   /api/users/invite-link/renew # Renew code (Leader)
```

### Matches
```
POST   /api/matches                # Create match
GET    /api/matches?upcoming=true  # List upcoming
GET    /api/matches/:id            # Match details
POST   /api/matches/:id/vote       # Vote
POST   /api/matches/:id/request-change # Request change
POST   /api/matches/:id/approve-change # Approve (Leader)
PATCH  /api/matches/:id/lock       # Lock/unlock (Leader)
```

### Finance (Leader/Treasurer only)
```
GET    /api/finance/stats          # Overview
POST   /api/finance/monthly-fee    # Charge all members
POST   /api/finance/transaction    # Create transaction
POST   /api/finance/clear-debt     # Mark debt paid
```

## Request Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123","dob":"1990-01-15","position":"Striker","phone":"+123456"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'
```

### Create Team (with token)
```bash
curl -X POST http://localhost:5000/api/users/create-team \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"teamName":"My Team","monthlyFeeAmount":100000}'
```

## Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description"
}
```

## User Roles & Permissions

| Action | Member | Treasurer | Leader |
|--------|--------|-----------|--------|
| Vote on matches | ✅ | ✅ | ✅ |
| Create matches | ❌ | ✅ | ✅ |
| Manage finance | ❌ | ✅ | ✅ |
| Approve vote changes | ❌ | ❌ | ✅ |
| Renew invite link | ❌ | ❌ | ✅ |

## Vote Statuses
- **Participate** - Will attend match
- **Absent** - Cannot attend
- **Late** - Will arrive late

## Transaction Types
- **FundCollection** - Money added to fund
- **Expense** - Regular expense
- **GuestPayment** - Guest paid for match
- **MatchExpense** - Match cost with guest calculation
- **MonthlyFee** - Monthly membership fee

## Fund Calculation Formula
```
New Balance = Old Balance - Match Cost + (Match Cost / Total Participants × Guest Count)

Example:
Match Cost: 200,000
Participants: 20 (15 members + 5 guests)
Guest Count: 5
Cost per person: 10,000
Guest Payments: 50,000
Change: -200,000 + 50,000 = -150,000
```

## Common HTTP Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (no/invalid token)
- **403** - Forbidden (wrong role)
- **404** - Not Found
- **500** - Server Error

## Troubleshooting Quick Fixes

### "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
net start MongoDB
```

### "Port 5000 already in use"
```bash
# Kill process on port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

### "Invalid token"
- Check token format: "Bearer <token>"
- Token might be expired (30 days default)
- Login again to get new token

### "Cloudinary upload failed"
- Check credentials in .env
- Check file is jpg/jpeg/png/pdf
- Check file size < 5MB

## File Structure Overview
```
backend/
├── server.js              # Main file
├── package.json           # Dependencies
├── .env                   # Your config (create from .env.example)
├── config/                # Setup files
├── models/                # Database schemas
├── controllers/           # Business logic
├── routes/                # API endpoints
└── middleware/            # Auth & upload
```

## Testing Workflow

1. **Register** → Save token
2. **Create Team** → Save invite code
3. **Create Match** → Save match ID
4. **Vote** → Use match ID
5. **Trigger Monthly Fee** → Check debt
6. **Clear Debt** → Upload proof image

## Important Files
- **README.md** - Full API documentation
- **SETUP_GUIDE.md** - Installation guide
- **POSTMAN_COLLECTION.json** - Import to Postman
- **PROJECT_SUMMARY.md** - Project overview
- **.env.example** - Environment template

## Default Values
- Port: 5000
- JWT Expiry: 30 days
- File Size Limit: 5MB
- Default Monthly Fee: 100,000

## Development Tips
1. Use **Swagger UI** for testing (http://localhost:5000/api-docs) ⭐
2. Or use Postman with collection file
3. Check server console for logs
4. Read error messages carefully
5. Start with auth endpoints first
6. Save tokens for authenticated requests
7. Test incrementally

---

**Quick Start:** `npm install` → Edit `.env` → `npm run dev` → Open Swagger UI

**Swagger UI:** http://localhost:5000/api-docs 🎉
**Stuck?** Check ESM_MIGRATION.md, SETUP_GUIDE.md or README.md
