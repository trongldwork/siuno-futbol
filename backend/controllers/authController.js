import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, dob, position, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      dob,
      position,
      phone
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        position: user.position
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user (include password field)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Get all user's active team memberships
    const memberships = await TeamMember.find({
      userId: user._id,
      isActive: true
    }).populate('teamId', 'name inviteCode monthlyFeeAmount');

    // Format teams data
    const teams = memberships.map(m => ({
      teamId: m.teamId._id,
      teamName: m.teamId.name,
      role: m.role,
      debt: m.debt,
      joinedAt: m.joinedAt
    }));

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        position: user.position,
        teams: teams
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Get all user's active team memberships
    const memberships = await TeamMember.find({
      userId: req.user._id,
      isActive: true
    }).populate('teamId', 'name inviteCode monthlyFeeAmount currentFundBalance');

    // Format teams data
    const teams = memberships.map(m => ({
      teamId: m.teamId._id,
      teamName: m.teamId.name,
      inviteCode: m.teamId.inviteCode,
      monthlyFeeAmount: m.teamId.monthlyFeeAmount,
      currentFundBalance: m.teamId.currentFundBalance,
      role: m.role,
      debt: m.debt,
      isActive: m.isActive,
      joinedAt: m.joinedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          dob: user.dob,
          position: user.position,
          phone: user.phone,
          teams: teams
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};
