# Database Schema Specification - Siuno Futbol

## Database: MongoDB

**Database Name:** Được định nghĩa trong `MONGODB_URI` environment variable

---

## Collections Overview

| Collection | Description | Key Features |
|------------|-------------|--------------|
| `users` | Thông tin cá nhân người dùng | Unique email, password hashing |
| `teammembers` | Quan hệ User-Team với role & debt | Multi-team support, per-team debt |
| `teams` | Thông tin đội bóng | Unique invite code, fund management |
| `matches` | Trận đấu của teams | Voting deadline, status tracking |
| `votes` | Bình chọn tham gia trận đấu | Unique per user-match, status enum |
| `transactions` | Giao dịch tài chính | Multiple types, Cloudinary integration |

**Total: 6 Collections**

---

## 1. Collection: `users`

**Mô tả:** Lưu thông tin cá nhân của người dùng (không bao gồm team/debt info)

### Schema Definition

```javascript
{
  _id: ObjectId,
  name: String,                    // Required, trimmed
  email: String,                   // Required, unique, lowercase, trimmed
  password: String,                // Required, min 6 chars, hashed (bcrypt), select: false
  dob: Date,                       // Required - Date of birth
  position: String,                // Required - Enum
  phone: String,                   // Required, trimmed
  createdAt: Date,                 // Auto-generated
  updatedAt: Date                  // Auto-generated
}
```

### Field Details

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | - | MongoDB auto-generated ID |
| `name` | String | Yes | trim | Tên người dùng |
| `email` | String | Yes | unique, lowercase, trim | Email đăng nhập (unique) |
| `password` | String | Yes | minlength: 6, select: false | Mật khẩu đã hash (bcrypt) |
| `dob` | Date | Yes | - | Ngày sinh |
| `position` | String | Yes | enum | Vị trí chơi |
| `phone` | String | Yes | trim | Số điện thoại |
| `createdAt` | Date | Auto | - | Timestamp tạo |
| `updatedAt` | Date | Auto | - | Timestamp cập nhật |

### Enums

**position:**
- `Striker` - Tiền đạo
- `Midfielder` - Tiền vệ
- `Defender` - Hậu vệ
- `Goalkeeper` - Thủ môn
- `Winger` - Cánh

### Indexes

```javascript
{ email: 1 }  // Unique index
```

### Hooks/Middleware

**Pre-save Hook:**
```javascript
// Hash password trước khi save nếu password bị modify
if (this.isModified('password')) {
  this.password = await bcrypt.hash(this.password, 10);
}
```

**Methods:**
```javascript
comparePassword(candidatePassword) // So sánh password với hash
```

### Business Rules

1. Email phải unique trong toàn bộ system
2. Password tự động hash trước khi lưu (bcrypt salt rounds: 10)
3. Password field không được select by default (security)
4. User có thể tồn tại mà không thuộc team nào

---

## 2. Collection: `teammembers`

**Mô tả:** Lưu mối quan hệ giữa User và Team, bao gồm role và debt per-team

### Schema Definition

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                // Ref: User, Required
  teamId: ObjectId,                // Ref: Team, Required
  role: String,                    // Enum: Leader/Treasurer/Member, Default: Member
  debt: Number,                    // Default: 0, Min: 0
  isActive: Boolean,               // Default: true
  joinedAt: Date,                  // Default: Date.now
  leftAt: Date,                    // Nullable, set when leave team
  createdAt: Date,                 // Auto-generated
  updatedAt: Date                  // Auto-generated
}
```

### Field Details

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | - | MongoDB auto-generated ID |
| `userId` | ObjectId | Yes | ref: 'User' | Reference đến User |
| `teamId` | ObjectId | Yes | ref: 'Team' | Reference đến Team |
| `role` | String | Yes | enum, default: 'Member' | Vai trò trong team |
| `debt` | Number | Yes | default: 0, min: 0 | Số nợ hiện tại (VNĐ) |
| `isActive` | Boolean | Yes | default: true | Còn active trong team không |
| `joinedAt` | Date | Yes | default: Date.now | Ngày tham gia team |
| `leftAt` | Date | No | nullable | Ngày rời team (null nếu đang active) |
| `createdAt` | Date | Auto | - | Timestamp tạo |
| `updatedAt` | Date | Auto | - | Timestamp cập nhật |

### Enums

**role:**
- `Leader` - Trưởng nhóm (quyền cao nhất)
- `Treasurer` - Thủ quỹ (quản lý tài chính)
- `Member` - Thành viên (quyền cơ bản)

### Indexes

```javascript
// Unique: 1 user chỉ có 1 active membership per team
{ 
  userId: 1, 
  teamId: 1, 
  isActive: 1 
}, { 
  unique: true,
  partialFilterExpression: { isActive: true }
}

// Quick lookup team members
{ teamId: 1, isActive: 1 }

// Quick lookup user's teams
{ userId: 1, isActive: 1 }
```

### Business Rules

1. **Multi-team Support:** User có thể có nhiều active memberships (nhiều team)
2. **Unique per Team:** 1 user chỉ có 1 active membership trong 1 team cụ thể
3. **Debt per Team:** Mỗi team có số nợ riêng cho user
4. **Role per Team:** User có thể là Leader ở team A, Member ở team B
5. **Soft Delete:** Khi leave team, set `isActive = false` và `leftAt = Date.now` (không xóa)
6. **Cannot Leave with Debt:** User không thể leave nếu `debt > 0`

---

## 3. Collection: `teams`

**Mô tả:** Thông tin về đội bóng

### Schema Definition

```javascript
{
  _id: ObjectId,
  name: String,                    // Required, trimmed
  inviteCode: String,              // Required, unique, auto-generated
  monthlyFeeAmount: Number,        // Required, default: 100000
  currentFundBalance: Number,      // Default: 0
  createdBy: ObjectId,             // Ref: User, Required
  createdAt: Date,                 // Auto-generated
  updatedAt: Date                  // Auto-generated
}
```

### Field Details

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | - | MongoDB auto-generated ID |
| `name` | String | Yes | trim | Tên đội |
| `inviteCode` | String | Yes | unique, uppercase | Mã mời (8 chars hex) |
| `monthlyFeeAmount` | Number | Yes | default: 100000 | Phí tháng (VNĐ) |
| `currentFundBalance` | Number | Yes | default: 0 | Quỹ hiện tại (VNĐ) |
| `createdBy` | ObjectId | Yes | ref: 'User' | User tạo team (Leader đầu tiên) |
| `createdAt` | Date | Auto | - | Timestamp tạo |
| `updatedAt` | Date | Auto | - | Timestamp cập nhật |

### Indexes

```javascript
{ inviteCode: 1 }  // Unique index
```

### Methods

```javascript
generateInviteCode() {
  // Generate 8-char hex code uppercase
  this.inviteCode = crypto.randomBytes(8).toString('hex').toUpperCase();
  return this.inviteCode;
}
```

### Business Rules

1. **Invite Code:** Tự động generate khi tạo team (8 ký tự hex uppercase)
2. **Leader tạo team:** User tạo team tự động trở thành Leader (via TeamMember)
3. **Fund Balance:** Được cập nhật qua transactions (FundCollection/Expense/etc.)
4. **Renew Invite:** Chỉ Leader có quyền renew invite code
5. **Default Monthly Fee:** 100,000 VNĐ (có thể config qua env)

---

## 4. Collection: `matches`

**Mô tả:** Trận đấu của team

### Schema Definition

```javascript
{
  _id: ObjectId,
  teamId: ObjectId,                // Ref: Team, Required
  opponentName: String,            // Required, trimmed
  time: Date,                      // Required
  location: String,                // Required, trimmed
  contactPerson: String,           // Optional, trimmed
  votingDeadline: Date,            // Required
  matchCost: Number,               // Optional
  totalParticipants: Number,       // Optional
  guestCount: Number,              // Optional
  status: String,                  // Enum, Default: Upcoming
  isLocked: Boolean,               // Default: false
  createdBy: ObjectId,             // Ref: User, Required
  createdAt: Date,                 // Auto-generated
  updatedAt: Date                  // Auto-generated
}
```

### Field Details

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | - | MongoDB auto-generated ID |
| `teamId` | ObjectId | Yes | ref: 'Team' | Team sở hữu trận đấu |
| `opponentName` | String | Yes | trim | Tên đối thủ |
| `time` | Date | Yes | - | Thời gian trận đấu |
| `location` | String | Yes | trim | Địa điểm thi đấu |
| `contactPerson` | String | No | trim | Người liên hệ |
| `votingDeadline` | Date | Yes | < time | Deadline bình chọn |
| `matchCost` | Number | No | - | Chi phí trận (VNĐ) |
| `totalParticipants` | Number | No | - | Tổng số người tham gia |
| `guestCount` | Number | No | - | Số khách (không phải member) |
| `status` | String | Yes | enum, default: 'Upcoming' | Trạng thái trận đấu |
| `isLocked` | Boolean | Yes | default: false | Khóa voting (Leader only) |
| `createdBy` | ObjectId | Yes | ref: 'User' | User tạo trận |
| `createdAt` | Date | Auto | - | Timestamp tạo |
| `updatedAt` | Date | Auto | - | Timestamp cập nhật |

### Enums

**status:**
- `Upcoming` - Sắp diễn ra (default)
- `Completed` - Đã kết thúc
- `Cancelled` - Đã hủy

### Indexes

```javascript
{ teamId: 1, time: -1 }  // Query matches by team, sorted by time
{ teamId: 1, status: 1 } // Filter by team and status
```

### Business Rules

1. **Voting Deadline:** Phải trước thời gian trận đấu (`votingDeadline < time`)
2. **Voting Rules:**
   - Chỉ vote được trước deadline
   - Leader có thể lock/unlock voting bất kỳ lúc nào
   - Sau deadline: cần request change và Leader approve
3. **Match Cost Calculation:** Được update khi tạo MatchExpense transaction
4. **Only Team Members:** Chỉ members của team mới vote được

---

## 5. Collection: `votes`

**Mô tả:** Bình chọn tham gia trận đấu của members

### Schema Definition

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                // Ref: User, Required
  matchId: ObjectId,               // Ref: Match, Required
  status: String,                  // Enum: Participate/Absent/Late, Required
  note: String,                    // Optional
  changeReason: String,            // Optional (for change after deadline)
  changeRequestedAt: Date,         // Optional (timestamp of change request)
  isApprovedChange: Boolean,       // Default: false
  createdAt: Date,                 // Auto-generated
  updatedAt: Date                  // Auto-generated
}
```

### Field Details

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | - | MongoDB auto-generated ID |
| `userId` | ObjectId | Yes | ref: 'User' | User bình chọn |
| `matchId` | ObjectId | Yes | ref: 'Match' | Trận đấu được vote |
| `status` | String | Yes | enum | Trạng thái tham gia |
| `note` | String | No | - | Ghi chú thêm |
| `changeReason` | String | No | - | Lý do thay đổi (sau deadline) |
| `changeRequestedAt` | Date | No | - | Thời gian request change |
| `isApprovedChange` | Boolean | Yes | default: false | Leader đã approve chưa |
| `createdAt` | Date | Auto | - | Timestamp tạo |
| `updatedAt` | Date | Auto | - | Timestamp cập nhật |

### Enums

**status:**
- `Participate` - Tham gia
- `Absent` - Vắng mặt
- `Late` - Đến muộn

### Indexes

```javascript
// Unique: 1 user chỉ vote 1 lần/trận
{ userId: 1, matchId: 1 }, { unique: true }

// Query votes by match
{ matchId: 1 }

// Query votes by user
{ userId: 1 }
```

### Business Rules

1. **One Vote per User-Match:** Mỗi user chỉ vote 1 lần cho 1 trận (có thể update)
2. **Before Deadline:** Vote tự do trước `votingDeadline`
3. **After Deadline:** Cần request change với `changeReason`, chờ Leader approve
4. **Locked Match:** Không thể vote nếu match bị lock
5. **Update Vote:** User có thể update status bất kỳ lúc nào (trong rules)

---

## 6. Collection: `transactions`

**Mô tả:** Giao dịch tài chính của team

### Schema Definition

```javascript
{
  _id: ObjectId,
  teamId: ObjectId,                // Ref: Team, Required
  amount: Number,                  // Required
  type: String,                    // Enum, Required
  description: String,             // Required
  proofImage: String,              // Optional (Cloudinary URL)
  relatedMatchId: ObjectId,        // Ref: Match, Optional
  relatedUserId: ObjectId,         // Ref: User, Optional
  createdBy: ObjectId,             // Ref: User, Required
  createdAt: Date,                 // Auto-generated
  updatedAt: Date                  // Auto-generated
}
```

### Field Details

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | - | MongoDB auto-generated ID |
| `teamId` | ObjectId | Yes | ref: 'Team' | Team liên quan |
| `amount` | Number | Yes | - | Số tiền (VNĐ) |
| `type` | String | Yes | enum | Loại giao dịch |
| `description` | String | Yes | - | Mô tả giao dịch |
| `proofImage` | String | No | - | URL ảnh chứng từ (Cloudinary) |
| `relatedMatchId` | ObjectId | No | ref: 'Match' | Match liên quan (cho MatchExpense) |
| `relatedUserId` | ObjectId | No | ref: 'User' | User liên quan (cho FundCollection/MonthlyFee) |
| `createdBy` | ObjectId | Yes | ref: 'User' | User tạo transaction |
| `createdAt` | Date | Auto | - | Timestamp tạo |
| `updatedAt` | Date | Auto | - | Timestamp cập nhật |

### Enums

**type:**
- `FundCollection` - Thu tiền vào quỹ → **Tăng** fund balance
- `Expense` - Chi phí → **Giảm** fund balance
- `GuestPayment` - Khách trả tiền → **Tăng** fund balance
- `MonthlyFee` - Phí tháng → **Tăng** debt của user (không ảnh hưởng fund)
- `MatchExpense` - Chi phí trận đấu → **Logic đặc biệt**

### Indexes

```javascript
{ teamId: 1, createdAt: -1 } // Query transactions by team, sorted by date
{ teamId: 1, type: 1 }       // Filter by team and type
{ relatedUserId: 1 }         // Query transactions by user
```

### Business Logic

**FundCollection:**
```
Fund Balance = Fund Balance + amount
```

**Expense:**
```
Fund Balance = Fund Balance - amount
```

**GuestPayment:**
```
Fund Balance = Fund Balance + amount
```

**MonthlyFee:**
```
User.debt = User.debt + team.monthlyFeeAmount
(Fund balance không thay đổi)
```

**MatchExpense:**
```
costPerPerson = totalCost / totalParticipants
guestPayments = costPerPerson × guestCount
Fund Balance = Fund Balance - totalCost + guestPayments
```

### Business Rules

1. **File Upload:** `proofImage` được upload qua Cloudinary (multer middleware)
2. **Treasurer/Leader Only:** Chỉ Treasurer và Leader mới tạo được transactions
3. **Auto-update Fund:** Fund balance tự động cập nhật khi tạo transaction
4. **Audit Trail:** Lưu `createdBy` để biết ai tạo transaction
5. **Related References:** Link đến Match hoặc User khi cần

---

## Relationships Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       │ 1:N
       ▼
┌──────────────────┐       N:1      ┌─────────────┐
│   TeamMember     │◄────────────────┤    Team     │
│ (Join Table)     │                 └──────┬──────┘
└──────┬───────────┘                        │
       │                                    │ 1:N
       │                                    ▼
       │ User can have                ┌─────────────┐
       │ multiple teams               │   Match     │
       │ (multi-team)                 └──────┬──────┘
       │                                     │
       │                                     │ 1:N
       │                                     ▼
       │ 1:N                           ┌─────────────┐
       └──────────────────────────────►│    Vote     │
                                       └─────────────┘
       
┌─────────────┐       N:1      ┌─────────────┐
│ Transaction │◄────────────────┤    Team     │
└──────┬──────┘                 └─────────────┘
       │
       │ N:1 (optional)
       ├──────────► Match
       │
       │ N:1 (optional)
       └──────────► User
```

---

## Collection Size Estimates

| Collection | Estimated Docs | Growth Rate | Notes |
|------------|----------------|-------------|-------|
| `users` | 100-500 | Slow | 1 doc per user |
| `teammembers` | 200-2000 | Medium | Avg 2-4 teams per user |
| `teams` | 10-50 | Slow | 1 doc per team |
| `matches` | 500-5000 | Fast | ~2-4 matches/month/team |
| `votes` | 5000-50000 | Fast | ~10-20 votes per match |
| `transactions` | 1000-10000 | Medium | ~5-10 transactions/month/team |

---

## Data Integrity Rules

### Referential Integrity

1. **Cascade Considerations:**
   - Deleting User → Nên deactivate TeamMembers (soft delete)
   - Deleting Team → Nên deactivate TeamMembers và archive Matches
   - Deleting Match → Có thể cascade delete Votes

2. **Orphan Prevention:**
   - Vote không thể tồn tại mà không có Match
   - TeamMember không thể tồn tại mà không có User hoặc Team
   - Transaction phải có Team

### Validation Rules

1. **Cross-collection:**
   - Vote.userId phải là member của Match.teamId (via TeamMember)
   - Transaction.createdBy phải có role Treasurer/Leader trong teamId

2. **Field Validation:**
   - `votingDeadline < match.time`
   - `debt >= 0`
   - `currentFundBalance` có thể âm (overspending)
   - Email format validation
   - Phone format validation (optional)

---

## Indexes Summary

### Critical Indexes (Performance)

```javascript
// Users
users: { email: 1 } [unique]

// TeamMembers
teammembers: { userId: 1, teamId: 1, isActive: 1 } [unique, partial]
teammembers: { teamId: 1, isActive: 1 }
teammembers: { userId: 1, isActive: 1 }

// Teams
teams: { inviteCode: 1 } [unique]

// Matches
matches: { teamId: 1, time: -1 }
matches: { teamId: 1, status: 1 }

// Votes
votes: { userId: 1, matchId: 1 } [unique]
votes: { matchId: 1 }

// Transactions
transactions: { teamId: 1, createdAt: -1 }
transactions: { teamId: 1, type: 1 }
```

### Optional Indexes (Future Optimization)

```javascript
// For text search
users: { name: "text" }
teams: { name: "text" }

// For reporting
transactions: { createdBy: 1, createdAt: -1 }
matches: { createdBy: 1 }
```

---

## Migration Notes

### From Old Schema (Single Team per User)

**Breaking Changes:**
1. User model: Removed `debt`, `role`, `teamId`, `isActive`
2. All data migrated to TeamMember collection

**Migration Steps:**
```javascript
// Pseudo-code
for each user with teamId:
  create TeamMember {
    userId: user._id,
    teamId: user.teamId,
    role: user.role,
    debt: user.debt,
    isActive: user.isActive,
    joinedAt: user.createdAt
  }
  
  // Don't delete old fields immediately (keep for rollback)
```

### Backward Compatibility

**Not compatible** - Requires full migration. API responses changed significantly:
- Login/Profile now return `teams: []` instead of single `teamId`
- All endpoints require `teamId` parameter

---

## Best Practices

### Data Access

1. **Always populate TeamMember** when querying teams for a user
2. **Use projections** to limit returned fields (esp. for passwords)
3. **Paginate** large collections (matches, transactions, votes)
4. **Index queries** - Ensure queries use defined indexes

### Security

1. **Never select password** in queries (use `select: false`)
2. **Validate teamId** ownership before operations
3. **Check role permissions** via TeamMember before mutations
4. **Sanitize user input** to prevent injection

### Performance

1. **Batch operations** when possible (e.g., monthly fee trigger)
2. **Use aggregation** for statistics/reports
3. **Cache** frequently accessed data (team info, user profile)
4. **Archive old data** (completed matches > 1 year)

---

## Future Enhancements

### Potential Schema Additions

1. **Notifications Collection:**
   - Match reminders
   - Payment reminders
   - Vote change requests

2. **TeamSettings Collection:**
   - Custom rules per team
   - Configurable monthly fee schedule
   - Voting policies

3. **Achievements/Stats:**
   - User statistics (goals, assists)
   - Team records
   - Match results

4. **Chat/Comments:**
   - Match discussions
   - Team announcements
   - Vote change discussions

---

## Backup & Recovery

### Backup Strategy

1. **Full Backup:** Daily at 2 AM (automated)
2. **Incremental:** Every 6 hours (oplog)
3. **Retention:** 30 days for daily, 7 days for incremental

### Critical Collections Priority

1. **High Priority:** users, teams, teammembers
2. **Medium Priority:** transactions, matches
3. **Low Priority:** votes (can be recreated)

### Recovery Plan

1. Restore users & teams first
2. Restore teammembers (establish relationships)
3. Restore transactions (financial data)
4. Restore matches & votes last

---

**Last Updated:** December 11, 2025  
**Version:** 2.0 (Multi-team support)  
**MongoDB Version:** 6.0+
