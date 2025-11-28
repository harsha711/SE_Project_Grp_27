import mongoose from 'mongoose';

const bugSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Bug title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Bug description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  stepsToReproduce: {
    type: String,
    trim: true,
    maxlength: [1000, 'Steps to reproduce cannot exceed 1000 characters']
  },
  expectedBehavior: {
    type: String,
    trim: true,
    maxlength: [500, 'Expected behavior cannot exceed 500 characters']
  },
  actualBehavior: {
    type: String,
    trim: true,
    maxlength: [500, 'Actual behavior cannot exceed 500 characters']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  assignedTo: {
    type: String,
    enum: ['Anandteertha', 'Advait', 'Adit', 'Kavya', ''],
    default: ''
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  reportedByEmail: {
    type: String,
    trim: true
  },
  reportedByName: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
bugSchema.index({ status: 1, createdAt: -1 });
bugSchema.index({ assignedTo: 1, status: 1 });
bugSchema.index({ severity: 1, createdAt: -1 });

const Bug = mongoose.model('Bug', bugSchema);

export default Bug;

