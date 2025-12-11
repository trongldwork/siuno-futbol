import User from '../models/User.js';
import Team from '../models/Team.js';
import Transaction from '../models/Transaction.js';
import Match from '../models/Match.js';
import Vote from '../models/Vote.js';
import TeamMember from '../models/TeamMember.js';
import PaymentRequest from '../models/PaymentRequest.js';

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

// @desc    Assign debt to a member (custom charge)
// @route   POST /api/finance/assign-debt
// @access  Private (Treasurer/Leader)
export const assignDebt = async (req, res) => {
  try {
    const { teamId, userId, amount, description } = req.body;

    if (!teamId || !userId || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Team ID, User ID, amount and description are required'
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

    const debtAmount = parseFloat(amount);

    if (debtAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Add debt to user
    userMembership.debt += debtAmount;
    await userMembership.save();

    // Create transaction record
    const proofImage = req.file ? req.file.path : null;
    
    const transaction = await Transaction.create({
      teamId: teamId,
      amount: debtAmount,
      type: 'MonthlyFee', // Using MonthlyFee type for debt assignment
      description: description,
      proofImage,
      relatedUserId: userId,
      createdBy: req.user._id
    });

    await transaction.populate('createdBy', 'name');
    await transaction.populate('relatedUserId', 'name');

    res.status(201).json({
      success: true,
      message: 'Debt assigned successfully',
      user: {
        id: userMembership.userId._id,
        name: userMembership.userId.name,
        newDebt: userMembership.debt
      },
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning debt',
      error: error.message
    });
  }
};

// @desc    Create payment request (member)
// @route   POST /api/finance/payment-request
// @access  Private (All members)
export const createPaymentRequest = async (req, res) => {
  try {
    const { teamId, amount, description } = req.body;

    if (!teamId || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Team ID, amount and description are required'
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

    const paymentAmount = parseFloat(amount);

    if (paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    if (paymentAmount > membership.debt) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (${paymentAmount}) exceeds your debt (${membership.debt})`
      });
    }

    // Get proof image URL from uploaded file
    const proofImage = req.file ? req.file.path : null;

    const paymentRequest = await PaymentRequest.create({
      teamId,
      userId: req.user._id,
      amount: paymentAmount,
      description,
      proofImage,
      status: 'Pending'
    });

    await paymentRequest.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Payment request created successfully',
      paymentRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating payment request',
      error: error.message
    });
  }
};

// @desc    Approve payment request (Treasurer/Leader)
// @route   PUT /api/finance/payment-request/:requestId/approve
// @access  Private (Treasurer/Leader)
export const approvePaymentRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { teamId } = req.body;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: 'Team ID is required'
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

    const paymentRequest = await PaymentRequest.findOne({
      _id: requestId,
      teamId: teamId
    }).populate('userId', 'name email');

    if (!paymentRequest) {
      return res.status(404).json({
        success: false,
        message: 'Payment request not found'
      });
    }

    if (paymentRequest.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Payment request has already been ${paymentRequest.status.toLowerCase()}`
      });
    }

    // Find the user who made the request
    const userMembership = await TeamMember.findOne({
      userId: paymentRequest.userId,
      teamId: teamId,
      isActive: true
    });

    if (!userMembership) {
      return res.status(400).json({
        success: false,
        message: 'User is no longer a member of this team'
      });
    }

    if (paymentRequest.amount > userMembership.debt) {
      return res.status(400).json({
        success: false,
        message: `User debt is insufficient (${userMembership.debt})`
      });
    }

    // Reduce user's debt
    userMembership.debt -= paymentRequest.amount;
    await userMembership.save();

    // Update team fund balance
    const team = await Team.findById(teamId);
    team.currentFundBalance += paymentRequest.amount;
    await team.save();

    // Update payment request status
    paymentRequest.status = 'Approved';
    paymentRequest.approvedAt = new Date();
    paymentRequest.approvedBy = req.user._id;
    await paymentRequest.save();

    // Create transaction record
    await Transaction.create({
      teamId: teamId,
      amount: paymentRequest.amount,
      type: 'FundCollection',
      description: `Payment approved: ${paymentRequest.description}`,
      proofImage: paymentRequest.proofImage,
      relatedUserId: paymentRequest.userId,
      createdBy: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Payment request approved successfully',
      paymentRequest,
      user: {
        id: paymentRequest.userId._id,
        remainingDebt: userMembership.debt
      },
      newFundBalance: team.currentFundBalance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving payment request',
      error: error.message
    });
  }
};

// @desc    Reject payment request (Treasurer/Leader)
// @route   PUT /api/finance/payment-request/:requestId/reject
// @access  Private (Treasurer/Leader)
export const rejectPaymentRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { teamId, reason } = req.body;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: 'Team ID is required'
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

    const paymentRequest = await PaymentRequest.findOne({
      _id: requestId,
      teamId: teamId
    }).populate('userId', 'name email');

    if (!paymentRequest) {
      return res.status(404).json({
        success: false,
        message: 'Payment request not found'
      });
    }

    if (paymentRequest.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Payment request has already been ${paymentRequest.status.toLowerCase()}`
      });
    }

    // Update payment request status
    paymentRequest.status = 'Rejected';
    paymentRequest.rejectedAt = new Date();
    paymentRequest.reason = reason || null;
    await paymentRequest.save();

    res.status(200).json({
      success: true,
      message: 'Payment request rejected successfully',
      paymentRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting payment request',
      error: error.message
    });
  }
};

// @desc    Get payment requests (Treasurer/Leader)
// @route   GET /api/finance/payment-requests
// @access  Private (Treasurer/Leader)
export const getPaymentRequests = async (req, res) => {
  try {
    const { teamId, status, limit = 50 } = req.query;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: 'Team ID is required'
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

    // Build query
    const query = { teamId };
    if (status) {
      query.status = status;
    }

    const paymentRequests = await PaymentRequest.find(query)
      .populate('userId', 'name email')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      paymentRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment requests',
      error: error.message
    });
  }
};
