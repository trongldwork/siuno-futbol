import express from 'express';
import {
  getFinanceStats,
  triggerMonthlyFee,
  createTransaction,
  clearDebt,
  assignDebt,
  createPaymentRequest,
  approvePaymentRequest,
  rejectPaymentRequest,
  getPaymentRequests
} from '../controllers/financeController.js';
import { protect, authorize, requireTeam } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All finance routes require authentication and team membership
router.use(protect);
router.use(requireTeam);

/**
 * @swagger
 * /api/finance/stats:
 *   get:
 *     tags: [Finance]
 *     summary: Get finance statistics
 *     description: Get current fund balance, debt list, and recent transactions (Leader/Treasurer only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Finance stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     currentFundBalance:
 *                       type: number
 *                     monthlyFeeAmount:
 *                       type: number
 *                     totalOutstandingDebt:
 *                       type: number
 *                     usersWithDebt:
 *                       type: array
 *                     recentTransactions:
 *                       type: array
 *       403:
 *         description: Forbidden - Leader/Treasurer only
 */
router.get('/stats', authorize('Leader', 'Treasurer'), getFinanceStats);

/**
 * @swagger
 * /api/finance/monthly-fee:
 *   post:
 *     tags: [Finance]
 *     summary: Trigger monthly fee
 *     description: Add monthly fee to all active members' debt (Leader/Treasurer only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly fee triggered successfully
 *       403:
 *         description: Forbidden - Leader/Treasurer only
 */
router.post('/monthly-fee', authorize('Leader', 'Treasurer'), triggerMonthlyFee);

/**
 * @swagger
 * /api/finance/transaction:
 *   post:
 *     tags: [Finance]
 *     summary: Create transaction
 *     description: Create a financial transaction with optional proof image (Leader/Treasurer only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 50000
 *               type:
 *                 type: string
 *                 enum: [FundCollection, Expense, GuestPayment, MatchExpense, MonthlyFee]
 *                 example: Expense
 *               description:
 *                 type: string
 *                 example: Equipment purchase
 *               proofImage:
 *                 type: string
 *                 format: binary
 *                 description: Proof image (jpg, png, pdf)
 *               relatedMatchId:
 *                 type: string
 *                 description: Match ID (for MatchExpense)
 *               totalCost:
 *                 type: number
 *                 description: Total match cost (for MatchExpense)
 *               totalParticipants:
 *                 type: number
 *                 description: Total participants (for MatchExpense)
 *               guestCount:
 *                 type: number
 *                 description: Number of guests (for MatchExpense)
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       403:
 *         description: Forbidden - Leader/Treasurer only
 */
router.post('/transaction', authorize('Leader', 'Treasurer'), upload.single('proofImage'), createTransaction);

/**
 * @swagger
 * /api/finance/clear-debt:
 *   post:
 *     tags: [Finance]
 *     summary: Clear user debt
 *     description: Mark a user's debt as paid with optional proof (Leader/Treasurer only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               amount:
 *                 type: number
 *                 example: 100000
 *               proofImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Debt cleared successfully
 *       403:
 *         description: Forbidden - Leader/Treasurer only
 */
router.post('/clear-debt', authorize('Leader', 'Treasurer'), upload.single('proofImage'), clearDebt);

/**
 * @swagger
 * /api/finance/assign-debt:
 *   post:
 *     tags: [Finance]
 *     summary: Assign debt to member
 *     description: Assign custom debt/charge to a member with optional proof (Leader/Treasurer only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *               - userId
 *               - amount
 *               - description
 *             properties:
 *               teamId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               userId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439012
 *               amount:
 *                 type: number
 *                 example: 50000
 *               description:
 *                 type: string
 *                 example: Equipment damage fee
 *               proofImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Debt assigned successfully
 *       403:
 *         description: Forbidden - Leader/Treasurer only
 */
router.post('/assign-debt', authorize('Leader', 'Treasurer'), upload.single('proofImage'), assignDebt);

/**
 * @swagger
 * /api/finance/payment-request:
 *   post:
 *     tags: [Finance]
 *     summary: Create payment request
 *     description: Member submits payment request with proof image (all members)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *               - amount
 *               - description
 *             properties:
 *               teamId:
 *                 type: string
 *               amount:
 *                 type: number
 *                 example: 100000
 *               description:
 *                 type: string
 *                 example: Payment for December monthly fee
 *               proofImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Payment request created successfully
 */
router.post('/payment-request', upload.single('proofImage'), createPaymentRequest);

/**
 * @swagger
 * /api/finance/payment-requests:
 *   get:
 *     tags: [Finance]
 *     summary: Get payment requests
 *     description: List payment requests (Leader/Treasurer only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *     responses:
 *       200:
 *         description: Payment requests retrieved successfully
 *       403:
 *         description: Forbidden - Leader/Treasurer only
 */
router.get('/payment-requests', authorize('Leader', 'Treasurer'), getPaymentRequests);

/**
 * @swagger
 * /api/finance/payment-request/{requestId}/approve:
 *   put:
 *     tags: [Finance]
 *     summary: Approve payment request
 *     description: Treasurer approves payment request (Leader/Treasurer only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *             properties:
 *               teamId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment request approved successfully
 *       403:
 *         description: Forbidden - Leader/Treasurer only
 */
router.put('/payment-request/:requestId/approve', authorize('Leader', 'Treasurer'), approvePaymentRequest);

/**
 * @swagger
 * /api/finance/payment-request/{requestId}/reject:
 *   put:
 *     tags: [Finance]
 *     summary: Reject payment request
 *     description: Treasurer rejects payment request (Leader/Treasurer only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *             properties:
 *               teamId:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment request rejected successfully
 *       403:
 *         description: Forbidden - Leader/Treasurer only
 */
router.put('/payment-request/:requestId/reject', authorize('Leader', 'Treasurer'), rejectPaymentRequest);

export default router;
