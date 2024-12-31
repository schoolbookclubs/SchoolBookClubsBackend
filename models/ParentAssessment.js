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
  averageRating: {
    type: Number
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

// حساب متوسط مهارة معينة لجميع اولياء الامور
ParentAssessmentSchema.statics.calculateSkillAverage = async function(skillName) {
  const ratings = await this.find();
  if (ratings.length === 0) return 0;

  const total = ratings.reduce((sum, rating) => {
    return sum + (rating[skillName] || 0);
  }, 0);

  return Number((total / ratings.length).toFixed(2));
};

// حساب متوسط مهارة معينة لجميع اولياء الامور في مدرسة معينة
ParentAssessmentSchema.statics.calculateSchoolSkillAverage = async function(skillName, schoolCode) {
  const ratings = await this.find({ schoolCode });
  if (ratings.length === 0) return 0;

  const total = ratings.reduce((sum, rating) => {
    return sum + (rating[skillName] || 0);
  }, 0);

  return Number((total / ratings.length).toFixed(2));
};

// تحديث متوسط التقييم عند الحفظ
ParentAssessmentSchema.post('save', function(doc) {
  doc.averageRating = doc.calculateAverageRating();
  doc.save();
});

export default mongoose.model('ParentAssessment', ParentAssessmentSchema);
