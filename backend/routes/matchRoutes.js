import express from 'express';
import {
  createMatch,
  getMatches,
  voteForMatch,
  requestVoteChange,
  approveVoteChange,
  getMatchDetails,
  toggleMatchLock
} from '../controllers/matchController.js';
import { protect, authorize, requireTeam } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and team membership
router.use(protect);
router.use(requireTeam);

/**
 * @swagger
 * /api/matches:
 *   get:
 *     tags: [Matches]
 *     summary: Get all matches
 *     description: List all matches with optional filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Filter upcoming matches
 *       - in: query
 *         name: past
 *         schema:
 *           type: boolean
 *         description: Filter past matches
 *     responses:
 *       200:
 *         description: Matches retrieved successfully
 *   post:
 *     tags: [Matches]
 *     summary: Create a match
 *     description: Create a new match (Leader/Treasurer only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - time
 *               - location
 *               - opponentName
 *               - votingDeadline
 *             properties:
 *               time:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-20T15:00:00Z
 *               location:
 *                 type: string
 *                 example: Stadium A
 *               opponentName:
 *                 type: string
 *                 example: Team Rival
 *               contactPerson:
 *                 type: string
 *                 example: Jane Doe
 *               votingDeadline:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-18T23:59:59Z
 *     responses:
 *       201:
 *         description: Match created successfully
 *       403:
 *         description: Forbidden - Leader/Treasurer only
 */
router.get('/', getMatches);
router.post('/', authorize('Leader', 'Treasurer'), createMatch);

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     tags: [Matches]
 *     summary: Get match details
 *     description: Get detailed match information with all votes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Match details retrieved
 *       404:
 *         description: Match not found
 */
router.get('/:id', getMatchDetails);

/**
 * @swagger
 * /api/matches/{id}/vote:
 *   post:
 *     tags: [Matches]
 *     summary: Vote for a match
 *     description: Submit or update vote (before deadline)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Participate, Absent, Late]
 *                 example: Participate
 *               note:
 *                 type: string
 *                 example: I'll be there!
 *     responses:
 *       200:
 *         description: Vote submitted
 *       400:
 *         description: Voting deadline passed
 */
router.post('/:id/vote', voteForMatch);

/**
 * @swagger
 * /api/matches/{id}/request-change:
 *   post:
 *     tags: [Matches]
 *     summary: Request vote change
 *     description: Request to change vote after deadline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - status
 *               - reason
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Participate, Absent, Late]
 *               note:
 *                 type: string
 *               reason:
 *                 type: string
 *                 example: Emergency came up
 *     responses:
 *       200:
 *         description: Change request submitted
 */
router.post('/:id/request-change', requestVoteChange);

/**
 * @swagger
 * /api/matches/{id}/approve-change:
 *   post:
 *     tags: [Matches]
 *     summary: Approve vote change
 *     description: Approve post-deadline vote change (Leader only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Change approved
 *       403:
 *         description: Forbidden - Leader only
 */
router.post('/:id/approve-change', authorize('Leader'), approveVoteChange);

/**
 * @swagger
 * /api/matches/{id}/lock:
 *   patch:
 *     tags: [Matches]
 *     summary: Lock/unlock match
 *     description: Toggle match lock status (Leader only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Match lock toggled
 *       403:
 *         description: Forbidden - Leader only
 */
router.patch('/:id/lock', authorize('Leader'), toggleMatchLock);

export default router;
