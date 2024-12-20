import RateTeacherForStudent from '../../models/RateTeacherForStudent.model.js';

export const createRating = async (req, res) => {
    try {
        const { teacherId, studentId } = req.params;
        const { bookId, ...ratingData } = req.body;

        // Check if rating already exists
        const existingRating = await RateTeacherForStudent.findOne({
            teacher: teacherId,
            student: studentId,
            book: bookId
        }).populate('book', 'title');

        if (existingRating) {
            return res.status(400).json({
                message: `تم تقييم الطلاب مسبقاً على كتاب ${existingRating.book.title}`,
                error: 'RATING_EXISTS'
            });
        }

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
            message: 'تم تقييم الطلاب بنجاح',
            rating: savedRating
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'حدث خطأ اثناء تقييم الطلاب ,قد تكون المشكلة في الاتصال الانترنت او قاعدةالبيانات', 
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

        // جلب جميع التقييمات بناءً على schoolCode
        const ratings = await RateTeacherForStudent.find({ schoolCode })
            .populate('teacher', 'name')
            .populate('student', 'name')
            .populate('book', 'title');

        if (ratings.length === 0) {
            return res.status(404).json({ 
                message: 'لا يوجد تقييمات لهذه المدرسة' 
            });
        }

        // تجميع التقييمات حسب الكتاب
        const bookRatings = {};
        for (const rating of ratings) {
            const bookId = rating.book._id.toString();
            if (!bookRatings[bookId]) {
                bookRatings[bookId] = {
                    bookTitle: rating.book.title,
                    ratings: [],
                    skillAverages: {},
                    overallAverage: 0
                };
            }
            bookRatings[bookId].ratings.push({
                student: rating.student.name,
                teacher: rating.teacher.name,
                ratings: {
                    readingSkills: rating.readingSkills,
                    confidence: rating.confidence,
                    criticalThinking: rating.criticalThinking,
                    communicationSkills: rating.communicationSkills,
                    socialSkills: rating.socialSkills,
                    generalBehavior: rating.generalBehavior
                },
                studentAverageRating: rating.calculateAverageRating()
            });
        }

        // حساب المتوسطات لكل كتاب
        const skillPaths = [
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

        for (const bookId in bookRatings) {
            for (const skillPath of skillPaths) {
                bookRatings[bookId].skillAverages[skillPath] = await RateTeacherForStudent.calculateBookSkillAverage(skillPath, bookId);
            }
            bookRatings[bookId].overallAverage = await RateTeacherForStudent.calculateBookAverageRating(bookId);
        }

        res.status(200).json({
            message: 'تم جلب التقييمات بنجاح',
            bookRatings: Object.values(bookRatings)
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'حدث خطأ اثناء جلب التقييمات', 
            error: error.message 
        });
    }
};

export const getRatingsTeacherByhisId = async (req, res) => {
    try {
        const { teacherId } = req.params;

        const ratings = await RateTeacherForStudent.find({ teacher: teacherId })
            .populate('teacher', 'name')
            .populate('student', 'name')
            .populate('book', 'title');

        if (ratings.length === 0) {
            return res.status(404).json({ 
                message: 'لا يوجد تقييمات لهذا المعلم' 
            });
        }

        // تجميع التقييمات حسب الكتاب
        const bookRatings = {};
        for (const rating of ratings) {
            const bookId = rating.book._id.toString();
            if (!bookRatings[bookId]) {
                bookRatings[bookId] = {
                    bookTitle: rating.book.title,
                    ratings: [],
                    skillAverages: {},
                    overallAverage: 0
                };
            }
            bookRatings[bookId].ratings.push({
                student: rating.student.name,
                teacher: rating.teacher.name,
                ratings: {
                    readingSkills: rating.readingSkills,
                    confidence: rating.confidence,
                    criticalThinking: rating.criticalThinking,
                    communicationSkills: rating.communicationSkills,
                    socialSkills: rating.socialSkills,
                    generalBehavior: rating.generalBehavior
                },
                studentAverageRating: rating.calculateAverageRating()
            });
        }

        // حساب المتوسطات لكل كتاب
        const skillPaths = [
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

        for (const bookId in bookRatings) {
            for (const skillPath of skillPaths) {
                bookRatings[bookId].skillAverages[skillPath] = await RateTeacherForStudent.calculateBookSkillAverage(skillPath, bookId);
            }
            bookRatings[bookId].overallAverage = await RateTeacherForStudent.calculateBookAverageRating(bookId);
        }

        res.status(200).json({
            message: 'تم جلب تقييمات المعلم للطلاب بنجاح',
            bookRatings: Object.values(bookRatings)
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'حدث خطأ اثناء جلب التقييمات', 
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