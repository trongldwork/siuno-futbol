import mongoose from 'mongoose';
import crypto from 'crypto';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true
  },
  inviteCode: {
    type: String,
    unique: true,
    required: true
  },
  monthlyFeeAmount: {
    type: Number,
    required: true,
    default: 100000
  },
  currentFundBalance: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate unique invite code
teamSchema.methods.generateInviteCode = function() {
  this.inviteCode = crypto.randomBytes(8).toString('hex').toUpperCase();
  return this.inviteCode;
};

export default mongoose.model('Team', teamSchema);
