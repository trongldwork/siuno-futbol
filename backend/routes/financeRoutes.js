import express from 'express';
import {
  getFinanceStats,
  triggerMonthlyFee,
  createTransaction,
  clearDebt
} from '../controllers/financeController.js';
import { protect, authorize, requireTeam } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All finance routes require team membership and Treasurer/Leader role
router.use(protect);
router.use(requireTeam);
router.use(authorize('Leader', 'Treasurer'));

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
router.get('/stats', getFinanceStats);

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
router.post('/monthly-fee', triggerMonthlyFee);

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
router.post('/transaction', upload.single('proofImage'), createTransaction);

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
router.post('/clear-debt', upload.single('proofImage'), clearDebt);

export default router;
