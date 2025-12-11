import User from '../models/User.js';
import Team from '../models/Team.js';
import Transaction from '../models/Transaction.js';
import Match from '../models/Match.js';
import Vote from '../models/Vote.js';
import TeamMember from '../models/TeamMember.js';

// @desc    Get finance statistics
// @route   GET /api/finance/stats
// @access  Private (Treasurer/Leader)
export const getFinanceStats = async (req, res) => {
  try {
    const { teamId } = req.query;

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

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Get all team members with debt
    const membersWithDebt = await TeamMember.find({
      teamId: membership.teamId,
      debt: { $gt: 0 },
      isActive: true
    }).populate('userId', 'name email');

    // Format the data
    const usersWithDebt = membersWithDebt.map(member => ({
      userId: member.userId._id,
      name: member.userId.name,
      email: member.userId.email,
      debt: member.debt
    }));

    // Get recent transactions
    const recentTransactions = await Transaction.find({
      teamId: membership.teamId
    })
      .populate('createdBy', 'name')
      .populate('relatedUserId', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      stats: {
        currentFundBalance: team.currentFundBalance,
        monthlyFeeAmount: team.monthlyFeeAmount,
        totalOutstandingDebt: usersWithDebt.reduce((sum, user) => sum + user.debt, 0),
        usersWithDebt,
        recentTransactions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching finance stats',
      error: error.message
    });
  }
};

// @desc    Trigger monthly fee collection
// @route   POST /api/finance/monthly-fee
// @access  Private (Treasurer/Leader)
export const triggerMonthlyFee = async (req, res) => {
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

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Get all active team members
    const activeMembers = await TeamMember.find({
      teamId: teamId,
      isActive: true
    }).populate('userId', 'name');

    // Add monthly fee to each member's debt
    const updatePromises = activeMembers.map(async (member) => {
      member.debt += team.monthlyFeeAmount;
      
      // Create transaction record for each member
      await Transaction.create({
        teamId: teamId,
        amount: team.monthlyFeeAmount,
        type: 'MonthlyFee',
        description: `Monthly fee for ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        relatedUserId: member.userId._id,
        createdBy: req.user._id
      });
      
      return member.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: `Monthly fee of ${team.monthlyFeeAmount} added to ${activeMembers.length} members`,
      affectedMembers: activeMembers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error triggering monthly fee',
      error: error.message
    });
  }
};

// @desc    Create transaction (with file upload support)
// @route   POST /api/finance/transaction
// @access  Private (Treasurer/Leader)
export const createTransaction = async (req, res) => {
  try {
    const { teamId, amount, type, description, relatedMatchId, totalCost, totalParticipants, guestCount } = req.body;

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

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Get proof image URL from uploaded file
    const proofImage = req.file ? req.file.path : null;

    let transactionAmount = parseFloat(amount);
    let fundBalanceChange = 0;

    // Special logic for Match Expense
    if (type === 'MatchExpense' && relatedMatchId) {
      const matchCost = parseFloat(totalCost);
      const participants = parseInt(totalParticipants);
      const guests = parseInt(guestCount);

      if (!matchCost || !participants || guests === undefined) {
        return res.status(400).json({
          success: false,
          message: 'For MatchExpense, provide totalCost, totalParticipants, and guestCount'
        });
      }

      // Calculate: Fund Balance = Fund Balance - Match Cost + (Match Cost / Total Participants * Guest Count)
      const costPerPerson = matchCost / participants;
      const guestPayments = costPerPerson * guests;
      fundBalanceChange = -matchCost + guestPayments;

      // Update match details
      await Match.findByIdAndUpdate(relatedMatchId, {
        matchCost,
        totalParticipants: participants,
        guestCount: guests
      });

      transactionAmount = matchCost;
    } else if (type === 'FundCollection' || type === 'GuestPayment') {
      // These increase the fund balance
      fundBalanceChange = transactionAmount;
    } else if (type === 'Expense') {
      // Regular expenses decrease the fund balance
      fundBalanceChange = -transactionAmount;
    }

    // Update team fund balance
    team.currentFundBalance += fundBalanceChange;
    await team.save();

    // Create transaction record
    const transaction = await Transaction.create({
      teamId: teamId,
      amount: transactionAmount,
      type,
      description,
      proofImage,
      relatedMatchId: relatedMatchId || null,
      createdBy: req.user._id
    });

    await transaction.populate('createdBy', 'name');
    if (relatedMatchId) {
      await transaction.populate('relatedMatchId', 'opponentName time');
    }

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      transaction,
      newFundBalance: team.currentFundBalance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
      error: error.message
    });
  }
};

// @desc    Clear user debt
// @route   POST /api/finance/clear-debt
// @access  Private (Treasurer/Leader)
export const clearDebt = async (req, res) => {
  try {
    const { teamId, userId, amount } = req.body;

    if (!teamId || !userId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Team ID, User ID and amount are required'
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

    // Find target user's membership in the same team
    const userMembership = await TeamMember.findOne({
      userId: userId,
      teamId: teamId,
      isActive: true
    }).populate('userId', 'name');

    if (!userMembership) {
      return res.status(404).json({
        success: false,
        message: 'User not found in your team'
      });
    }

    const paymentAmount = parseFloat(amount);

    if (paymentAmount > userMembership.debt) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (${paymentAmount}) exceeds user debt (${userMembership.debt})`
      });
    }

    // Reduce user's debt
    userMembership.debt -= paymentAmount;
    await userMembership.save();

    // Update team fund balance
    const team = await Team.findById(teamId);
    team.currentFundBalance += paymentAmount;
    await team.save();

    // Create transaction record
    const proofImage = req.file ? req.file.path : null;
    
    await Transaction.create({
      teamId: teamId,
      amount: paymentAmount,
      type: 'FundCollection',
      description: `Debt payment from ${userMembership.userId.name}`,
      proofImage,
      relatedUserId: userId,
      createdBy: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Debt cleared successfully',
      user: {
        id: userMembership.userId._id,
        name: userMembership.userId.name,
        remainingDebt: userMembership.debt
      },
      newFundBalance: team.currentFundBalance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing debt',
      error: error.message
    });
  }
};
