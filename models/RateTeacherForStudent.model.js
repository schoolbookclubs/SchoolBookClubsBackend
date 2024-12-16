import mongoose from 'mongoose';

const RateTeacherForStudentSchema = new mongoose.Schema({
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
    book :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    audience :{
        type: String,
        enum : ['نعم', 'لا'],
        required: true
    },
    schoolCode :{
        type: String,
        required: true
    },
    readingSkills: {
        completeReading: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        deepUnderstanding: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        personalReflection: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        }
    },
    confidence: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    criticalThinking: {
        creativeIdeas: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        connectingExperiences: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        independentThinking: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        }
    },
    communicationSkills: {
        clearExpression: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        activeListening: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        constructiveFeedback: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        }
    },
    socialSkills: {
        activeParticipation: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        respectingDiversity: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        buildingFriendships: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        }
    },
    generalBehavior: {
        collaboration: {
            type: Number,
            min: 1,
            max: 5,
            required: true
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

RateTeacherForStudentSchema.methods.calculateAverageRating = function() {
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

RateTeacherForStudentSchema.post('save', function(doc) {
    doc.averageRating = doc.calculateAverageRating();
    doc.save();
});

export default mongoose.model('RateTeacherForStudent', RateTeacherForStudentSchema);
