# 📁 Complete Backend Directory Structure

```
siuno-futbol/backend/
│
├── 📄 server.js                        # Main Express application entry point
├── 📄 package.json                     # Dependencies and scripts
├── 📄 .env.example                     # Environment variables template
├── 📄 .gitignore                       # Git ignore rules
│
├── 📚 Documentation/
│   ├── 📄 README.md                    # Complete API documentation
│   ├── 📄 SETUP_GUIDE.md              # Installation guide
│   ├── 📄 PROJECT_SUMMARY.md          # Project overview
│   ├── 📄 CHECKLIST.md                # Development checklist
│   └── 📄 POSTMAN_COLLECTION.json     # Postman API collection
│
├── ⚙️ config/
│   ├── 📄 database.js                 # MongoDB connection setup
│   └── 📄 cloudinary.js               # Cloudinary configuration
│
├── 📋 models/
│   ├── 📄 User.js                     # User schema & methods
│   │   ├── Fields: name, email, password, dob, position, phone, role, debt, isActive, teamId
│   │   └── Methods: comparePassword(), pre-save password hashing
│   │
│   ├── 📄 Team.js                     # Team schema & methods
│   │   ├── Fields: name, inviteCode, monthlyFeeAmount, currentFundBalance, createdBy
│   │   └── Methods: generateInviteCode()
│   │
│   ├── 📄 Match.js                    # Match schema & virtuals
│   │   ├── Fields: time, location, opponentName, contactPerson, votingDeadline, isLocked
│   │   ├──         matchCost, totalParticipants, guestCount, teamId, createdBy
│   │   └── Virtuals: isVotingOpen
│   │
│   ├── 📄 Vote.js                     # Vote schema & indexes
│   │   ├── Fields: userId, matchId, status, note, isApprovedChange
│   │   ├──         changeRequestedAt, changeReason
│   │   └── Index: Compound unique on (userId, matchId)
│   │
│   └── 📄 Transaction.js              # Transaction schema
│       └── Fields: amount, type, description, proofImage, relatedMatchId
│                   relatedUserId, teamId, createdBy
│
├── 🎮 controllers/
│   ├── 📄 authController.js           # Authentication logic
│   │   ├── register()                 # POST /api/auth/register
│   │   ├── login()                    # POST /api/auth/login
│   │   └── getProfile()               # GET  /api/auth/profile
│   │
│   ├── 📄 userController.js           # User & Team management
│   │   ├── createTeam()               # POST /api/users/create-team
│   │   ├── joinTeam()                 # POST /api/users/join
│   │   ├── leaveTeam()                # POST /api/users/leave
│   │   └── renewInviteLink()          # POST /api/users/invite-link/renew
│   │
│   ├── 📄 financeController.js        # Finance operations
│   │   ├── getFinanceStats()          # GET  /api/finance/stats
│   │   ├── triggerMonthlyFee()        # POST /api/finance/monthly-fee
│   │   ├── createTransaction()        # POST /api/finance/transaction
│   │   └── clearDebt()                # POST /api/finance/clear-debt
│   │
│   └── 📄 matchController.js          # Match & Voting logic
│       ├── createMatch()              # POST  /api/matches
│       ├── getMatches()               # GET   /api/matches
│       ├── getMatchDetails()          # GET   /api/matches/:id
│       ├── voteForMatch()             # POST  /api/matches/:id/vote
│       ├── requestVoteChange()        # POST  /api/matches/:id/request-change
│       ├── approveVoteChange()        # POST  /api/matches/:id/approve-change
│       └── toggleMatchLock()          # PATCH /api/matches/:id/lock
│
├── 🛣️ routes/
│   ├── 📄 authRoutes.js               # Auth endpoint routing
│   ├── 📄 userRoutes.js               # User/Team endpoint routing
│   ├── 📄 financeRoutes.js            # Finance endpoint routing (Leader/Treasurer)
│   └── 📄 matchRoutes.js              # Match endpoint routing
│
└── 🛡️ middleware/
    ├── 📄 auth.js                     # Authentication & authorization
    │   ├── protect()                  # Verify JWT token
    │   ├── authorize(...roles)        # Check user roles
    │   └── requireTeam()              # Check team membership
    │
    └── 📄 upload.js                   # File upload handling
        └── Multer + Cloudinary storage configuration

```

## 📊 File Statistics

| Category | Count | Purpose |
|----------|-------|---------|
| Models | 5 | Database schemas |
| Controllers | 4 | Business logic |
| Routes | 4 | API endpoints |
| Middleware | 2 | Auth & file upload |
| Config | 2 | Database & cloud storage |
| Documentation | 5 | Guides & references |

## 🔗 Dependency Flow

```
server.js
    ├── config/database.js → MongoDB
    ├── routes/*.js
    │   ├── middleware/auth.js → JWT verification
    │   ├── middleware/upload.js → Cloudinary
    │   └── controllers/*.js
    │       └── models/*.js → Mongoose schemas
    └── Error handlers & 404
```

## 🎯 API Endpoint Summary

```
Auth (3):           /api/auth/*
Team (4):           /api/users/*
Matches (7):        /api/matches/*
Finance (4):        /api/finance/*
────────────────────────────────
Total: 18 endpoints
```

## 🔐 Authentication Flow

```
User Request
    ↓
middleware/auth.js (protect)
    ↓
JWT verification
    ↓
User object added to req.user
    ↓
Role/Team checks (if needed)
    ↓
Controller logic
    ↓
Response
```

## 💾 Database Collections

```
MongoDB (siuno-futbol)
    ├── users          (User accounts)
    ├── teams          (Team settings)
    ├── matches        (Match schedules)
    ├── votes          (User votes)
    └── transactions   (Financial records)
```

## 📦 External Services

```
1. MongoDB Atlas / Local MongoDB
   └── Data persistence

2. Cloudinary
   └── Transaction proof images

3. JWT
   └── Stateless authentication
```

## 🚀 Request/Response Flow Example

```
POST /api/finance/transaction
    ↓
1. CORS middleware
    ↓
2. Body parser
    ↓
3. Route matching → financeRoutes.js
    ↓
4. Multer file upload → middleware/upload.js
    ↓
5. JWT auth → middleware/auth.js (protect)
    ↓
6. Team check → middleware/auth.js (requireTeam)
    ↓
7. Role check → middleware/auth.js (authorize)
    ↓
8. Controller → financeController.js (createTransaction)
    ↓
9. Upload to Cloudinary
    ↓
10. Save to MongoDB (Transaction model)
    ↓
11. Update Team fund balance
    ↓
12. JSON response
```

## 📝 Environment Variables Required

```env
# Server
PORT
NODE_ENV

# Database
MONGODB_URI

# Authentication
JWT_SECRET
JWT_EXPIRE

# Cloud Storage
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

# Settings
DEFAULT_MONTHLY_FEE
```

## 🎨 Code Style & Patterns

- **Pattern:** MVC (Model-View-Controller)
- **Async:** async/await throughout
- **Error Handling:** try-catch in controllers
- **Validation:** Mongoose schema validation
- **Security:** bcrypt, JWT, role-based access
- **Response Format:** Consistent JSON structure

---

**Total Lines of Code:** ~2,000+
**Total Files:** 21
**Languages:** JavaScript, JSON, Markdown
