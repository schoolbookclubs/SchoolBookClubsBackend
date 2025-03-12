import mongoose from 'mongoose';

const DraftRatingSchema  = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    audience: {
        type: String,
        enum: ['نعم', 'لا'],
        required: true
    },
    schoolCode: {
        type: String,
        required: true
    },
    readingSkills: {
        completeReading: {
            type: Number,
            min: 0,
            max: 5,
           
        },
        deepUnderstanding: {
            type: Number,
            min: 0,
            max: 5,
           
        },
        personalReflection: {
            type: Number,
            min: 0,
            max: 5,
            
        }
    },
    confidence: {
        type: Number,
        min: 0,
        max: 5,
       
    },
    criticalThinking: {
        creativeIdeas: {
            type: Number,
            min: 0,
            max: 5,
            
        },
        connectingExperiences: {
            type: Number,
            min: 0,
            max: 5,
           
        },
        independentThinking: {
            type: Number,
            min: 0,
            max: 5,
            
        }
    },
    communicationSkills: {
        clearExpression: {
            type: Number,
            min: 0,
            max: 5,
           
        },
        activeListening: {
            type: Number,
            min: 0,
            max: 5,
        },
        constructiveFeedback: {
            type: Number,
            min: 0,
            max: 5,
        }
    },
    socialSkills: {
        activeParticipation: {
            type: Number,
            min: 0,
            max: 5,
        },
        respectingDiversity: {
            type: Number,
            min: 0,
            max: 5,
        },
        buildingFriendships: {
            type: Number,
            min: 0,
            max: 5,
        }
    },
    generalBehavior: {
        collaboration: {
            type: Number,
            min: 0,
            max: 5,
        }
    },
    averageRating: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// حساب متوسط تقييم جميع المهارات للطالب الواحد
DraftRatingSchema.methods.calculateAverageRating = function () {
    const ratingKeys = [
        'readingSkills.completeReading',
        'readingSkills.deepUnderstanding',
        'readingSkills.personalReflection',
        'confidence',
        'criticalThinking.creativeIdeas',
        'criticalThinking.connectingExperiences',
        'criticalThinking.independentThinking',
        'communicationSkills.clearExpression',
        'communicationSkills.activeListening',
        'communicationSkills.constructiveFeedback',
        'socialSkills.activeParticipation',
        'socialSkills.respectingDiversity',
        'socialSkills.buildingFriendships',
        'generalBehavior.collaboration'
    ];

    const total = ratingKeys.reduce((sum, key) => {
        const keys = key.split('.');
        return sum + (this[keys[0]][keys[1]] || 0);
    }, 0);

    return total / ratingKeys.length;
};

// حساب متوسط مهارة معينة لجميع الطلاب
DraftRatingSchema.statics.calculateSkillAverage = async function (skillPath) {
    const ratings = await this.find();
    const skillValues = ratings.map(rating => {
        const keys = skillPath.split('.');
        const value = keys.length === 1 ? rating[keys[0]] : rating[keys[0]][keys[1]];
        return value ? Number(value) : 0;
    });
    const total = skillValues.reduce((sum, value) => sum + value, 0);
    const average = skillValues.length ? Number((total / skillValues.length).toFixed(2)) : 0;
    return average;
};

// حساب متوسط مهارة معينة لجميع الطلاب لكتاب معين
DraftRatingSchema.statics.calculateBookSkillAverage = async function(skillPath, bookId) {
    const ratings = await this.find({ book: bookId });
    if (ratings.length === 0) return 0;

    const total = ratings.reduce((sum, rating) => {
        return sum + rating.get(skillPath);
    }, 0);

    return total / ratings.length;
};

// حساب متوسط جميع المهارات للكتاب
DraftRatingSchema.statics.calculateBookAverageRating = async function(bookId) {
    const ratings = await this.find({ book: bookId });
    if (ratings.length === 0) return 0;

    const total = ratings.reduce((sum, rating) => {
        return sum + rating.calculateAverageRating();
    }, 0);

    return total / ratings.length;
};

// تحديث متوسط التقييم للطالب عند الحفظ
DraftRatingSchema.post('save', function (doc) {
    doc.averageRating = doc.calculateAverageRating();
    doc.save();
});

export default mongoose.model('DraftRating', DraftRatingSchema );
