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

## 🔐 SuperAdmin Role
**SuperAdmin là quản lý hệ thống toàn bộ, có quyền:**
- Xem và quản lý tất cả users
- Xem thông tin tất cả teams
- Xem tất cả transactions và payment requests
- Tạo báo cáo tài chính và hoạt động hệ thống
- Deactivate/reactivate users

---

## 1. Admin API (`/admin`) 🔐 SuperAdmin Only

### 1.1 Create SuperAdmin Account
**POST** `/admin/create-superadmin`

Tạo tài khoản SuperAdmin đầu tiên (first time only). Sau đó nên bảo vệ endpoint này.

**Request Body:**
```json
{
  "name": "System Administrator",
  "email": "admin@siuno.com",
  "password": "SecurePassword123",
  "phone": "0901234567"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "SuperAdmin account created successfully",
  "user": {
    "id": "6751234567890abcdef12345",
    "name": "System Administrator",
    "email": "admin@siuno.com",
    "role": "SuperAdmin"
  }
}
```

**Errors:**
- `400`: SuperAdmin account already exists

---

### 1.2 Get Dashboard Stats 🔒
**GET** `/admin/dashboard`

Lấy thống kê tổng quan của hệ thống.

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalTeams": 12,
    "totalMembers": 450,
    "pendingPayments": 8,
    "totalFund": 5000000,
    "totalDebt": 750000,
    "systemHealth": {
      "timestamp": "2025-12-11T10:30:00.000Z",
      "activeTeams": 12,
      "activeMembers": 450
    }
  }
}
```

**Required Role:** SuperAdmin

---

### 1.3 Get All Users 🔒
**GET** `/admin/users`

Lấy danh sách tất cả users trong hệ thống.

**Query Parameters:**
- `active` (optional): true/false - filter users theo trạng thái
- `limit` (optional): Số lượng per page (default: 50)
- `page` (optional): Trang (default: 1)

**Response (200):**
```json
{
  "success": true,
  "total": 150,
  "page": 1,
  "limit": 50,
  "totalPages": 3,
  "users": [
    {
      "_id": "6751234567890abcdef12345",
      "name": "Nguyen Van A",
      "email": "nguyenvana@example.com",
      "phone": "0901234567",
      "position": "Midfielder",
      "role": "User",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Required Role:** SuperAdmin

---

### 1.4 Toggle User Status 🔒
**PATCH** `/admin/users/:userId/toggle-status`

Activate/deactivate user account.

**Response (200):**
```json
{
  "success": true,
  "message": "User activated successfully",
  "user": {
    "id": "6751234567890abcdef12345",
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "isActive": true
  }
}
```

**Errors:**
- `404`: User not found

**Required Role:** SuperAdmin

---

### 1.5 Get All Teams 🔒
**GET** `/admin/teams`

Lấy danh sách tất cả teams với thông tin thành viên.

**Query Parameters:**
- `limit` (optional): Số lượng per page (default: 50)
- `page` (optional): Trang (default: 1)
- `sortBy` (optional): Sắp xếp theo field (default: createdAt)

**Response (200):**
```json
{
  "success": true,
  "total": 12,
  "page": 1,
  "limit": 50,
  "totalPages": 1,
  "teams": [
    {
      "_id": "6751234567890abcdef67890",
      "name": "FC Warriors",
      "inviteCode": "A1B2C3D4E5F6",
      "monthlyFeeAmount": 100000,
      "currentFundBalance": 500000,
      "memberCount": 15,
      "createdBy": {
        "_id": "6751234567890abcdef12345",
        "name": "Nguyen Van A",
        "email": "nguyenvana@example.com"
      },
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Required Role:** SuperAdmin

---

### 1.6 Get Team Details 🔒
**GET** `/admin/teams/:teamId`

Lấy chi tiết đầy đủ của một team (members, stats).

**Response (200):**
```json
{
  "success": true,
  "team": {
    "_id": "6751234567890abcdef67890",
    "name": "FC Warriors",
    "inviteCode": "A1B2C3D4E5F6",
    "monthlyFeeAmount": 100000,
    "currentFundBalance": 500000,
    "members": [
      {
        "_id": "6751234567890abcdef11111",
        "userId": {
          "_id": "6751234567890abcdef12345",
          "name": "Nguyen Van A",
          "email": "nguyenvana@example.com",
          "position": "Midfielder",
          "phone": "0901234567"
        },
        "role": "Leader",
        "debt": 0,
        "joinedAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "stats": {
      "memberCount": 15,
      "totalDebt": 150000,
      "matchCount": 8,
      "transactionCount": 25,
      "fundBalance": 500000
    }
  }
}
```

**Errors:**
- `404`: Team not found

**Required Role:** SuperAdmin

---

### 1.7 Get All Transactions 🔒
**GET** `/admin/transactions`

Xem tất cả transactions across all teams.

**Query Parameters:**
- `teamId` (optional): Filter by team
- `type` (optional): Filter by type (FundCollection, Expense, GuestPayment, MatchExpense, MonthlyFee)
- `limit` (optional): Số lượng per page (default: 50)
- `page` (optional): Trang (default: 1)

**Response (200):**
```json
{
  "success": true,
  "total": 250,
  "page": 1,
  "limit": 50,
  "totalPages": 5,
  "transactions": [
    {
      "_id": "6751234567890abcdef99999",
      "teamId": {
        "_id": "6751234567890abcdef67890",
        "name": "FC Warriors"
      },
      "amount": 100000,
      "type": "MonthlyFee",
      "description": "Monthly fee for December 2025",
      "createdBy": {
        "_id": "6751234567890abcdef12345",
        "name": "Nguyen Van A"
      },
      "createdAt": "2025-12-01T00:00:00.000Z"
    }
  ]
}
```

**Required Role:** SuperAdmin

---

### 1.8 Get All Payment Requests 🔒
**GET** `/admin/payment-requests`

Xem tất cả payment requests trong hệ thống.

**Query Parameters:**
- `status` (optional): Filter (Pending, Approved, Rejected)
- `teamId` (optional): Filter by team
- `limit` (optional): Số lượng per page (default: 50)
- `page` (optional): Trang (default: 1)

**Response (200):**
```json
{
  "success": true,
  "total": 45,
  "page": 1,
  "limit": 50,
  "totalPages": 1,
  "statusCount": {
    "Pending": 8,
    "Approved": 30,
    "Rejected": 7
  },
  "requests": [
    {
      "_id": "6751234567890abcdef66666",
      "teamId": {
        "_id": "6751234567890abcdef67890",
        "name": "FC Warriors"
      },
      "userId": {
        "_id": "6751234567890abcdef12345",
        "name": "Nguyen Van A",
        "email": "nguyenvana@example.com"
      },
      "amount": 150000,
      "status": "Pending",
      "description": "Payment for December monthly fee",
      "proofImage": "https://res.cloudinary.com/...",
      "createdAt": "2025-12-11T10:30:00.000Z"
    }
  ]
}
```

**Required Role:** SuperAdmin

---

### 1.9 Get Finance Report 🔒
**GET** `/admin/reports/finance`

Tạo báo cáo tài chính toàn hệ thống.

**Response (200):**
```json
{
  "success": true,
  "report": {
    "timestamp": "2025-12-11T10:30:00.000Z",
    "transactionsByType": [
      {
        "_id": "MonthlyFee",
        "count": 120,
        "totalAmount": 3000000
      },
      {
        "_id": "FundCollection",
        "count": 85,
        "totalAmount": 2500000
      }
    ],
    "teamRevenue": [
      {
        "_id": "6751234567890abcdef67890",
        "name": "FC Warriors",
        "currentFundBalance": 500000,
        "monthlyFeeAmount": 100000
      }
    ],
    "highestDebtUsers": [
      {
        "userId": "6751234567890abcdef12345",
        "userName": "Nguyen Van A",
        "userEmail": "nguyenvana@example.com",
        "teamName": "FC Warriors",
        "debt": 200000
      }
    ],
    "totalStats": {
      "totalTeams": 12,
      "totalMembers": 450,
      "totalTransactions": 250,
      "pendingPayments": 8
    }
  }
}
```

**Required Role:** SuperAdmin

---

### 1.10 Get User Activity Report 🔒
**GET** `/admin/reports/users`

Tạo báo cáo hoạt động users và teams (last 30 days).

**Response (200):**
```json
{
  "success": true,
  "report": {
    "timestamp": "2025-12-11T10:30:00.000Z",
    "period": "Last 30 days",
    "newUsers": 15,
    "totalActiveUsers": 420,
    "newTeams": 2,
    "activeTeams": [
      {
        "teamId": "6751234567890abcdef67890",
        "teamName": "FC Warriors",
        "memberCount": 15
      }
    ]
  }
}
```

**Required Role:** SuperAdmin

---

## 2. Authentication API (`/auth`)

### 2.1 Register User
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

### 2.2 Login
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

### 2.3 Get Profile 🔒
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

## 3. User/Team Management API (`/users`)

### 3.1 Create Team 🔒
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

### 3.2 Join Team 🔒
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

### 3.3 Leave Team 🔒
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

### 3.4 Renew Invite Link 🔒🔑
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

### 3.5 Change Member Role 🔒🔑
**PUT** `/users/change-role`

Thay đổi vai trò của thành viên (chỉ Leader).

**Request Body:**
```json
{
  "teamId": "6751234567890abcdef67890",
  "userId": "6751234567890abcdef12346",
  "newRole": "Treasurer"
}
```

**Valid Roles:**
- `Member` - Thành viên
- `Treasurer` - Thủ quỹ
- `Leader` - Trưởng nhóm

**Response (200):**
```json
{
  "success": true,
  "message": "Role changed successfully",
  "user": {
    "id": "6751234567890abcdef12346",
    "name": "Tran Van B",
    "email": "tranvanb@example.com",
    "oldRole": "Member",
    "newRole": "Treasurer"
  }
}
```

**Errors:**
- `400`: Team ID, User ID và new role bắt buộc
- `400`: Invalid role (phải là Member/Treasurer/Leader)
- `400`: Không thể thay đổi role của chính mình
- `404`: User không tìm thấy trong team

**Required Role:** Leader

---

### 3.6 Kick Member 🔒🔑
**POST** `/users/kick-member`

Đuổi thành viên khỏi team (chỉ Leader). Thành viên phải không còn nợ.

**Request Body:**
```json
{
  "teamId": "6751234567890abcdef67890",
  "userId": "6751234567890abcdef12346"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Member kicked successfully",
  "user": {
    "id": "6751234567890abcdef12346",
    "name": "Tran Van B",
    "email": "tranvanb@example.com"
  }
}
```

**Errors:**
- `400`: Team ID và User ID bắt buộc
- `400`: Không thể kick chính mình
- `400`: User có nợ chưa thanh toán
- `404`: User không tìm thấy trong team

**Required Role:** Leader

---

## 4. Finance API (`/finance`)

### 4.1 Get Finance Stats 🔒🔑
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

### 4.2 Trigger Monthly Fee 🔒🔑
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

### 4.3 Create Transaction 🔒🔑
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

### 4.4 Clear Debt 🔒🔑
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

### 4.5 Assign Debt 🔒🔑
**POST** `/finance/assign-debt`

Gán khoản chi mới cho thành viên (có thể kèm file upload).

**Request Body (multipart/form-data):**
```json
{
  "teamId": "6751234567890abcdef67890",
  "userId": "6751234567890abcdef12346",
  "amount": 50000,
  "description": "Equipment damage fee",
  "file": "<binary_image_file>"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Debt assigned successfully",
  "user": {
    "id": "6751234567890abcdef12346",
    "name": "Tran Van B",
    "newDebt": 200000
  },
  "transaction": {
    "_id": "6751234567890abcdef99998",
    "teamId": "6751234567890abcdef67890",
    "amount": 50000,
    "type": "MonthlyFee",
    "description": "Equipment damage fee",
    "proofImage": "https://res.cloudinary.com/...",
    "createdBy": {
      "_id": "6751234567890abcdef12345",
      "name": "Nguyen Van A"
    },
    "relatedUserId": {
      "_id": "6751234567890abcdef12346",
      "name": "Tran Van B"
    },
    "createdAt": "2025-12-11T10:30:00.000Z"
  }
}
```

**Errors:**
- `400`: Team ID, User ID, amount và description bắt buộc
- `400`: Amount phải lớn hơn 0
- `404`: User không tìm thấy trong team

**Required Role:** Treasurer, Leader

---

### 4.6 Create Payment Request 🔒
**POST** `/finance/payment-request`

Member tạo yêu cầu thanh toán nợ kèm ảnh chuyển khoản.

**Request Body (multipart/form-data):**
```json
{
  "teamId": "6751234567890abcdef67890",
  "amount": 150000,
  "description": "Payment for December monthly fee",
  "file": "<binary_image_file>"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Payment request created successfully",
  "paymentRequest": {
    "_id": "6751234567890abcdef66666",
    "teamId": "6751234567890abcdef67890",
    "userId": {
      "_id": "6751234567890abcdef12345",
      "name": "Nguyen Van A",
      "email": "nguyenvana@example.com"
    },
    "amount": 150000,
    "description": "Payment for December monthly fee",
    "proofImage": "https://res.cloudinary.com/...",
    "status": "Pending",
    "createdAt": "2025-12-11T10:30:00.000Z"
  }
}
```

**Errors:**
- `400`: Team ID, amount và description bắt buộc
- `400`: Amount phải lớn hơn 0
- `400`: Amount không được vượt quá debt hiện tại

**Required Role:** All (Member, Treasurer, Leader)

---

### 4.7 Approve Payment Request 🔒🔑
**PUT** `/finance/payment-request/:requestId/approve`

Treasurer duyệt yêu cầu thanh toán - Tự động trừ nợ và cộng quỹ.

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
  "message": "Payment request approved successfully",
  "paymentRequest": {
    "_id": "6751234567890abcdef66666",
    "status": "Approved",
    "userId": {
      "_id": "6751234567890abcdef12345",
      "name": "Nguyen Van A"
    },
    "amount": 150000,
    "approvedAt": "2025-12-11T11:00:00.000Z"
  },
  "user": {
    "id": "6751234567890abcdef12345",
    "remainingDebt": 100000
  },
  "newFundBalance": 1150000
}
```

**Errors:**
- `404`: Payment request không tìm thấy
- `400`: Payment request đã được duyệt/từ chối rồi
- `400`: User debt không đủ

**Required Role:** Treasurer, Leader

---

### 4.8 Reject Payment Request 🔒🔑
**PUT** `/finance/payment-request/:requestId/reject`

Treasurer từ chối yêu cầu thanh toán.

**Request Body:**
```json
{
  "teamId": "6751234567890abcdef67890",
  "reason": "Wrong bank account or amount mismatch"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment request rejected successfully",
  "paymentRequest": {
    "_id": "6751234567890abcdef66666",
    "status": "Rejected",
    "userId": {
      "_id": "6751234567890abcdef12345",
      "name": "Nguyen Van A"
    },
    "amount": 150000,
    "reason": "Wrong bank account or amount mismatch",
    "rejectedAt": "2025-12-11T11:00:00.000Z"
  }
}
```

**Errors:**
- `404`: Payment request không tìm thấy
- `400`: Payment request đã được duyệt/từ chối rồi

**Required Role:** Treasurer, Leader

---

### 4.9 Get Payment Requests 🔒🔑
**GET** `/finance/payment-requests`

Lấy danh sách payment requests của team (filter theo status).

**Query Parameters:**
- `teamId` (required): ID của team
- `status` (optional): Filter: `Pending`, `Approved`, `Rejected` (default: all)
- `limit` (optional): Số lượng (default: 50)

**Response (200):**
```json
{
  "success": true,
  "paymentRequests": [
    {
      "_id": "6751234567890abcdef66666",
      "userId": {
        "_id": "6751234567890abcdef12345",
        "name": "Nguyen Van A",
        "email": "nguyenvana@example.com"
      },
      "amount": 150000,
      "status": "Pending",
      "description": "Payment for December monthly fee",
      "proofImage": "https://res.cloudinary.com/...",
      "createdAt": "2025-12-11T10:30:00.000Z"
    }
  ]
}
```

**Required Role:** Treasurer, Leader

---

## 5. Match API (`/matches`)

### 5.1 Get All Matches 🔒
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

### 5.2 Create Match 🔒🔑
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

### 5.3 Vote for Match 🔒
**POST** `/matches/:matchId/vote`

Bình chọn tham gia/vắng mặt cho trận đấu, có thể đăng ký kèm guest.

**Request Body:**
```json
{
  "status": "Participate",
  "guestCount": 2,
  "note": "Dắt theo bạn em bắt gôn"
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
    "status": "Participate",
    "guestCount": 2,
    "note": "Dắt theo bạn em bắt gôn"
  }
}
```

**Errors:**
- `400`: Đã quá deadline voting
- `400`: Invalid status

**Notes:**
- `guestCount` mặc định là 0
- `note` là optional
- User có thể update vote của mình (guestCount, note, status)

---

### 5.4 Get Match Details 🔒
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

### 5.5 Update Match 🔒🔑
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

### 5.6 Delete Match 🔒🔑
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

### 5.7 Set Match Lineup 🔒🔑
**PUT** `/matches/:matchId/lineup`

Xếp đội hình cho trận đấu dựa trên những người Vote "Participate". Hệ thống tự động chia thành 2 team với cân bằng vị trí.

**Request Body:**
```json
{
  "teamId": "6751234567890abcdef67890",
  "teamA": [
    "6751234567890abcdef12345",
    "6751234567890abcdef12346",
    "6751234567890abcdef12347"
  ],
  "teamB": [
    "6751234567890abcdef12348",
    "6751234567890abcdef12349",
    "6751234567890abcdef12350"
  ]
}
```

**Or Auto-Generate (Hệ thống tự chia):**
```json
{
  "teamId": "6751234567890abcdef67890",
  "autoGenerate": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Lineup set successfully",
  "lineup": {
    "_id": "6751234567890abcdef55555",
    "matchId": "6751234567890abcdef88888",
    "teamA": [
      {
        "_id": "6751234567890abcdef12345",
        "name": "Nguyen Van A",
        "position": "Midfielder"
      },
      {
        "_id": "6751234567890abcdef12346",
        "name": "Tran Van B",
        "position": "Striker"
      }
    ],
    "teamB": [
      {
        "_id": "6751234567890abcdef12348",
        "name": "Pham Van C",
        "position": "Defender"
      },
      {
        "_id": "6751234567890abcdef12349",
        "name": "Hoang Van D",
        "position": "Goalkeeper"
      }
    ],
    "createdAt": "2025-12-11T15:00:00.000Z"
  }
}
```

**Auto-Generate Logic:**
- Lấy tất cả users với vote status = "Participate"
- Sắp xếp theo position để cân bằng
- Chia đều giữa teamA và teamB
- Ưu tiên: Goalkeeper 1-2, Defender 3-4, Midfielder 2-3, Striker 1-2, Winger 1-2

**Errors:**
- `404`: Match không tìm thấy
- `400`: Chưa có user nào vote "Participate"
- `400`: Số lượng players không cân bằng (teamA và teamB phải gần bằng nhau)

**Required Role:** Treasurer, Leader

---

### 5.8 Get Match Lineup 🔒
**GET** `/matches/:matchId/lineup`

Lấy thông tin đội hình của trận đấu.

**Response (200):**
```json
{
  "success": true,
  "lineup": {
    "_id": "6751234567890abcdef55555",
    "matchId": "6751234567890abcdef88888",
    "teamA": [
      {
        "_id": "6751234567890abcdef12345",
        "name": "Nguyen Van A",
        "position": "Midfielder"
      }
    ],
    "teamB": [
      {
        "_id": "6751234567890abcdef12348",
        "name": "Pham Van C",
        "position": "Defender"
      }
    ],
    "createdAt": "2025-12-11T15:00:00.000Z"
  }
}
```

**Errors:**
- `404`: Match không có lineup
- `404`: Match không tìm thấy

---

## 6. Data Models

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
  guestCount: Number (default: 0), // Số lượng khách đi kèm
  note: String (optional), // Ghi chú về khách (VD: "Em bắt gôn")
  timestamps: true,
  unique: [userId, matchId] // Mỗi user chỉ vote 1 lần/trận
}
```

### PaymentRequest (NEW)
```javascript
{
  _id: ObjectId,
  teamId: ObjectId (ref: Team),
  userId: ObjectId (ref: User),
  amount: Number,
  description: String,
  proofImage: String (Cloudinary URL), // Ảnh chuyển khoản
  status: String (enum: Pending/Approved/Rejected, default: Pending),
  reason: String (optional), // Lý do từ chối (nếu rejected)
  approvedAt: Date (optional),
  rejectedAt: Date (optional),
  timestamps: true
}
```

### Lineup (NEW)
```javascript
{
  _id: ObjectId,
  matchId: ObjectId (ref: Match),
  teamId: ObjectId (ref: Team),
  teamA: [
    {
      userId: ObjectId (ref: User),
      name: String,
      position: String
    }
  ],
  teamB: [
    {
      userId: ObjectId (ref: User),
      name: String,
      position: String
    }
  ],
  timestamps: true
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
| POST /finance/assign-debt | ❌ | ✅ | ✅ |
| POST /matches | ❌ | ✅ | ✅ |
| PUT /matches/:id | ❌ | ✅ | ✅ |
| DELETE /matches/:id | ❌ | ✅ | ✅ |
| POST /matches/:id/vote | ✅ | ✅ | ✅ |
| POST /users/invite-link/renew | ❌ | ❌ | ✅ |
| PUT /users/change-role | ❌ | ❌ | ✅ |
| POST /users/kick-member | ❌ | ❌ | ✅ |

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
