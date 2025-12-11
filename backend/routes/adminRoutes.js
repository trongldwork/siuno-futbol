import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getAllTeams,
  getTeamDetails,
  toggleUserStatus,
  getAllTransactions,
  getAllPaymentRequests,
  getFinanceReport,
  getUserActivityReport,
  createSuperAdmin
} from '../controllers/adminController.js';
import { protect, isSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/create-superadmin:
 *   post:
 *     tags: [Admin]
 *     summary: Create SuperAdmin account
 *     description: Create initial SuperAdmin account (first time only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: System Admin
 *               email:
 *                 type: string
 *                 example: admin@siuno.com
 *               password:
 *                 type: string
 *                 example: SecurePassword123
 *               phone:
 *                 type: string
 *                 example: 0901234567
 *     responses:
 *       201:
 *         description: SuperAdmin created successfully
 *       400:
 *         description: SuperAdmin already exists or missing fields
 */
router.post('/create-superadmin', createSuperAdmin);

// All routes below require authentication and SuperAdmin role
router.use(protect);
router.use(isSuperAdmin);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get system dashboard statistics
 *     description: Get overview of system status, users, teams, and finance (SuperAdmin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *       403:
 *         description: Forbidden - SuperAdmin only
 */
router.get('/dashboard', getDashboardStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users
 *     description: List all users in system with pagination (SuperAdmin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Forbidden - SuperAdmin only
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /api/admin/users/{userId}/toggle-status:
 *   patch:
 *     tags: [Admin]
 *     summary: Toggle user status
 *     description: Activate/deactivate user account (SuperAdmin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User status toggled successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden - SuperAdmin only
 */
router.patch('/users/:userId/toggle-status', toggleUserStatus);

/**
 * @swagger
 * /api/admin/teams:
 *   get:
 *     tags: [Admin]
 *     summary: Get all teams
 *     description: List all teams with member counts (SuperAdmin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *     responses:
 *       200:
 *         description: Teams retrieved successfully
 *       403:
 *         description: Forbidden - SuperAdmin only
 */
router.get('/teams', getAllTeams);

/**
 * @swagger
 * /api/admin/teams/{teamId}:
 *   get:
 *     tags: [Admin]
 *     summary: Get team details
 *     description: Get detailed team info with members and stats (SuperAdmin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team details retrieved successfully
 *       404:
 *         description: Team not found
 *       403:
 *         description: Forbidden - SuperAdmin only
 */
router.get('/teams/:teamId', getTeamDetails);

/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     tags: [Admin]
 *     summary: Get all transactions
 *     description: View all transactions across all teams (SuperAdmin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [FundCollection, Expense, GuestPayment, MatchExpense, MonthlyFee]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *       403:
 *         description: Forbidden - SuperAdmin only
 */
router.get('/transactions', getAllTransactions);

/**
 * @swagger
 * /api/admin/payment-requests:
 *   get:
 *     tags: [Admin]
 *     summary: Get all payment requests
 *     description: View all payment requests across system (SuperAdmin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *     responses:
 *       200:
 *         description: Payment requests retrieved successfully
 *       403:
 *         description: Forbidden - SuperAdmin only
 */
router.get('/payment-requests', getAllPaymentRequests);

/**
 * @swagger
 * /api/admin/reports/finance:
 *   get:
 *     tags: [Admin]
 *     summary: Get finance report
 *     description: Generate comprehensive finance report (SuperAdmin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Finance report generated successfully
 *       403:
 *         description: Forbidden - SuperAdmin only
 */
router.get('/reports/finance', getFinanceReport);

/**
 * @swagger
 * /api/admin/reports/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get user activity report
 *     description: Generate user activity and team engagement report (SuperAdmin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User activity report generated successfully
 *       403:
 *         description: Forbidden - SuperAdmin only
 */
router.get('/reports/users', getUserActivityReport);

export default router;
