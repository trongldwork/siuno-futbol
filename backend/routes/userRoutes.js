import express from 'express';
import { 
  joinTeam, 
  leaveTeam, 
  renewInviteLink,
  createTeam,
  changeRole,
  kickMember
} from '../controllers/userController.js';
import { protect, authorize, requireTeam } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/create-team:
 *   post:
 *     tags: [Team]
 *     summary: Create a new team
 *     description: Create a new team and become the Leader
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamName
 *             properties:
 *               teamName:
 *                 type: string
 *                 example: FC Barcelona
 *               monthlyFeeAmount:
 *                 type: number
 *                 example: 100000
 *     responses:
 *       201:
 *         description: Team created successfully
 *       400:
 *         description: Bad request
 */
router.post('/create-team', protect, createTeam);

/**
 * @swagger
 * /api/users/join:
 *   post:
 *     tags: [Team]
 *     summary: Join a team
 *     description: Join a team using an invite code
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteCode
 *             properties:
 *               inviteCode:
 *                 type: string
 *                 example: ABC123DEF456
 *     responses:
 *       200:
 *         description: Successfully joined team
 *       404:
 *         description: Invalid invite code
 */
router.post('/join', protect, joinTeam);

/**
 * @swagger
 * /api/users/leave:
 *   post:
 *     tags: [Team]
 *     summary: Leave team
 *     description: Leave current team (requires zero debt)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully left team
 *       400:
 *         description: Cannot leave with outstanding debt
 */
router.post('/leave', protect, requireTeam, leaveTeam);

/**
 * @swagger
 * /api/users/invite-link/renew:
 *   post:
 *     tags: [Team]
 *     summary: Renew invite link
 *     description: Generate new invite code (Leader only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invite link renewed
 *       403:
 *         description: Forbidden - Leader only
 */
router.post('/invite-link/renew', protect, requireTeam, authorize('Leader'), renewInviteLink);

/**
 * @swagger
 * /api/users/change-role:
 *   put:
 *     tags: [Team]
 *     summary: Change member role
 *     description: Change a team member's role (Leader only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *               - userId
 *               - newRole
 *             properties:
 *               teamId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               userId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439012
 *               newRole:
 *                 type: string
 *                 enum: [Member, Treasurer, Leader]
 *                 example: Treasurer
 *     responses:
 *       200:
 *         description: Role changed successfully
 *       403:
 *         description: Forbidden - Leader only
 */
router.put('/change-role', protect, requireTeam, authorize('Leader'), changeRole);

/**
 * @swagger
 * /api/users/kick-member:
 *   post:
 *     tags: [Team]
 *     summary: Kick member from team
 *     description: Remove a member from the team (Leader only, member must have zero debt)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *               - userId
 *             properties:
 *               teamId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               userId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Member kicked successfully
 *       400:
 *         description: Cannot kick member with outstanding debt
 *       403:
 *         description: Forbidden - Leader only
 */
router.post('/kick-member', protect, requireTeam, authorize('Leader'), kickMember);

export default router;
