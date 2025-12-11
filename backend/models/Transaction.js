import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required']
  },
  type: {
    type: String,
    enum: ['FundCollection', 'Expense', 'GuestPayment', 'MatchExpense', 'MonthlyFee'],
    required: [true, 'Transaction type is required']
  },
  description: {
    type: String,
    trim: true
  },
  proofImage: {
    type: String, // Cloudinary URL
    default: null
  },
  relatedMatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    default: null
  },
  relatedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Transaction', transactionSchema);
