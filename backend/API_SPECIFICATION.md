# API Specification - Siuno Futbol Backend (Multi-Team Support)

## Base URL
```
http://localhost:5000/api
```

## Authentication
Tất cả các endpoint có đánh dấu 🔒 yêu cầu JWT token trong header:
```
Authorization: Bearer <token>
```

## ⭐ Multi-Team Support
**User có thể đồng thời tham gia nhiều team với các role khác nhau.**
- Mỗi request cần chỉ định `teamId` để xác định team nào đang thao tác
- User có thể là Leader ở team A, Member ở team B
- Mỗi team có debt riêng biệt cho user
- Login/Profile trả về **array of teams**

---

## 1. Authentication API (`/auth`)

### 1.1 Register User
**POST** `/auth/register`

Đăng ký tài khoản mới (chưa thuộc team nào).

**Request Body:**
```json
{
  "name": "Nguyen Van A",
  "email": "nguyenvana@example.com",
  "password": "password123",
  "dob": "1995-05-15",
  "position": "Midfielder",
  "phone": "0901234567"
}
```

**Validation:**
- `position`: Phải là một trong: `Striker`, `Midfielder`, `Defender`, `Goalkeeper`, `Winger`
- `password`: Tối thiểu 6 ký tự
- `email`: Unique, format email hợp lệ

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6751234567890abcdef12345",
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "position": "Midfielder"
  }
}
```

---

### 1.2 Login
**POST** `/auth/login`

Đăng nhập và nhận JWT token. Trả về thông tin team membership nếu user đang active trong team.

**Request Body:**
```json
{
  "email": "nguyenvana@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6751234567890abcdef12345",
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "position": "Midfielder",
    "teams": [
      {
        "teamId": "6751234567890abcdef67890",
        "teamName": "FC Warriors",
        "role": "Leader",
        "debt": 0,
        "joinedAt": "2025-01-01T00:00:00.000Z"
      },
      {
        "teamId": "6751234567890abcdef67891",
        "teamName": "Team Alpha",
        "role": "Member",
        "debt": 150000,
        "joinedAt": "2025-02-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Note:** `teams` là array chứa tất cả teams mà user đang active.

---

### 1.3 Get Profile 🔒
**GET** `/auth/profile`

Lấy thông tin profile của user hiện tại, bao gồm team membership active.

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "6751234567890abcdef12345",
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "dob": "1995-05-15T00:00:00.000Z",
    "position": "Midfielder",
    "phone": "0901234567",
    "teams": [
      {
        "teamId": "6751234567890abcdef67890",
        "teamName": "FC Warriors",
        "inviteCode": "A1B2C3D4E5F6",
        "monthlyFeeAmount": 100000,
        "currentFundBalance": 500000,
        "role": "Leader",
        "debt": 0,
        "isActive": true,
        "joinedAt": "2025-01-01T00:00:00.000Z"
      },
      {
        "teamId": "6751234567890abcdef67891",
        "teamName": "Team Alpha",
        "inviteCode": "X9Y8Z7W6V5U4",
        "monthlyFeeAmount": 120000,
        "currentFundBalance": 300000,
        "role": "Member",
        "debt": 150000,
        "isActive": true,
        "joinedAt": "2025-02-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

## 2. User/Team Management API (`/users`)

### 2.1 Create Team 🔒
**POST** `/users/create-team`

Tạo team mới. User tạo sẽ tự động trở thành Leader.

**Request Body:**
```json
{
  "teamName": "FC Warriors",
  "monthlyFeeAmount": 100000
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Team created successfully",
  "team": {
    "id": "6751234567890abcdef67890",
    "name": "FC Warriors",
    "inviteCode": "A1B2C3D4E5F6",
    "monthlyFeeAmount": 100000
  }
}
```

---

### 2.2 Join Team 🔒
**POST** `/users/join`

Tham gia team thông qua invite code.

**Request Body:**
```json
{
  "inviteCode": "A1B2C3D4E5F6"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully joined the team",
  "team": {
    "id": "6751234567890abcdef67890",
    "name": "FC Warriors"
  }
}
```

**Errors:**
- `400`: User đã là thành viên của team này rồi
- `404`: Invite code không hợp lệ

---

### 2.3 Leave Team 🔒
**POST** `/users/leave`

Rời khỏi team. Không được phép rời nếu còn nợ.

**Request Body:**
```json
{
  "teamId": "6751234567890abcdef67890"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully left the team"
}
```

**Errors:**
- `400`: Team ID is required
- `400`: User có nợ chưa thanh toán
- `400`: User không thuộc team này

---

### 2.4 Renew Invite Link 🔒🔑
**POST** `/users/invite-link/renew`

Tạo lại invite code mới (chỉ Leader).

**Request Body:**
```json
{
  "teamId": "6751234567890abcdef67890"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Invite link renewed successfully",
  "inviteCode": "X9Y8Z7W6V5U4"
}
```

**Required Role:** Leader

---

## 3. Finance API (`/finance`)

### 3.1 Get Finance Stats 🔒🔑
**GET** `/finance/stats`

Lấy thống kê tài chính của team (Treasurer/Leader only).

**Query Parameters:**
- `teamId` (required): ID của team cần xem thống kê

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "currentFundBalance": 500000,
    "monthlyFeeAmount": 100000,
    "totalOutstandingDebt": 350000,
    "usersWithDebt": [
      {
        "userId": "6751234567890abcdef12345",
        "name": "Nguyen Van A",
        "email": "nguyenvana@example.com",
        "debt": 150000
      },
      {
        "userId": "6751234567890abcdef12346",
        "name": "Tran Van B",
        "email": "tranvanb@example.com",
        "debt": 200000
      }
    ],
    "recentTransactions": [
      {
        "_id": "6751234567890abcdef99999",
        "amount": 100000,
        "type": "MonthlyFee",
        "description": "Monthly fee for December 2025",
        "createdBy": {
          "_id": "6751234567890abcdef12345",
          "name": "Nguyen Van A"
        },
        "relatedUserId": {
          "_id": "6751234567890abcdef12346",
          "name": "Tran Van B"
        },
        "createdAt": "2025-12-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Required Role:** Treasurer, Leader

---

### 3.2 Trigger Monthly Fee 🔒🔑
**POST** `/finance/monthly-fee`

Thu phí tháng từ tất cả thành viên active. Tăng debt của mỗi member.

**Request Body:**
```json
{
  "teamId": "6751234567890abcdef67890"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Monthly fee of 100000 added to 15 members",
  "affectedMembers": 15
}
```

**Required Role:** Treasurer, Leader

---

### 3.3 Create Transaction 🔒🔑
**POST** `/finance/transaction`

Tạo giao dịch tài chính (có thể kèm file upload).

**Request Body (multipart/form-data):**
```json
{
  "teamId": "6751234567890abcdef67890",
  "amount": 500000,
  "type": "FundCollection",
  "description": "Guest payment for match on 2025-12-10",
  "file": "<binary_image_file>"
}
```

**Transaction Types:**
- `FundCollection`: Thu tiền vào quỹ (tăng fund balance)
- `Expense`: Chi phí chung (giảm fund balance)
- `GuestPayment`: Khách đóng tiền (tăng fund balance)
- `MatchExpense`: Chi phí trận đấu (logic đặc biệt)
- `MonthlyFee`: Phí tháng (tự động tạo khi trigger)

**For MatchExpense (requires additional fields):**
```json
{
  "teamId": "6751234567890abcdef67890",
  "amount": 1000000,
  "type": "MatchExpense",
  "description": "Match vs Team ABC",
  "relatedMatchId": "6751234567890abcdef88888",
  "totalCost": 1000000,
  "totalParticipants": 20,
  "guestCount": 5,
  "file": "<binary_image_file>"
}
```

**Logic MatchExpense:**
```
Fund Balance = Fund Balance - Match Cost + (Match Cost / Total Participants * Guest Count)
```

**Response (201):**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "transaction": {
    "_id": "6751234567890abcdef99999",
    "teamId": "6751234567890abcdef67890",
    "amount": 500000,
    "type": "FundCollection",
    "description": "Guest payment",
    "proofImage": "https://res.cloudinary.com/...",
    "createdBy": {
      "_id": "6751234567890abcdef12345",
      "name": "Nguyen Van A"
    },
    "createdAt": "2025-12-11T10:30:00.000Z"
  },
  "newFundBalance": 1000000
}
```

**Required Role:** Treasurer, Leader

---

### 3.4 Clear Debt 🔒🔑
**POST** `/finance/clear-debt`

Xóa nợ cho một thành viên (có thể kèm file upload).

**Request Body (multipart/form-data):**
```json
{
  "teamId": "6751234567890abcdef67890",
  "userId": "6751234567890abcdef12346",
  "amount": 100000,
  "file": "<binary_image_file>"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Debt cleared successfully",
  "user": {
    "id": "6751234567890abcdef12346",
    "name": "Tran Van B",
    "remainingDebt": 50000
  },
  "newFundBalance": 1100000
}
```

**Errors:**
- `400`: Số tiền thanh toán lớn hơn nợ hiện tại
- `404`: User không tìm thấy trong team

**Required Role:** Treasurer, Leader

---

## 4. Match API (`/matches`)

### 4.1 Get All Matches 🔒
**GET** `/matches`

Lấy tất cả trận đấu của team (sorted by time desc).

**Query Parameters:**
- `teamId` (required): ID của team
- `limit` (optional): Số lượng trận (default: 50)
- `status` (optional): Filter theo status: `Upcoming`, `Completed`, `Cancelled`

**Response (200):**
```json
{
  "success": true,
  "matches": [
    {
      "_id": "6751234567890abcdef88888",
      "opponentName": "Team ABC",
      "time": "2025-12-15T18:00:00.000Z",
      "location": "San Phu Dong",
      "votingDeadline": "2025-12-14T18:00:00.000Z",
      "matchCost": 1000000,
      "totalParticipants": 20,
      "guestCount": 5,
      "status": "Upcoming",
      "createdBy": {
        "_id": "6751234567890abcdef12345",
        "name": "Nguyen Van A"
      },
      "participantCount": 15,
      "absentCount": 3,
      "lateCount": 2
    }
  ]
}
```

---

### 4.2 Create Match 🔒🔑
**POST** `/matches`

Tạo trận đấu mới (Leader/Treasurer only).

**Request Body:**
```json
{
  "teamId": "6751234567890abcdef67890",
  "opponentName": "Team ABC",
  "time": "2025-12-15T18:00:00.000Z",
  "location": "San Phu Dong",
  "votingDeadline": "2025-12-14T18:00:00.000Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Match created successfully",
  "match": {
    "_id": "6751234567890abcdef88888",
    "opponentName": "Team ABC",
    "time": "2025-12-15T18:00:00.000Z",
    "location": "San Phu Dong",
    "votingDeadline": "2025-12-14T18:00:00.000Z",
    "status": "Upcoming",
    "createdBy": "6751234567890abcdef12345"
  }
}
```

**Required Role:** Treasurer, Leader

---

### 4.3 Vote for Match 🔒
**POST** `/matches/:matchId/vote`

Bình chọn tham gia/vắng mặt cho trận đấu.

**Request Body:**
```json
{
  "status": "Participate"
}
```

**Vote Status Options:**
- `Participate`: Tham gia
- `Absent`: Vắng mặt
- `Late`: Đến muộn

**Response (200):**
```json
{
  "success": true,
  "message": "Vote recorded successfully",
  "vote": {
    "_id": "6751234567890abcdef77777",
    "userId": "6751234567890abcdef12345",
    "matchId": "6751234567890abcdef88888",
    "status": "Participate"
  }
}
```

**Errors:**
- `400`: Đã quá deadline voting
- `400`: User đã vote rồi (có thể update lại)

---

### 4.4 Get Match Details 🔒
**GET** `/matches/:matchId`

Lấy chi tiết trận đấu bao gồm danh sách votes.

**Response (200):**
```json
{
  "success": true,
  "match": {
    "_id": "6751234567890abcdef88888",
    "opponentName": "Team ABC",
    "time": "2025-12-15T18:00:00.000Z",
    "location": "San Phu Dong",
    "votingDeadline": "2025-12-14T18:00:00.000Z",
    "matchCost": 1000000,
    "totalParticipants": 20,
    "guestCount": 5,
    "status": "Upcoming",
    "votes": [
      {
        "_id": "6751234567890abcdef77777",
        "userId": {
          "_id": "6751234567890abcdef12345",
          "name": "Nguyen Van A",
          "position": "Midfielder"
        },
        "status": "Participate",
        "createdAt": "2025-12-10T10:00:00.000Z"
      }
    ],
    "participantCount": 15,
    "absentCount": 3,
    "lateCount": 2
  }
}
```

---

### 4.5 Update Match 🔒🔑
**PUT** `/matches/:matchId`

Cập nhật thông tin trận đấu (Leader/Treasurer only).

**Request Body:**
```json
{
  "opponentName": "Team XYZ Updated",
  "time": "2025-12-15T19:00:00.000Z",
  "location": "San Phu Dong Updated",
  "status": "Completed"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Match updated successfully",
  "match": {
    "_id": "6751234567890abcdef88888",
    "opponentName": "Team XYZ Updated",
    "time": "2025-12-15T19:00:00.000Z",
    "location": "San Phu Dong Updated",
    "status": "Completed"
  }
}
```

**Required Role:** Treasurer, Leader

---

### 4.6 Delete Match 🔒🔑
**DELETE** `/matches/:matchId`

Xóa trận đấu (Leader/Treasurer only).

**Response (200):**
```json
{
  "success": true,
  "message": "Match deleted successfully"
}
```

**Required Role:** Treasurer, Leader

---

## 5. Data Models

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  dob: Date,
  position: String (enum),
  phone: String,
  timestamps: true
}
```

### TeamMember (NEW)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  teamId: ObjectId (ref: Team),
  role: String (enum: Leader/Treasurer/Member),
  debt: Number (default: 0),
  isActive: Boolean (default: true),
  joinedAt: Date,
  leftAt: Date (nullable),
  timestamps: true
}
```

### Team
```javascript
{
  _id: ObjectId,
  name: String,
  inviteCode: String (unique),
  monthlyFeeAmount: Number,
  currentFundBalance: Number,
  createdBy: ObjectId (ref: User),
  timestamps: true
}
```

### Match
```javascript
{
  _id: ObjectId,
  teamId: ObjectId (ref: Team),
  opponentName: String,
  time: Date,
  location: String,
  votingDeadline: Date,
  matchCost: Number (optional),
  totalParticipants: Number (optional),
  guestCount: Number (optional),
  status: String (enum: Upcoming/Completed/Cancelled),
  createdBy: ObjectId (ref: User),
  timestamps: true
}
```

### Vote
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  matchId: ObjectId (ref: Match),
  status: String (enum: Participate/Absent/Late),
  timestamps: true,
  unique: [userId, matchId] // Mỗi user chỉ vote 1 lần/trận
}
```

### Transaction
```javascript
{
  _id: ObjectId,
  teamId: ObjectId (ref: Team),
  amount: Number,
  type: String (enum: FundCollection/Expense/GuestPayment/MatchExpense/MonthlyFee),
  description: String,
  proofImage: String (Cloudinary URL, optional),
  relatedMatchId: ObjectId (ref: Match, optional),
  relatedUserId: ObjectId (ref: User, optional),
  createdBy: ObjectId (ref: User),
  timestamps: true
}
```

---

## Error Response Format

Tất cả errors đều trả về format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (in development mode only)"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

---

## Role-Based Access Control

| Endpoint | Member | Treasurer | Leader |
|----------|--------|-----------|--------|
| GET /finance/stats | ❌ | ✅ | ✅ |
| POST /finance/monthly-fee | ❌ | ✅ | ✅ |
| POST /finance/transaction | ❌ | ✅ | ✅ |
| POST /finance/clear-debt | ❌ | ✅ | ✅ |
| POST /matches | ❌ | ✅ | ✅ |
| PUT /matches/:id | ❌ | ✅ | ✅ |
| DELETE /matches/:id | ❌ | ✅ | ✅ |
| POST /matches/:id/vote | ✅ | ✅ | ✅ |
| POST /users/invite-link/renew | ❌ | ❌ | ✅ |

---

## Important Notes

### Multi-Team Support
- **User có thể tham gia nhiều teams đồng thời** với các role khác nhau
- Mỗi request cần chỉ định `teamId` (trong body hoặc query)
- User có thể là **Leader ở team A**, **Member ở team B**
- Login và GetProfile trả về **array of teams** thay vì single team

### TeamMember Logic
- Một user có thể có **nhiều TeamMember records** (lịch sử tham gia nhiều team)
- Có thể có **nhiều TeamMember active** (isActive=true) cùng lúc
- Mỗi team có unique constraint: 1 user chỉ có 1 active membership/team
- **Debt là per-team**, không phải per-user
- Khi user leave team, membership được deactivate (isActive=false) chứ không xóa

### Debt Management
- Debt được lưu trong **TeamMember**, không phải User
- Không được leave team nếu còn debt > 0
- Clear debt sẽ tăng team fund balance

### Match Voting
- Chỉ vote được trước deadline
- Mỗi user chỉ vote 1 lần/trận (có thể update)
- Compound unique index: (userId, matchId)

### File Uploads
- Sử dụng Cloudinary
- Supported endpoints: `/finance/transaction`, `/finance/clear-debt`
- Field name: `file`
- Max size: Cấu hình trong multer middleware
