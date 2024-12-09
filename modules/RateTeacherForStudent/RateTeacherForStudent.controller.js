import RateTeacherForStudent from '../../models/RateTeacherForStudent.model.js';

export const createRating = async (req, res) => {
    try {
        const { teacherId, studentId } = req.params;
        const ratingData = req.body;

        // Create new rating
        const newRating = new RateTeacherForStudent({
            teacher: teacherId,
            student: studentId,
            ...ratingData
        });

        // Save rating
        const savedRating = await newRating.save();

        res.status(201).json({
            message: 'Student rating created successfully',
            rating: savedRating
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating student rating', 
            error: error.message 
        });
    }
};

export const getRatingsByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;

        const ratings = await RateTeacherForStudent.find({ teacher: teacherId })
            .populate('student', 'name');

        res.status(200).json({
            message: 'Ratings retrieved successfully',
            ratings: ratings
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error retrieving ratings', 
            error: error.message 
        });
    }
};

export const getRatingsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const ratings = await RateTeacherForStudent.find({ student: studentId })
            .populate('teacher', 'name');

        res.status(200).json({
            message: 'Ratings retrieved successfully',
            ratings: ratings
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error retrieving ratings', 
            error: error.message 
        });
    }
};
