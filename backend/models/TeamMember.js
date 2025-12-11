import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  role: {
    type: String,
    enum: ['Leader', 'Treasurer', 'Member'],
    default: 'Member'
  },
  debt: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  leftAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate active memberships in same team
teamMemberSchema.index({ userId: 1, teamId: 1, isActive: 1 }, { 
  unique: true,
  partialFilterExpression: { isActive: true }
});

// Index for quick lookup of team members
teamMemberSchema.index({ teamId: 1, isActive: 1 });

// Index for quick lookup of user's teams
teamMemberSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model('TeamMember', teamMemberSchema);
