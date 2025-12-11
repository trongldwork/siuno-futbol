import User from '../models/User.js';
import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';

// @desc    Join team via invite code
// @route   POST /api/users/join
// @access  Private
export const joinTeam = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({
        success: false,
        message: 'Invite code is required'
      });
    }

    // Find team by invite code
    const team = await Team.findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code'
      });
    }

    // Check if user is already a member of this specific team
    const existingMembership = await TeamMember.findOne({
      userId: req.user._id,
      teamId: team._id,
      isActive: true
    });
    
    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this team'
      });
    }

    // Create team membership
    await TeamMember.create({
      userId: req.user._id,
      teamId: team._id,
      role: 'Member',
      isActive: true
    });

    res.status(200).json({
      success: true,
      message: 'Successfully joined the team',
      team: {
        id: team._id,
        name: team.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error joining team',
      error: error.message
    });
  }
};

// @desc    Leave team
// @route   POST /api/users/leave
// @access  Private
export const leaveTeam = async (req, res) => {
  try {
    const { teamId } = req.body;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: 'Team ID is required'
      });
    }

    // Find active membership
    const membership = await TeamMember.findOne({
      userId: req.user._id,
      teamId: teamId,
      isActive: true
    });

    if (!membership) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this team'
      });
    }

    // Check if user has any debt
    if (membership.debt > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot leave team. You have outstanding debt of ${membership.debt}`
      });
    }

    // Deactivate membership instead of deleting (preserve historical data)
    membership.isActive = false;
    membership.leftAt = new Date();
    await membership.save();

    res.status(200).json({
      success: true,
      message: 'Successfully left the team'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error leaving team',
      error: error.message
    });
  }
};

// @desc    Renew team invite link (Leader only)
// @route   POST /api/users/invite-link/renew
// @access  Private (Leader only)
export const renewInviteLink = async (req, res) => {
  try {
    const { teamId } = req.body;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: 'Team ID is required'
      });
    }

    // Find user's active membership in this team
    const membership = await TeamMember.findOne({
      userId: req.user._id,
      teamId: teamId,
      isActive: true
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'You are not a member of this team'
      });
    }

    // Only Leader can renew invite link
    if (membership.role !== 'Leader') {
      return res.status(403).json({
        success: false,
        message: 'Only team leader can renew invite link'
      });
    }

    const team = await Team.findById(membership.teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Generate new invite code
    team.generateInviteCode();
    await team.save();

    res.status(200).json({
      success: true,
      message: 'Invite link renewed successfully',
      inviteCode: team.inviteCode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error renewing invite link',
      error: error.message
    });
  }
};

// @desc    Create a new team (First user becomes leader)
// @route   POST /api/users/create-team
// @access  Private
export const createTeam = async (req, res) => {
  try {
    const { teamName, monthlyFeeAmount } = req.body;

    if (!teamName) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required'
      });
    }

    // Create new team
    const team = new Team({
      name: teamName,
      monthlyFeeAmount: monthlyFeeAmount || process.env.DEFAULT_MONTHLY_FEE || 100000,
      createdBy: req.user._id
    });

    // Generate invite code
    team.generateInviteCode();
    await team.save();

    // Create team membership as leader
    await TeamMember.create({
      userId: req.user._id,
      teamId: team._id,
      role: 'Leader',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team: {
        id: team._id,
        name: team.name,
        inviteCode: team.inviteCode,
        monthlyFeeAmount: team.monthlyFeeAmount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating team',
      error: error.message
    });
  }
};

// @desc    Change member role (Leader only)
// @route   PUT /api/users/change-role
// @access  Private (Leader only)
export const changeRole = async (req, res) => {
  try {
    const { teamId, userId, newRole } = req.body;

    if (!teamId || !userId || !newRole) {
      return res.status(400).json({
        success: false,
        message: 'Team ID, User ID and new role are required'
      });
    }

    // Validate role
    const validRoles = ['Member', 'Treasurer', 'Leader'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
    }

    // Find requester's membership in this team
    const requesterMembership = await TeamMember.findOne({
      userId: req.user._id,
      teamId: teamId,
      isActive: true
    });

    if (!requesterMembership) {
      return res.status(404).json({
        success: false,
        message: 'You are not a member of this team'
      });
    }

    // Only Leader can change roles
    if (requesterMembership.role !== 'Leader') {
      return res.status(403).json({
        success: false,
        message: 'Only team leader can change member roles'
      });
    }

    // Cannot change your own role
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    // Find target user's membership
    const targetMembership = await TeamMember.findOne({
      userId: userId,
      teamId: teamId,
      isActive: true
    }).populate('userId', 'name email');

    if (!targetMembership) {
      return res.status(404).json({
        success: false,
        message: 'User not found in your team'
      });
    }

    const oldRole = targetMembership.role;
    targetMembership.role = newRole;
    await targetMembership.save();

    res.status(200).json({
      success: true,
      message: 'Role changed successfully',
      user: {
        id: targetMembership.userId._id,
        name: targetMembership.userId.name,
        email: targetMembership.userId.email,
        oldRole,
        newRole
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing role',
      error: error.message
    });
  }
};

// @desc    Kick member from team (Leader only)
// @route   POST /api/users/kick-member
// @access  Private (Leader only)
export const kickMember = async (req, res) => {
  try {
    const { teamId, userId } = req.body;

    if (!teamId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Team ID and User ID are required'
      });
    }

    // Find requester's membership in this team
    const requesterMembership = await TeamMember.findOne({
      userId: req.user._id,
      teamId: teamId,
      isActive: true
    });

    if (!requesterMembership) {
      return res.status(404).json({
        success: false,
        message: 'You are not a member of this team'
      });
    }

    // Only Leader can kick members
    if (requesterMembership.role !== 'Leader') {
      return res.status(403).json({
        success: false,
        message: 'Only team leader can kick members'
      });
    }

    // Cannot kick yourself
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot kick yourself from the team'
      });
    }

    // Find target user's membership
    const targetMembership = await TeamMember.findOne({
      userId: userId,
      teamId: teamId,
      isActive: true
    }).populate('userId', 'name email');

    if (!targetMembership) {
      return res.status(404).json({
        success: false,
        message: 'User not found in your team'
      });
    }

    // Check if user has debt
    if (targetMembership.debt > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot kick member. User has outstanding debt of ${targetMembership.debt}`
      });
    }

    // Deactivate membership
    targetMembership.isActive = false;
    targetMembership.leftAt = new Date();
    await targetMembership.save();

    res.status(200).json({
      success: true,
      message: 'Member kicked successfully',
      user: {
        id: targetMembership.userId._id,
        name: targetMembership.userId.name,
        email: targetMembership.userId.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error kicking member',
      error: error.message
    });
  }
};
