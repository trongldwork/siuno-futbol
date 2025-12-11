# Soccer Team Management - Backend API

Complete backend API for managing soccer teams, matches, attendance voting, and team finances.

## 🎯 New Features

- ✨ **ESM Modules** - Modern ES6 import/export syntax
- 📚 **Swagger UI** - Interactive API documentation at `/api-docs`
- 🔍 **Auto-generated Docs** - Try out endpoints directly in browser

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Swagger UI](#swagger-ui)
- [Database Schema](#database-schema)
- [Business Logic](#business-logic)

## Features

✅ **User Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Leader, Treasurer, Member)

✅ **Team Management**
- Create/join teams via invite code
- Permanent invite links with renewal capability
- Leave team (with debt validation)

✅ **Match Management**
- Create and schedule matches
- Voting system with strict deadlines
- Vote status: Participate, Absent, Late
- Request vote changes after deadline (requires Leader approval)

✅ **Finance Management**
- Monthly fund fee collection
- Match expense settlement with guest payment calculation
- Transaction tracking with proof images (Cloudinary)
- Debt management and clearing

## Tech Stack

- **Runtime:** Node.js (ESM Modules)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Cloudinary
- **File Upload:** Multer
- **API Docs:** Swagger UI + Swagger JSDoc

## Installation

1. **Clone the repository**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the server**
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## Swagger UI

Access the interactive API documentation at:

```
http://localhost:5000/api-docs
```

The Swagger UI provides:
- 📖 Complete API documentation
- 🧪 Test endpoints directly in the browser
- 📝 Request/response examples
- 🔐 JWT authentication support

### Using Swagger UI

1. Open http://localhost:5000/api-docs
2. Register a new user via `/api/auth/register`
3. Login via `/api/auth/login` to get your JWT token
4. Click "Authorize" button (top right)
5. Enter: `Bearer YOUR_TOKEN_HERE`
6. Try out any endpoint!

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "dob": "1990-01-15",
  "position": "Striker",
  "phone": "+1234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Team Management

#### Create Team
```http
POST /api/users/create-team
Authorization: Bearer <token>
Content-Type: application/json

{
  "teamName": "FC Barcelona",
  "monthlyFeeAmount": 100000
}
```

#### Join Team
```http
POST /api/users/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "inviteCode": "ABC123DEF456"
}
```

#### Leave Team
```http
POST /api/users/leave
Authorization: Bearer <token>
```

#### Renew Invite Link (Leader only)
```http
POST /api/users/invite-link/renew
Authorization: Bearer <token>
```

### Match Management

#### Create Match (Leader/Treasurer only)
```http
POST /api/matches
Authorization: Bearer <token>
Content-Type: application/json

{
  "time": "2024-12-20T15:00:00Z",
  "location": "Stadium A",
  "opponentName": "Team Rival",
  "contactPerson": "Jane Doe",
  "votingDeadline": "2024-12-18T23:59:59Z"
}
```

#### Get All Matches
```http
GET /api/matches?upcoming=true
Authorization: Bearer <token>
```

#### Get Match Details
```http
GET /api/matches/:id
Authorization: Bearer <token>
```

#### Vote for Match
```http
POST /api/matches/:id/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Participate",
  "note": "I'll be there!"
}
```

#### Request Vote Change (After Deadline)
```http
POST /api/matches/:id/request-change
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Absent",
  "note": "Updated status",
  "reason": "Emergency came up"
}
```

#### Approve Vote Change (Leader only)
```http
POST /api/matches/:id/approve-change
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id_here"
}
```

#### Lock/Unlock Match (Leader only)
```http
PATCH /api/matches/:id/lock
Authorization: Bearer <token>
```

### Finance Management

#### Get Finance Stats (Leader/Treasurer only)
```http
GET /api/finance/stats
Authorization: Bearer <token>
```

#### Trigger Monthly Fee (Leader/Treasurer only)
```http
POST /api/finance/monthly-fee
Authorization: Bearer <token>
```

#### Create Transaction (Leader/Treasurer only)
```http
POST /api/finance/transaction
Authorization: Bearer <token>
Content-Type: multipart/form-data

amount: 50000
type: Expense
description: Equipment purchase
proofImage: <file>
```

#### Create Match Expense Transaction
```http
POST /api/finance/transaction
Authorization: Bearer <token>
Content-Type: multipart/form-data

type: MatchExpense
relatedMatchId: match_id_here
totalCost: 200000
totalParticipants: 20
guestCount: 3
description: Match vs Team Rival
proofImage: <file>
```

#### Clear Debt (Leader/Treasurer only)
```http
POST /api/finance/clear-debt
Authorization: Bearer <token>
Content-Type: multipart/form-data

userId: user_id_here
amount: 100000
proofImage: <file>
```

## Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  dob: Date,
  position: String (Striker/Midfielder/Defender/Goalkeeper/Winger),
  phone: String,
  role: String (Leader/Treasurer/Member),
  debt: Number (default: 0),
  isActive: Boolean (default: true),
  teamId: ObjectId (ref: Team)
}
```

### Team
```javascript
{
  name: String,
  inviteCode: String (unique),
  monthlyFeeAmount: Number,
  currentFundBalance: Number,
  createdBy: ObjectId (ref: User)
}
```

### Match
```javascript
{
  teamId: ObjectId (ref: Team),
  time: Date,
  location: String,
  opponentName: String,
  contactPerson: String,
  votingDeadline: Date,
  isLocked: Boolean,
  matchCost: Number,
  totalParticipants: Number,
  guestCount: Number,
  createdBy: ObjectId (ref: User)
}
```

### Vote
```javascript
{
  userId: ObjectId (ref: User),
  matchId: ObjectId (ref: Match),
  status: String (Participate/Absent/Late),
  note: String,
  isApprovedChange: Boolean,
  changeRequestedAt: Date,
  changeReason: String
}
```

### Transaction
```javascript
{
  teamId: ObjectId (ref: Team),
  amount: Number,
  type: String (FundCollection/Expense/GuestPayment/MatchExpense/MonthlyFee),
  description: String,
  proofImage: String (Cloudinary URL),
  relatedMatchId: ObjectId (ref: Match),
  relatedUserId: ObjectId (ref: User),
  createdBy: ObjectId (ref: User)
}
```

## Business Logic

### Fund Calculation
Monthly fund fee is collected from all active members. After a match, the fund is calculated as:

```
Fund Balance = Fund Balance - Match Cost + (Match Cost / Total Participants × Guest Count)
```

**Example:**
- Match Cost: 200,000
- Total Participants: 20 (15 members + 5 guests)
- Guest Count: 5
- Cost per person: 10,000
- Guest Payments: 50,000
- Fund Change: -200,000 + 50,000 = -150,000

### Voting Rules
1. Users can vote until the voting deadline
2. After deadline, votes are locked
3. To change a vote after deadline, user must request approval from Leader
4. Leader can approve/reject change requests
5. Leader can manually lock/unlock matches

### Debt & Leaving
- Users cannot leave the team if they have outstanding debt
- When a user leaves, their account is deactivated (not deleted)
- Historical data (votes, transactions) is preserved

### Role Permissions
- **Leader:** All permissions
- **Treasurer:** Finance management + Match creation
- **Member:** Vote on matches, view information

## Error Handling

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (in development mode)"
}
```

## Development

```bash
# Install nodemon for development
npm install -D nodemon

# Run in development mode
npm run dev
```

## License

MIT
