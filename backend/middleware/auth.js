import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import TeamMember from '../models/TeamMember.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication',
      error: error.message
    });
  }
};

// Authorize specific roles
export const authorize = (...roles) => {
  return async (req, res, next) => {
    // Get teamId from request body or query
    const teamId = req.body.teamId || req.query.teamId;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: 'Team ID is required for this operation'
      });
    }

    // Get user's active membership in this specific team
    const membership = await TeamMember.findOne({
      userId: req.user._id,
      teamId: teamId,
      isActive: true
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this team'
      });
    }

    if (!roles.includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${membership.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user belongs to at least one team
export const requireTeam = async (req, res, next) => {
  // Check if user has at least one active membership
  const membership = await TeamMember.findOne({
    userId: req.user._id,
    isActive: true
  });

  if (!membership) {
    return res.status(400).json({
      success: false,
      message: 'You must join a team first'
    });
  }
  next();
};
