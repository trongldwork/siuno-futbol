import mongoose from 'mongoose';

const lineupSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
    unique: true
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  teamA: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      position: {
        type: String,
        enum: ['Striker', 'Midfielder', 'Defender', 'Goalkeeper', 'Winger'],
        required: true
      }
    }
  ],
  teamB: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      position: {
        type: String,
        enum: ['Striker', 'Midfielder', 'Defender', 'Goalkeeper', 'Winger'],
        required: true
      }
    }
  ]
}, {
  timestamps: true
});

// Index for querying lineups by team and match
lineupSchema.index({ teamId: 1, matchId: 1 });

export default mongoose.model('Lineup', lineupSchema);
