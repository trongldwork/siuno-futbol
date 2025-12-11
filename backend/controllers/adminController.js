import User from '../models/User.js';
import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';
import Transaction from '../models/Transaction.js';
import Match from '../models/Match.js';
import PaymentRequest from '../models/PaymentRequest.js';

// @desc    Get system dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (SuperAdmin)
export const getDashboardStats = async (req, res) => {
  try {
    // Count total users
    const totalUsers = await User.countDocuments({ role: 'User' });
    
    // Count total teams
    const totalTeams = await Team.countDocuments();
    
    // Count total active members
    const totalMembers = await TeamMember.countDocuments({ isActive: true });
    
    // Count pending payment requests
    const pendingPayments = await PaymentRequest.countDocuments({ status: 'Pending' });
    
    // Calculate total system fund
    const teams = await Team.find({}, { currentFundBalance: 1 });
    const totalFund = teams.reduce((sum, team) => sum + (team.currentFundBalance || 0), 0);
    
    // Get total outstanding debt
    const debts = await TeamMember.aggregate([
      { $match: { debt: { $gt: 0 }, isActive: true } },
      { $group: { _id: null, totalDebt: { $sum: '$debt' } } }
    ]);
    const totalDebt = debts.length > 0 ? debts[0].totalDebt : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalTeams,
        totalMembers,
        pendingPayments,
        totalFund,
        totalDebt,
        systemHealth: {
          timestamp: new Date(),
          activeTeams: totalTeams,
          activeMembers: totalMembers
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// @desc    Get all users in system
// @route   GET /api/admin/users
// @access  Private (SuperAdmin)
export const getAllUsers = async (req, res) => {
  try {
    const { active, role, limit = 50, page = 1 } = req.query;

    const query = { role: 'User' };
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get all teams in system
// @route   GET /api/admin/teams
// @access  Private (SuperAdmin)
export const getAllTeams = async (req, res) => {
  try {
    const { limit = 50, page = 1, sortBy = 'createdAt' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const teams = await Team.find({})
      .populate('createdBy', 'name email')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ [sortBy]: -1 });

    const total = await Team.countDocuments();

    // Get member count for each team
    const teamsWithMemberCount = await Promise.all(
      teams.map(async (team) => {
        const memberCount = await TeamMember.countDocuments({
          teamId: team._id,
          isActive: true
        });
        return {
          ...team.toObject(),
          memberCount
        };
      })
    );

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      teams: teamsWithMemberCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching teams',
      error: error.message
    });
  }
};

// @desc    Get team details with members and stats
// @route   GET /api/admin/teams/:teamId
// @access  Private (SuperAdmin)
export const getTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId).populate('createdBy', 'name email');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const members = await TeamMember.find({
      teamId: teamId,
      isActive: true
    })
      .populate('userId', 'name email position phone')
      .sort({ role: 1 });

    const totalDebt = members.reduce((sum, m) => sum + m.debt, 0);
    const matchCount = await Match.countDocuments({ teamId });
    const transactionCount = await Transaction.countDocuments({ teamId });

    res.status(200).json({
      success: true,
      team: {
        ...team.toObject(),
        members,
        stats: {
          memberCount: members.length,
          totalDebt,
          matchCount,
          transactionCount,
          fundBalance: team.currentFundBalance
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching team details',
      error: error.message
    });
  }
};

// @desc    Deactivate/reactivate user
// @route   PATCH /api/admin/users/:userId/toggle-status
// @access  Private (SuperAdmin)
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling user status',
      error: error.message
    });
  }
};

// @desc    View all transactions in system
// @route   GET /api/admin/transactions
// @access  Private (SuperAdmin)
export const getAllTransactions = async (req, res) => {
  try {
    const { teamId, type, limit = 50, page = 1 } = req.query;

    const query = {};
    if (teamId) query.teamId = teamId;
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(query)
      .populate('teamId', 'name')
      .populate('createdBy', 'name')
      .populate('relatedUserId', 'name')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// @desc    View all payment requests in system
// @route   GET /api/admin/payment-requests
// @access  Private (SuperAdmin)
export const getAllPaymentRequests = async (req, res) => {
  try {
    const { status, teamId, limit = 50, page = 1 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (teamId) query.teamId = teamId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const requests = await PaymentRequest.find(query)
      .populate('userId', 'name email')
      .populate('teamId', 'name')
      .populate('approvedBy', 'name')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await PaymentRequest.countDocuments(query);

    // Group by status
    const statusCount = await PaymentRequest.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      statusCount: Object.fromEntries(statusCount.map(s => [s._id, s.count])),
      requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment requests',
      error: error.message
    });
  }
};

// @desc    Get system reports (Finance Overview)
// @route   GET /api/admin/reports/finance
// @access  Private (SuperAdmin)
export const getFinanceReport = async (req, res) => {
  try {
    // Total transactions by type
    const transactionsByType = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Revenue by team
    const teamRevenue = await Team.find({})
      .select('name currentFundBalance monthlyFeeAmount')
      .sort({ currentFundBalance: -1 });

    // Users with highest debt
    const highestDebtUsers = await TeamMember.aggregate([
      { $match: { isActive: true, debt: { $gt: 0 } } },
      { $sort: { debt: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $lookup: { from: 'teams', localField: 'teamId', foreignField: '_id', as: 'team' } },
      {
        $project: {
          userId: 1,
          userName: { $arrayElemAt: ['$user.name', 0] },
          userEmail: { $arrayElemAt: ['$user.email', 0] },
          teamId: 1,
          teamName: { $arrayElemAt: ['$team.name', 0] },
          debt: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      report: {
        timestamp: new Date(),
        transactionsByType,
        teamRevenue,
        highestDebtUsers,
        totalStats: {
          totalTeams: await Team.countDocuments(),
          totalMembers: await TeamMember.countDocuments({ isActive: true }),
          totalTransactions: await Transaction.countDocuments(),
          pendingPayments: await PaymentRequest.countDocuments({ status: 'Pending' })
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating finance report',
      error: error.message
    });
  }
};

// @desc    Get system reports (User Activity)
// @route   GET /api/admin/reports/users
// @access  Private (SuperAdmin)
export const getUserActivityReport = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // New users in last 30 days
    const newUsers = await User.countDocuments({
      role: 'User',
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Active users (members in any team)
    const activeUsers = await TeamMember.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$userId' } },
      { $count: 'count' }
    ]);

    // Teams created in last 30 days
    const newTeams = await Team.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Most active teams (by member count)
    const activeTeams = await TeamMember.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$teamId', memberCount: { $sum: 1 } } },
      { $sort: { memberCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'teams', localField: '_id', foreignField: '_id', as: 'team' } },
      {
        $project: {
          teamId: '$_id',
          teamName: { $arrayElemAt: ['$team.name', 0] },
          memberCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      report: {
        timestamp: new Date(),
        period: 'Last 30 days',
        newUsers,
        totalActiveUsers: activeUsers.length > 0 ? activeUsers[0].count : 0,
        newTeams,
        activeTeams
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating user activity report',
      error: error.message
    });
  }
};

// @desc    Create SuperAdmin account (seed data)
// @route   POST /api/admin/create-superadmin
// @access  Public (First time only - should be restricted in production)
export const createSuperAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if SuperAdmin exists
    const existingSuperAdmin = await User.findOne({ role: 'SuperAdmin' });
    if (existingSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'SuperAdmin account already exists'
      });
    }

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password and phone are required'
      });
    }

    const superAdmin = await User.create({
      name,
      email,
      password,
      phone,
      dob: new Date('2000-01-01'), // Placeholder
      position: 'Midfielder', // Placeholder
      role: 'SuperAdmin',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'SuperAdmin account created successfully',
      user: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating SuperAdmin',
      error: error.message
    });
  }
};
