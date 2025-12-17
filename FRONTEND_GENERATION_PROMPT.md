# 🎯 Prompt Sinh Frontend - Siuno Futbol Team Management

## 📋 Tổng Quan Dự Án

Xây dựng ứng dụng **Frontend quản lý đội bóng** với các tính năng:
- Quản lý thành viên và nhiều teams
- Tạo và bình chọn tham gia trận đấu
- Quản lý tài chính (quỹ, nợ, giao dịch)
- Hệ thống phân quyền (SuperAdmin, Leader, Treasurer, Member)
- Upload file ảnh chứng từ

---

## 🛠️ Tech Stack Yêu Cầu

### Core Technologies
- **Build Tool:** Vite 5.x
- **Framework:** React 18.x với TypeScript
- **Styling:** Tailwind CSS 3.x + Headless UI hoặc Shadcn/UI
- **State Management:** Zustand hoặc React Query (TanStack Query)
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form + Zod validation
- **Date Handling:** date-fns hoặc Day.js
- **Icons:** Lucide React hoặc Heroicons
- **Notifications:** React Hot Toast hoặc Sonner

### Optional Nice-to-Have
- **Charts:** Recharts (cho finance dashboard)
- **Tables:** TanStack Table (cho danh sách)
- **Calendar:** React Big Calendar (hiển thị lịch trận)
- **Drag & Drop:** @dnd-kit/core (cho lineup editor)

---

## 🏗️ Cấu Trúc Thư Mục Đề Xuất

```
frontend/
├── public/
│   └── logo.svg
├── src/
│   ├── main.tsx                  # Entry point
│   ├── App.tsx                   # Root component với routing
│   ├── vite-env.d.ts
│   │
│   ├── api/                      # API clients và services
│   │   ├── axios.ts              # Axios instance với interceptors
│   │   ├── auth.api.ts           # Auth endpoints
│   │   ├── team.api.ts           # Team endpoints
│   │   ├── match.api.ts          # Match endpoints
│   │   ├── finance.api.ts        # Finance endpoints
│   │   └── admin.api.ts          # Admin endpoints (SuperAdmin)
│   │
│   ├── components/               # Reusable components
│   │   ├── ui/                   # Base UI components (Button, Input, Modal, etc.)
│   │   ├── layout/               # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── auth/                 # Auth-related components
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── team/                 # Team components
│   │   │   ├── TeamCard.tsx
│   │   │   ├── TeamList.tsx
│   │   │   ├── CreateTeamModal.tsx
│   │   │   ├── JoinTeamModal.tsx
│   │   │   └── MemberList.tsx
│   │   ├── match/                # Match components
│   │   │   ├── MatchCard.tsx
│   │   │   ├── MatchList.tsx
│   │   │   ├── CreateMatchModal.tsx
│   │   │   ├── VoteModal.tsx
│   │   │   ├── VoteChangeRequestModal.tsx
│   │   │   └── LineupEditor.tsx
│   │   ├── finance/              # Finance components
│   │   │   ├── FinanceStats.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   ├── CreateTransactionModal.tsx
│   │   │   ├── ClearDebtModal.tsx
│   │   │   ├── PaymentRequestCard.tsx
│   │   │   └── PaymentRequestModal.tsx
│   │   └── admin/                # Admin components (SuperAdmin only)
│   │       ├── AdminDashboard.tsx
│   │       ├── UserManagement.tsx
│   │       ├── TeamManagement.tsx
│   │       └── ReportsView.tsx
│   │
│   ├── pages/                    # Page components
│   │   ├── HomePage.tsx
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── team/
│   │   │   ├── TeamsPage.tsx       # Danh sách teams của user
│   │   │   ├── TeamDetailPage.tsx  # Chi tiết 1 team
│   │   │   └── CreateTeamPage.tsx
│   │   ├── match/
│   │   │   ├── MatchesPage.tsx     # Danh sách trận đấu
│   │   │   ├── MatchDetailPage.tsx # Chi tiết trận + votes
│   │   │   └── CreateMatchPage.tsx
│   │   ├── finance/
│   │   │   ├── FinancePage.tsx     # Overview tài chính
│   │   │   ├── TransactionsPage.tsx
│   │   │   └── PaymentRequestsPage.tsx
│   │   ├── profile/
│   │   │   └── ProfilePage.tsx
│   │   └── admin/
│   │       ├── AdminDashboardPage.tsx
│   │       ├── UsersPage.tsx
│   │       ├── TeamsPage.tsx
│   │       └── ReportsPage.tsx
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts            # Auth state & operations
│   │   ├── useTeam.ts            # Current team context
│   │   ├── useMatches.ts         # Fetch & manage matches
│   │   ├── useFinance.ts         # Finance operations
│   │   └── useAdmin.ts           # Admin operations
│   │
│   ├── stores/                   # State management (Zustand)
│   │   ├── authStore.ts          # Auth state (user, token, teams)
│   │   ├── teamStore.ts          # Current selected team
│   │   └── notificationStore.ts  # Toast notifications
│   │
│   ├── types/                    # TypeScript types
│   │   ├── user.types.ts
│   │   ├── team.types.ts
│   │   ├── match.types.ts
│   │   ├── finance.types.ts
│   │   ├── vote.types.ts
│   │   └── api.types.ts
│   │
│   ├── utils/                    # Utility functions
│   │   ├── format.ts             # Date, currency formatting
│   │   ├── validation.ts         # Validation helpers
│   │   ├── constants.ts          # App constants (roles, enums)
│   │   └── storage.ts            # LocalStorage helpers
│   │
│   └── styles/
│       ├── index.css             # Tailwind imports
│       └── globals.css           # Global styles
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

---

## 📡 Backend API Specification

### Base URL
```
http://localhost:5000/api
```

### Authentication
- **JWT Token:** Gửi trong header `Authorization: Bearer <token>`
- **Token Storage:** Lưu trong localStorage hoặc sessionStorage
- **Token Expiry:** 30 days (cần handle refresh hoặc re-login)

---

## 🔑 User Types & Roles

### 1. SuperAdmin
**Quyền:** Quản lý toàn bộ hệ thống
- Xem tất cả users, teams, transactions
- Activate/deactivate users
- Xem báo cáo hệ thống (dashboard, finance, activities)
- **KHÔNG** thuộc team nào (role riêng biệt)

### 2. Team Roles (Per-Team)
- **Leader:** Quyền cao nhất trong team
  - Tạo/cập nhật/xóa matches
  - Quản lý tài chính (transactions, clear debt)
  - Duyệt vote change requests
  - Renew invite code
  - Change member roles
  - Kick members
  
- **Treasurer:** Quản lý tài chính
  - Tạo/cập nhật/xóa matches
  - Quản lý tài chính
  - Approve/reject payment requests
  
- **Member:** Thành viên
  - Vote cho matches
  - Xem thông tin team
  - Tạo payment requests (thanh toán nợ)

### Multi-Team Support
- User có thể tham gia **nhiều teams** với role khác nhau
- VD: Leader ở Team A, Member ở Team B
- Mỗi request cần chỉ định `teamId`

---

## 📊 Core Data Models (TypeScript Types)

### User
```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  dob: string; // ISO date
  position: 'Striker' | 'Midfielder' | 'Defender' | 'Goalkeeper' | 'Winger';
  phone: string;
  role: 'User' | 'SuperAdmin'; // System role
  teams?: TeamMembership[]; // Array of teams user belongs to
  createdAt: string;
}

interface TeamMembership {
  teamId: string;
  teamName: string;
  inviteCode: string;
  monthlyFeeAmount: number;
  currentFundBalance: number;
  role: 'Leader' | 'Treasurer' | 'Member'; // Role in this specific team
  debt: number;
  isActive: boolean;
  joinedAt: string;
}
```

### Team
```typescript
interface Team {
  _id: string;
  name: string;
  inviteCode: string;
  monthlyFeeAmount: number;
  currentFundBalance: number;
  createdBy: string; // User ID
  createdAt: string;
  members?: TeamMember[]; // Populated when needed
}

interface TeamMember {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    position: string;
    phone: string;
  };
  role: 'Leader' | 'Treasurer' | 'Member';
  debt: number;
  isActive: boolean;
  joinedAt: string;
}
```

### Match
```typescript
interface Match {
  _id: string;
  teamId: string;
  opponentName: string;
  time: string; // ISO date
  location: string;
  contactPerson?: string;
  votingDeadline: string; // ISO date
  matchCost?: number;
  totalParticipants?: number;
  guestCount?: number;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  isLocked: boolean;
  createdBy: string;
  createdAt: string;
  // Populated fields
  votes?: Vote[];
  participantCount?: number;
  absentCount?: number;
  lateCount?: number;
}
```

### Vote
```typescript
interface Vote {
  _id: string;
  userId: string | { _id: string; name: string; position: string };
  matchId: string;
  status: 'Participate' | 'Absent' | 'Late';
  guestCount?: number; // Số khách đi kèm
  note?: string;
  changeReason?: string;
  changeRequestedAt?: string;
  isApprovedChange: boolean;
  createdAt: string;
}
```

### Transaction
```typescript
interface Transaction {
  _id: string;
  teamId: string;
  amount: number;
  type: 'FundCollection' | 'Expense' | 'GuestPayment' | 'MatchExpense' | 'MonthlyFee';
  description: string;
  proofImage?: string; // Cloudinary URL
  relatedMatchId?: string;
  relatedUserId?: string | { _id: string; name: string };
  createdBy: string | { _id: string; name: string };
  createdAt: string;
}
```

### PaymentRequest
```typescript
interface PaymentRequest {
  _id: string;
  teamId: string;
  userId: string | { _id: string; name: string; email: string };
  amount: number;
  description: string;
  proofImage: string; // Cloudinary URL
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string; // Rejection reason
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
}
```

### Lineup
```typescript
interface Lineup {
  _id: string;
  matchId: string;
  teamId: string;
  teamA: LineupPlayer[];
  teamB: LineupPlayer[];
  createdAt: string;
}

interface LineupPlayer {
  userId: string;
  name: string;
  position: string;
}
```

---

## 🎨 UI/UX Requirements

### Design Guidelines
1. **Responsive Design:** Mobile-first (320px → Desktop)
2. **Color Scheme:** 
   - Primary: Green/Blue (soccer theme)
   - Success: Green
   - Warning: Yellow/Orange
   - Danger: Red
   - Neutral: Gray scale
3. **Typography:** Clean, readable (Inter, Poppins, hoặc SF Pro)
4. **Icons:** Consistent icon set (Lucide hoặc Heroicons)

### Key UI Components Cần Có

#### 1. Navigation
- **Top Navbar:**
  - Logo/Brand
  - Team Selector Dropdown (nếu user thuộc nhiều teams)
  - Notifications icon
  - User avatar + dropdown menu (Profile, Logout)
  
- **Sidebar (optional):**
  - Dashboard
  - Teams
  - Matches
  - Finance (nếu có quyền)
  - Admin (nếu SuperAdmin)

#### 2. Dashboard Cards
- Current Team Info (name, fund balance, monthly fee)
- Upcoming Matches (3-5 trận gần nhất)
- My Debt (nếu có)
- Recent Transactions (cho Leader/Treasurer)

#### 3. Match Components
- **Match Card:**
  - Opponent name
  - Date & Time
  - Location
  - Vote status badge (Participate/Absent/Late hoặc Not Voted)
  - Voting deadline countdown
  - Action buttons (Vote, View Details)

- **Match Detail:**
  - Full info
  - Vote list with status
  - Vote statistics (pie chart: Participate vs Absent vs Late)
  - Lineup (if available)

#### 4. Finance Components
- **Stats Cards:**
  - Current Fund Balance (lớn, nổi bật)
  - Total Outstanding Debt
  - Monthly Fee Amount
  - Number of members with debt

- **Transaction List:**
  - Date
  - Type badge (color-coded)
  - Description
  - Amount (+/-)
  - Proof image thumbnail (click to view)
  - Created by

- **Payment Request Card:**
  - User info
  - Amount
  - Proof image
  - Status badge
  - Approve/Reject buttons (Treasurer/Leader)

#### 5. Team Components
- **Team Card:**
  - Team name
  - Your role badge
  - Member count
  - Fund balance
  - Invite code (with copy button)
  - Action buttons (View Details, Leave Team)

- **Member List:**
  - Avatar/Name
  - Position
  - Role badge
  - Debt amount (highlight if > 0)
  - Actions (Change Role, Kick) for Leader

#### 6. Admin Dashboard (SuperAdmin)
- **Stats Overview:**
  - Total Users
  - Total Teams
  - Total Members (across all teams)
  - Pending Payment Requests
  - Total Fund (sum of all teams)
  - Total Debt (sum of all teams)

- **User Management Table:**
  - Search/filter
  - Active/Inactive toggle
  - Actions

- **Team Management:**
  - All teams list
  - Member counts
  - Fund balances

---

## 🔐 Authentication Flow

### 1. Login/Register
```
User → Login Form → POST /api/auth/login
     ← Response: { token, user: { ..., teams: [...] } }
     → Save token to localStorage
     → Save user to authStore
     → Redirect to Dashboard
```

### 2. Token Management
```typescript
// Axios interceptor để tự động gửi token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 3. Protected Routes
```typescript
// ProtectedRoute component
function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
}
```

---

## 🌐 API Integration Examples

### Auth API
```typescript
// src/api/auth.api.ts
import { apiClient } from './axios';

export const authApi = {
  register: async (data: RegisterInput) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
  
  login: async (credentials: LoginInput) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  }
};
```

### Team API (với Multi-Team Support)
```typescript
// src/api/team.api.ts
export const teamApi = {
  createTeam: async (data: CreateTeamInput) => {
    const response = await apiClient.post('/users/create-team', data);
    return response.data;
  },
  
  joinTeam: async (inviteCode: string) => {
    const response = await apiClient.post('/users/join', { inviteCode });
    return response.data;
  },
  
  leaveTeam: async (teamId: string) => {
    const response = await apiClient.post('/users/leave', { teamId });
    return response.data;
  },
  
  renewInviteCode: async (teamId: string) => {
    const response = await apiClient.post('/users/invite-link/renew', { teamId });
    return response.data;
  },
  
  changeRole: async (teamId: string, userId: string, newRole: string) => {
    const response = await apiClient.put('/users/change-role', {
      teamId,
      userId,
      newRole
    });
    return response.data;
  },
  
  kickMember: async (teamId: string, userId: string) => {
    const response = await apiClient.post('/users/kick-member', {
      teamId,
      userId
    });
    return response.data;
  }
};
```

### Match API
```typescript
// src/api/match.api.ts
export const matchApi = {
  getMatches: async (teamId: string, status?: string) => {
    const response = await apiClient.get('/matches', {
      params: { teamId, status }
    });
    return response.data;
  },
  
  getMatchById: async (matchId: string) => {
    const response = await apiClient.get(`/matches/${matchId}`);
    return response.data;
  },
  
  createMatch: async (data: CreateMatchInput) => {
    const response = await apiClient.post('/matches', data);
    return response.data;
  },
  
  vote: async (matchId: string, voteData: VoteInput) => {
    const response = await apiClient.post(`/matches/${matchId}/vote`, voteData);
    return response.data;
  },
  
  updateMatch: async (matchId: string, data: UpdateMatchInput) => {
    const response = await apiClient.put(`/matches/${matchId}`, data);
    return response.data;
  },
  
  deleteMatch: async (matchId: string) => {
    const response = await apiClient.delete(`/matches/${matchId}`);
    return response.data;
  },
  
  setLineup: async (matchId: string, data: LineupInput) => {
    const response = await apiClient.put(`/matches/${matchId}/lineup`, data);
    return response.data;
  },
  
  getLineup: async (matchId: string) => {
    const response = await apiClient.get(`/matches/${matchId}/lineup`);
    return response.data;
  }
};
```

### Finance API
```typescript
// src/api/finance.api.ts
export const financeApi = {
  getStats: async (teamId: string) => {
    const response = await apiClient.get('/finance/stats', {
      params: { teamId }
    });
    return response.data;
  },
  
  triggerMonthlyFee: async (teamId: string) => {
    const response = await apiClient.post('/finance/monthly-fee', { teamId });
    return response.data;
  },
  
  createTransaction: async (data: FormData) => {
    const response = await apiClient.post('/finance/transaction', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  clearDebt: async (data: FormData) => {
    const response = await apiClient.post('/finance/clear-debt', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  assignDebt: async (data: FormData) => {
    const response = await apiClient.post('/finance/assign-debt', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  createPaymentRequest: async (data: FormData) => {
    const response = await apiClient.post('/finance/payment-request', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  approvePaymentRequest: async (requestId: string, teamId: string) => {
    const response = await apiClient.put(
      `/finance/payment-request/${requestId}/approve`,
      { teamId }
    );
    return response.data;
  },
  
  rejectPaymentRequest: async (requestId: string, teamId: string, reason: string) => {
    const response = await apiClient.put(
      `/finance/payment-request/${requestId}/reject`,
      { teamId, reason }
    );
    return response.data;
  },
  
  getPaymentRequests: async (teamId: string, status?: string) => {
    const response = await apiClient.get('/finance/payment-requests', {
      params: { teamId, status }
    });
    return response.data;
  }
};
```

### Admin API (SuperAdmin Only)
```typescript
// src/api/admin.api.ts
export const adminApi = {
  getDashboard: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },
  
  getUsers: async (params?: { active?: boolean; page?: number; limit?: number }) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },
  
  toggleUserStatus: async (userId: string) => {
    const response = await apiClient.patch(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },
  
  getTeams: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get('/admin/teams', { params });
    return response.data;
  },
  
  getTeamDetails: async (teamId: string) => {
    const response = await apiClient.get(`/admin/teams/${teamId}`);
    return response.data;
  },
  
  getAllTransactions: async (params?: {
    teamId?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/admin/transactions', { params });
    return response.data;
  },
  
  getAllPaymentRequests: async (params?: {
    status?: string;
    teamId?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/admin/payment-requests', { params });
    return response.data;
  },
  
  getFinanceReport: async () => {
    const response = await apiClient.get('/admin/reports/finance');
    return response.data;
  },
  
  getUserActivityReport: async () => {
    const response = await apiClient.get('/admin/reports/users');
    return response.data;
  }
};
```

---

## 🎯 Core Features Implementation Guide

### 1. Multi-Team Management

#### Team Selector Component
```typescript
// components/layout/TeamSelector.tsx
function TeamSelector() {
  const { user, currentTeam, setCurrentTeam } = useAuth();
  
  return (
    <Select value={currentTeam?._id} onValueChange={setCurrentTeam}>
      {user.teams?.map(team => (
        <SelectItem key={team.teamId} value={team.teamId}>
          <div>
            <span className="font-medium">{team.teamName}</span>
            <span className="text-xs text-gray-500 ml-2">
              ({team.role})
            </span>
          </div>
        </SelectItem>
      ))}
    </Select>
  );
}
```

#### Team Context Hook
```typescript
// hooks/useTeam.ts
export function useTeam() {
  const { user } = useAuth();
  const [currentTeamId, setCurrentTeamId] = useLocalStorage('currentTeamId', '');
  
  const currentTeam = useMemo(() => {
    return user.teams?.find(t => t.teamId === currentTeamId);
  }, [user.teams, currentTeamId]);
  
  const switchTeam = (teamId: string) => {
    setCurrentTeamId(teamId);
  };
  
  const hasRole = (role: 'Leader' | 'Treasurer') => {
    return currentTeam?.role === role || currentTeam?.role === 'Leader';
  };
  
  return { currentTeam, switchTeam, hasRole };
}
```

### 2. Match Voting với Deadline

#### Vote Modal Component
```typescript
// components/match/VoteModal.tsx
function VoteModal({ match, onClose }: Props) {
  const { currentTeam } = useTeam();
  const [status, setStatus] = useState<VoteStatus>('Participate');
  const [guestCount, setGuestCount] = useState(0);
  const [note, setNote] = useState('');
  
  const isAfterDeadline = new Date() > new Date(match.votingDeadline);
  
  const handleVote = async () => {
    if (isAfterDeadline) {
      // Show request change modal instead
      return;
    }
    
    await matchApi.vote(match._id, { status, guestCount, note });
    toast.success('Vote recorded!');
    onClose();
  };
  
  return (
    <Modal open onClose={onClose}>
      <ModalHeader>Vote for Match</ModalHeader>
      <ModalBody>
        {isAfterDeadline && (
          <Alert variant="warning">
            Voting deadline has passed. You need to request a change.
          </Alert>
        )}
        
        <RadioGroup value={status} onChange={setStatus}>
          <RadioOption value="Participate">Participate</RadioOption>
          <RadioOption value="Absent">Absent</RadioOption>
          <RadioOption value="Late">Late</RadioOption>
        </RadioGroup>
        
        {status === 'Participate' && (
          <Input
            type="number"
            label="Guest Count"
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            min={0}
          />
        )}
        
        <Textarea
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </ModalBody>
      <ModalFooter>
        <Button onClick={handleVote} disabled={isAfterDeadline}>
          Submit Vote
        </Button>
      </ModalFooter>
    </Modal>
  );
}
```

### 3. Finance Management với File Upload

#### Create Transaction Modal
```typescript
// components/finance/CreateTransactionModal.tsx
function CreateTransactionModal({ onClose }: Props) {
  const { currentTeam } = useTeam();
  const [type, setType] = useState<TransactionType>('FundCollection');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  // Special fields for MatchExpense
  const [relatedMatchId, setRelatedMatchId] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [totalParticipants, setTotalParticipants] = useState('');
  const [guestCount, setGuestCount] = useState('');
  
  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('teamId', currentTeam.teamId);
    formData.append('amount', amount);
    formData.append('type', type);
    formData.append('description', description);
    
    if (file) {
      formData.append('file', file);
    }
    
    if (type === 'MatchExpense') {
      formData.append('relatedMatchId', relatedMatchId);
      formData.append('totalCost', totalCost);
      formData.append('totalParticipants', totalParticipants);
      formData.append('guestCount', guestCount);
    }
    
    await financeApi.createTransaction(formData);
    toast.success('Transaction created!');
    onClose();
  };
  
  return (
    <Modal open onClose={onClose}>
      <ModalHeader>Create Transaction</ModalHeader>
      <ModalBody>
        <Select value={type} onValueChange={setType}>
          <SelectItem value="FundCollection">Fund Collection</SelectItem>
          <SelectItem value="Expense">Expense</SelectItem>
          <SelectItem value="GuestPayment">Guest Payment</SelectItem>
          <SelectItem value="MatchExpense">Match Expense</SelectItem>
        </Select>
        
        <Input
          type="number"
          label="Amount (VNĐ)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        
        {type === 'MatchExpense' && (
          <>
            <MatchSelect
              value={relatedMatchId}
              onChange={setRelatedMatchId}
            />
            <Input
              type="number"
              label="Total Cost"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
            />
            <Input
              type="number"
              label="Total Participants"
              value={totalParticipants}
              onChange={(e) => setTotalParticipants(e.target.value)}
            />
            <Input
              type="number"
              label="Guest Count"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
            />
          </>
        )}
        
        <FileInput
          label="Proof Image (optional)"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </ModalBody>
      <ModalFooter>
        <Button onClick={handleSubmit}>Create</Button>
      </ModalFooter>
    </Modal>
  );
}
```

### 4. Payment Request Flow (Member → Treasurer)

#### Create Payment Request Modal (Member)
```typescript
// components/finance/PaymentRequestModal.tsx
function PaymentRequestModal({ onClose }: Props) {
  const { currentTeam } = useTeam();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const handleSubmit = async () => {
    if (!file) {
      toast.error('Proof image is required!');
      return;
    }
    
    const formData = new FormData();
    formData.append('teamId', currentTeam.teamId);
    formData.append('amount', amount);
    formData.append('description', description);
    formData.append('file', file);
    
    await financeApi.createPaymentRequest(formData);
    toast.success('Payment request submitted!');
    onClose();
  };
  
  return (
    <Modal open onClose={onClose}>
      <ModalHeader>Request Payment</ModalHeader>
      <ModalBody>
        <div className="bg-blue-50 p-3 rounded mb-4">
          <p className="text-sm">Your current debt: <strong>{formatCurrency(currentTeam.debt)}</strong></p>
        </div>
        
        <Input
          type="number"
          label="Amount (VNĐ)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          max={currentTeam.debt}
        />
        
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="E.g., Payment for December monthly fee"
        />
        
        <FileInput
          label="Proof Image (Required) *"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
      </ModalBody>
      <ModalFooter>
        <Button onClick={handleSubmit}>Submit Request</Button>
      </ModalFooter>
    </Modal>
  );
}
```

#### Payment Requests Page (Treasurer/Leader)
```typescript
// pages/finance/PaymentRequestsPage.tsx
function PaymentRequestsPage() {
  const { currentTeam, hasRole } = useTeam();
  const [status, setStatus] = useState<string>('Pending');
  const { data: requests, isLoading } = useQuery(
    ['paymentRequests', currentTeam.teamId, status],
    () => financeApi.getPaymentRequests(currentTeam.teamId, status)
  );
  
  const handleApprove = async (requestId: string) => {
    await financeApi.approvePaymentRequest(requestId, currentTeam.teamId);
    toast.success('Payment request approved!');
    queryClient.invalidateQueries(['paymentRequests']);
  };
  
  const handleReject = async (requestId: string, reason: string) => {
    await financeApi.rejectPaymentRequest(requestId, currentTeam.teamId, reason);
    toast.success('Payment request rejected!');
    queryClient.invalidateQueries(['paymentRequests']);
  };
  
  if (!hasRole('Treasurer')) {
    return <Navigate to="/finance" />;
  }
  
  return (
    <div>
      <PageHeader title="Payment Requests" />
      
      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>
          <TabsTrigger value="Pending">Pending</TabsTrigger>
          <TabsTrigger value="Approved">Approved</TabsTrigger>
          <TabsTrigger value="Rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid gap-4 mt-4">
        {requests?.paymentRequests.map(request => (
          <PaymentRequestCard
            key={request._id}
            request={request}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
      </div>
    </div>
  );
}
```

### 5. Admin Dashboard (SuperAdmin)

#### Admin Dashboard Page
```typescript
// pages/admin/AdminDashboardPage.tsx
function AdminDashboardPage() {
  const { user } = useAuth();
  
  if (user.role !== 'SuperAdmin') {
    return <Navigate to="/dashboard" />;
  }
  
  const { data: stats } = useQuery('adminDashboard', adminApi.getDashboard);
  
  return (
    <div>
      <PageHeader title="Admin Dashboard" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats?.stats.totalUsers}
          icon={<UsersIcon />}
        />
        <StatsCard
          title="Total Teams"
          value={stats?.stats.totalTeams}
          icon={<TeamIcon />}
        />
        <StatsCard
          title="Total Members"
          value={stats?.stats.totalMembers}
          icon={<MembersIcon />}
        />
        <StatsCard
          title="Pending Payments"
          value={stats?.stats.pendingPayments}
          icon={<PaymentIcon />}
          variant="warning"
        />
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>System Health</CardHeader>
          <CardBody>
            <p>Active Teams: {stats?.stats.systemHealth.activeTeams}</p>
            <p>Active Members: {stats?.stats.systemHealth.activeMembers}</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader>Financial Overview</CardHeader>
          <CardBody>
            <p>Total Fund: {formatCurrency(stats?.stats.totalFund)}</p>
            <p>Total Debt: {formatCurrency(stats?.stats.totalDebt)}</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
```

---

## 🧪 Testing & Quality

### Unit Tests
- Test utility functions (formatCurrency, formatDate)
- Test validation functions
- Test API functions (mock axios)

### Integration Tests
- Test component interactions
- Test form submissions
- Test routing

### E2E Tests (Optional)
- User registration → Login → Create Team
- Member joins team → Votes on match
- Treasurer creates transaction → Approves payment request

---

## 📦 Package.json Dependencies

```json
{
  "name": "siuno-futbol-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "axios": "^1.6.2",
    "zustand": "^4.4.7",
    "@tanstack/react-query": "^5.17.0",
    "react-hook-form": "^7.49.2",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.3",
    "date-fns": "^3.0.6",
    "lucide-react": "^0.303.0",
    "react-hot-toast": "^2.4.1",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

---

## 🎯 Implementation Priorities

### Phase 1: Core Setup (Day 1-2)
1. ✅ Setup Vite + React + TypeScript + Tailwind
2. ✅ Configure routing (React Router)
3. ✅ Setup Axios with interceptors
4. ✅ Create auth store (Zustand)
5. ✅ Build basic layout (Navbar, Sidebar)
6. ✅ Implement Login/Register pages

### Phase 2: Team Management (Day 3-4)
7. ✅ Create/Join Team functionality
8. ✅ Team selector dropdown
9. ✅ Team detail page with members
10. ✅ Leave team with debt validation
11. ✅ Role management (Leader only)

### Phase 3: Match Management (Day 5-6)
12. ✅ Match list with filters
13. ✅ Create match modal
14. ✅ Vote modal with deadline logic
15. ✅ Match detail with votes
16. ✅ Lineup editor

### Phase 4: Finance Management (Day 7-8)
17. ✅ Finance stats dashboard
18. ✅ Transaction list
19. ✅ Create transaction with file upload
20. ✅ Payment request flow (Member → Treasurer)
21. ✅ Clear debt functionality

### Phase 5: Admin Features (Day 9-10)
22. ✅ Admin dashboard
23. ✅ User management table
24. ✅ Team management view
25. ✅ Reports (Finance & User Activity)

### Phase 6: Polish & Optimization (Day 11-12)
26. ✅ Error handling & loading states
27. ✅ Responsive design refinement
28. ✅ Performance optimization
29. ✅ Documentation & README

---

## ✨ Nice-to-Have Features

### Advanced UI
- Dark mode toggle
- Skeleton loaders
- Animated transitions (Framer Motion)
- Advanced charts (Recharts)
- Calendar view for matches (React Big Calendar)

### Enhanced UX
- Infinite scroll for lists
- Real-time notifications (WebSocket)
- Optimistic updates
- Offline support (Service Worker)
- Progressive Web App (PWA)

### Additional Features
- Match statistics (goals, assists)
- Player ratings
- Team achievements/badges
- Chat/comments on matches
- Export reports to PDF/Excel

---

## 🚀 Getting Started Checklist

### Before Coding
- [ ] Read backend API specification thoroughly
- [ ] Understand data models and relationships
- [ ] Sketch UI wireframes (optional but recommended)
- [ ] Setup project structure

### During Development
- [ ] Use TypeScript strictly (avoid `any`)
- [ ] Handle loading & error states for all API calls
- [ ] Validate forms with Zod
- [ ] Test on mobile devices (responsive)
- [ ] Follow Tailwind best practices (use `@apply` sparingly)

### Before Deployment
- [ ] Remove console.logs
- [ ] Test all user flows
- [ ] Check accessibility (ARIA labels)
- [ ] Optimize bundle size (lazy loading)
- [ ] Setup environment variables (.env)

---

## 📚 Environment Variables

### `.env.example`
```env
# API Base URL
VITE_API_BASE_URL=http://localhost:5000/api

# App Config
VITE_APP_NAME=Siuno Futbol
VITE_APP_VERSION=1.0.0

# Optional: Analytics, Error Tracking
# VITE_SENTRY_DSN=
# VITE_GA_TRACKING_ID=
```

---

## 🎓 Learning Resources

### React + TypeScript
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tailwind CSS
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)

### React Query
- [TanStack Query Docs](https://tanstack.com/query/latest)

### React Hook Form + Zod
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

---

## 🙏 Final Notes

### Key Principles
1. **Type Safety:** Leverage TypeScript fully
2. **Component Reusability:** Build modular UI components
3. **Performance:** Use React.memo, useMemo, useCallback wisely
4. **User Experience:** Loading states, error messages, success feedback
5. **Code Quality:** Consistent formatting, meaningful variable names

### Communication with Backend
- Always send `teamId` for team-specific operations
- Handle 401 (Unauthorized) by redirecting to login
- Handle 403 (Forbidden) by showing "No Permission" message
- Validate file uploads (size, type) before sending

### Multi-Team Context
- User can belong to multiple teams
- Always select a "current team" before operations
- Show team selector prominently in navbar
- Store current team ID in localStorage for persistence

---

**Good luck building the frontend! 🚀⚽**

---

## 📧 Support

Nếu có thắc mắc về backend API hoặc business logic, tham khảo:
- Backend README.md
- API_SPECIFICATION.md
- DATABASE_SCHEMA.md
- Swagger UI tại http://localhost:5000/api-docs
