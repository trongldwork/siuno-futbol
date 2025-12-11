import mongoose from 'mongoose';

const paymentRequestSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be greater than 0']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  proofImage: {
    type: String,
    default: null // Cloudinary URL
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  reason: {
    type: String,
    trim: true,
    default: null // Reason for rejection
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Index for querying payment requests by team and status
paymentRequestSchema.index({ teamId: 1, status: 1 });
paymentRequestSchema.index({ teamId: 1, userId: 1 });

export default mongoose.model('PaymentRequest', paymentRequestSchema);
