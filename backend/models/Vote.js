import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  status: {
    type: String,
    enum: ['Participate', 'Absent', 'Late'],
    required: true
  },
  guestCount: {
    type: Number,
    default: 0,
    min: 0
  },
  note: {
    type: String,
    trim: true
  },
  isApprovedChange: {
    type: Boolean,
    default: false
  },
  changeRequestedAt: {
    type: Date
  },
  changeReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one vote per user per match
voteSchema.index({ userId: 1, matchId: 1 }, { unique: true });

export default mongoose.model('Vote', voteSchema);
