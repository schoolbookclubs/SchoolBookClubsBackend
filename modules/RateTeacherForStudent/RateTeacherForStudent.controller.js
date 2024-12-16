import RateTeacherForStudent from '../../models/RateTeacherForStudent.model.js';

export const createRating = async (req, res) => {
    try {
        const { teacherId, studentId } = req.params;
        const { bookId, ...ratingData } = req.body;

        // Create new rating
        const newRating = new RateTeacherForStudent({
            teacher: teacherId,
            student: studentId,
            book: bookId,
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

export const getRatingsTeacherById = async (req, res) => {
    try {
        const ratings = await RateTeacherForStudent.find({ teacher: req.params.teacherId })
            .populate('teacher', 'name')
            .populate('student', 'name')
        res.json(ratings);
    } catch (err) {
        res.status(500).json({ error: 'خطأ في جلب التقييمات' });
    }
};



export const getRatingsBySchoolCode = async (req, res) => {
    try {
        const { schoolCode } = req.params;

        const ratings = await RateTeacherForStudent.find({ schoolCode: schoolCode })
            .populate('teacher', 'name')
            .populate('student', 'name');

        const detailedRatings = ratings.map(rating => ({
            teacher: rating.teacher,
            student: rating.student,
            ratings: {
                readingSkills: rating.readingSkills,
                confidence: rating.confidence,
                criticalThinking: rating.criticalThinking,
                communicationSkills: rating.communicationSkills,
                socialSkills: rating.socialSkills,
                generalBehavior: rating.generalBehavior
            },
            averageRating: rating.averageRating
        }));

        res.status(200).json({
            message: 'Ratings retrieved successfully',
            detailedRatings: detailedRatings
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error retrieving ratings', 
            error: error.message 
        });
    }
};

export const getStudentAttendanceBySchool = async (req, res) => {
    try {
        const { schoolCode } = req.params;

        const attendanceData = await RateTeacherForStudent.find({ schoolCode })
            .populate('student', 'name studentId')
            .populate('book', 'title')
            .select('student book audience schoolCode');

        const formattedAttendance = attendanceData.map(record => ({
            student: record.student,
            book: record.book,
            attended: record.audience,
            schoolCode: record.schoolCode
        }));

        res.status(200).json({
            message: 'تم جلب بيانات حضور الطلاب بنجاح',
            attendance: formattedAttendance
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'حدث خطأ في جلب بيانات حضور الطلاب', 
            error: error.message 
        });
    }
};
