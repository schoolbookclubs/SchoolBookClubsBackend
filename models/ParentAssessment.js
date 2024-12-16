import mongoose from 'mongoose';

const ParentAssessmentSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent',
    required: true
  },
  schoolCode :{
    type: String,
    required: true
  },
  generalBehavior: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  readingEnthusiasm: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  readingInterests: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  communicationSkills: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  socialSkills: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  academicPerformance: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  criticalThinking: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ParentAssessmentSchema.methods.calculateAverageRating = function() {
  const ratingKeys = [
    'generalBehavior',
    'readingEnthusiasm',
    'readingInterests',
    'communicationSkills',
    'socialSkills',
    'academicPerformance',
    'criticalThinking'
  ];

  const total = ratingKeys.reduce((sum, key) => sum + (this[key] || 0), 0);
  return total / ratingKeys.length;
};

export default mongoose.model('ParentAssessment', ParentAssessmentSchema);
