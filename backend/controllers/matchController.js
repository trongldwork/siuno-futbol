import Match from '../models/Match.js';
import Vote from '../models/Vote.js';
import TeamMember from '../models/TeamMember.js';

// @desc    Create a new match
// @route   POST /api/matches
// @access  Private (Leader/Treasurer)
export const createMatch = async (req, res) => {
  try {
    const { teamId, time, location, opponentName, contactPerson, votingDeadline } = req.body;

    if (!teamId || !time || !location || !opponentName || !votingDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide teamId, time, location, opponentName, and votingDeadline'
      });
    }

    // Validate voting deadline is before match time
    if (new Date(votingDeadline) >= new Date(time)) {
      return res.status(400).json({
        success: false,
        message: 'Voting deadline must be before match time'
      });
    }

    const match = await Match.create({
      teamId: teamId,
      time,
      location,
      opponentName,
      contactPerson,
      votingDeadline,
      createdBy: req.user._id
    });

    await match.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Match created successfully',
      match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating match',
      error: error.message
    });
  }
};

// @desc    Get all matches
// @route   GET /api/matches
// @access  Private
export const getMatches = async (req, res) => {
  try {
    const { teamId, upcoming, past } = req.query;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: 'Team ID is required'
      });
    }

    let query = { teamId: teamId };

    if (upcoming === 'true') {
      query.time = { $gte: new Date() };
    } else if (past === 'true') {
      query.time = { $lt: new Date() };
    }

    const matches = await Match.find(query)
      .populate('createdBy', 'name')
      .sort({ time: upcoming === 'true' ? 1 : -1 });

    // Get vote counts for each match
    const matchesWithVotes = await Promise.all(
      matches.map(async (match) => {
        const votes = await Vote.find({ matchId: match._id });
        const voteCounts = {
          participate: votes.filter(v => v.status === 'Participate').length,
          absent: votes.filter(v => v.status === 'Absent').length,
          late: votes.filter(v => v.status === 'Late').length
        };

        // Check if current user has voted
        const userVote = votes.find(v => v.userId.toString() === req.user._id.toString());

        return {
          ...match.toObject(),
          voteCounts,
          userVote: userVote ? {
            status: userVote.status,
            note: userVote.note,
            isApprovedChange: userVote.isApprovedChange
          } : null,
          isVotingOpen: new Date() < match.votingDeadline && !match.isLocked
        };
      })
    );

    res.status(200).json({
      success: true,
      count: matchesWithVotes.length,
      matches: matchesWithVotes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching matches',
      error: error.message
    });
  }
};

// @desc    Vote for a match
// @route   POST /api/matches/:id/vote
// @access  Private
export const voteForMatch = async (req, res) => {
  try {
    const { status, note } = req.body;
    const matchId = req.params.id;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Verify user is a member of this team
    const membership = await TeamMember.findOne({
      userId: req.user._id,
      teamId: match.teamId,
      isActive: true
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this team'
      });
    }

    // Check voting deadline
    const now = new Date();
    const isAfterDeadline = now >= match.votingDeadline;

    if (isAfterDeadline || match.isLocked) {
      return res.status(400).json({
        success: false,
        message: 'Voting deadline has passed. Please request a change from the team leader.'
      });
    }

    // Check if user already voted
    let vote = await Vote.findOne({ userId: req.user._id, matchId });

    if (vote) {
      // Update existing vote
      vote.status = status;
      vote.note = note;
      await vote.save();
    } else {
      // Create new vote
      vote = await Vote.create({
        userId: req.user._id,
        matchId,
        status,
        note
      });
    }

    await vote.populate('userId', 'name position');

    res.status(200).json({
      success: true,
      message: 'Vote submitted successfully',
      vote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error voting for match',
      error: error.message
    });
  }
};

// @desc    Request vote change after deadline
// @route   POST /api/matches/:id/request-change
// @access  Private
export const requestVoteChange = async (req, res) => {
  try {
    const { status, note, reason } = req.body;
    const matchId = req.params.id;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Find user's existing vote
    const vote = await Vote.findOne({ userId: req.user._id, matchId });

    if (!vote) {
      return res.status(400).json({
        success: false,
        message: 'You have not voted for this match yet'
      });
    }

    // Update vote with change request
    vote.status = status;
    vote.note = note;
    vote.changeReason = reason;
    vote.changeRequestedAt = new Date();
    vote.isApprovedChange = false; // Pending approval
    await vote.save();

    await vote.populate('userId', 'name position');

    res.status(200).json({
      success: true,
      message: 'Vote change request submitted. Waiting for leader approval.',
      vote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error requesting vote change',
      error: error.message
    });
  }
};

// @desc    Approve vote change (Leader only)
// @route   POST /api/matches/:id/approve-change
// @access  Private (Leader)
export const approveVoteChange = async (req, res) => {
  try {
    const { userId } = req.body;
    const matchId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const vote = await Vote.findOne({ userId, matchId });

    if (!vote) {
      return res.status(404).json({
        success: false,
        message: 'Vote not found'
      });
    }

    if (!vote.changeRequestedAt) {
      return res.status(400).json({
        success: false,
        message: 'No change request found for this vote'
      });
    }

    // Approve the change
    vote.isApprovedChange = true;
    await vote.save();

    await vote.populate('userId', 'name position');

    res.status(200).json({
      success: true,
      message: 'Vote change approved successfully',
      vote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving vote change',
      error: error.message
    });
  }
};

// @desc    Get match details with all votes
// @route   GET /api/matches/:id
// @access  Private
export const getMatchDetails = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Verify user is a member of this team
    const membership = await TeamMember.findOne({
      userId: req.user._id,
      teamId: match.teamId,
      isActive: true
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this team'
      });
    }

    // Get all votes for this match
    const votes = await Vote.find({ matchId: match._id })
      .populate('userId', 'name position')
      .sort({ createdAt: 1 });

    const voteCounts = {
      participate: votes.filter(v => v.status === 'Participate').length,
      absent: votes.filter(v => v.status === 'Absent').length,
      late: votes.filter(v => v.status === 'Late').length
    };

    res.status(200).json({
      success: true,
      match: {
        ...match.toObject(),
        isVotingOpen: new Date() < match.votingDeadline && !match.isLocked,
        voteCounts,
        votes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching match details',
      error: error.message
    });
  }
};

// @desc    Lock/unlock match (Leader only)
// @route   PATCH /api/matches/:id/lock
// @access  Private (Leader)
export const toggleMatchLock = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    match.isLocked = !match.isLocked;
    await match.save();

    res.status(200).json({
      success: true,
      message: `Match ${match.isLocked ? 'locked' : 'unlocked'} successfully`,
      match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling match lock',
      error: error.message
    });
  }
};
