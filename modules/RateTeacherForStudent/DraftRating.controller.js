
import RateTeacherForStudent from '../../models/RateTeacherForStudent.model.js';
import DraftRating from '../../models/DraftRating.model.js';
import mongoose from 'mongoose';

export const createDraft = async (req, res) => {
    try {
        const draft = new DraftRating(req.body);
        await draft.save();
        res.status(201).json(draft);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create draft', error: error.message });
    }
};

export const getDraftsByTeacher = async (req, res) => {
    try {
        const drafts = await DraftRating.find({ teacher: req.params.teacherId })
            .populate('teacher', 'name')
            .populate('student', 'name')
            .populate('book', 'title');
        res.json(drafts);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving drafts', error: error.message });
    }
};

export const getDraftsByStudent = async (req, res) => {
    try {
        const drafts = await DraftRating.find({ student: req.params.studentId })
            .populate('teacher', 'name')
            .populate('book', 'title');
        res.json(drafts);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving drafts', error: error.message });
    }
};

export const getDraftById = async (req, res) => {
    try {
        const draft = await DraftRating.findById(req.params.id)
            .populate('teacher', 'name')
            .populate('student', 'name')
            .populate('book', 'title');
        if (!draft) return res.status(404).json({ message: 'Draft not found' });
        res.json(draft);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving draft', error: error.message });
    }
};

export const updateDraft = async (req, res) => {
    try {
        const draft = await DraftRating.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('teacher student book');
        
        if (!draft) return res.status(404).json({ message: 'Draft not found' });
        res.json(draft);
    } catch (error) {
        res.status(400).json({ message: 'Error updating draft', error: error.message });
    }
};

export const deleteDraft = async (req, res) => {
    try {
        const draft = await DraftRating.findByIdAndDelete(req.params.id);
        if (!draft) return res.status(404).json({ message: 'Draft not found' });
        res.json({ message: 'Draft deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting draft', error: error.message });
    }
};

export const publishDraft = async (req, res) => {
    try {
        const draft = await DraftRating.findById(req.params.id)
            .populate('teacher student book');
        
        if (!draft) return res.status(404).json({ message: 'Draft not found' });

        // Validate required fields
        const requiredFields = [
            'readingSkills.completeReading', 'readingSkills.deepUnderstanding',
            'readingSkills.personalReflection', 'confidence',
            'criticalThinking.creativeIdeas', 'criticalThinking.connectingExperiences',
            'criticalThinking.independentThinking', 'communicationSkills.clearExpression',
            'communicationSkills.activeListening', 'communicationSkills.constructiveFeedback',
            'socialSkills.activeParticipation', 'socialSkills.respectingDiversity',
            'socialSkills.buildingFriendships', 'generalBehavior.collaboration'
        ];

        const missingFields = requiredFields.filter(field => {
            const value = field.split('.').reduce((obj, key) => obj?.[key], draft);
            return value === undefined || value === null;
        });

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields for publishing',
                missingFields
            });
        }

        // Create final rating
        const rating = new RateTeacherForStudent({
            teacher: draft.teacher,
            student: draft.student,
            book: draft.book,
            audience: draft.audience,
            schoolCode: draft.schoolCode,
            ...draft.toObject()
        });

        await rating.save();
        await DraftRating.findByIdAndDelete(draft._id);

        res.status(201).json({
            message: 'Draft published successfully',
            rating
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error publishing draft',
            error: error.message
        });
    }
};
