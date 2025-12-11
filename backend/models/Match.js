import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  time: {
    type: Date,
    required: [true, 'Match time is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  opponentName: {
    type: String,
    required: [true, 'Opponent name is required'],
    trim: true
  },
  contactPerson: {
    type: String,
    trim: true
  },
  votingDeadline: {
    type: Date,
    required: [true, 'Voting deadline is required']
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  matchCost: {
    type: Number,
    default: 0
  },
  totalParticipants: {
    type: Number,
    default: 0
  },
  guestCount: {
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

// Virtual to check if voting is still open
matchSchema.virtual('isVotingOpen').get(function() {
  return new Date() < this.votingDeadline && !this.isLocked;
});

export default mongoose.model('Match', matchSchema);
