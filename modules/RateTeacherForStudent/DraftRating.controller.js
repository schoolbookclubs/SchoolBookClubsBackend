import DraftRating from '../../models/DraftRating.model.js';
import mongoose from 'mongoose';

export const createRating = async (req, res) => {
    try {
        const { teacherId, studentId } = req.params;
        const { bookId, ...ratingData } = req.body;
        
        // First, check if a rating already exists
        const existingRating = await DraftRating.findOne({
            teacher: teacherId,
            student: studentId,
            book: bookId
        });
        
        // Use findOneAndUpdate without rawResult option
        const rating = await DraftRating.findOneAndUpdate(
            { teacher: teacherId, student: studentId, book: bookId },
            { $set: ratingData },
            { new: true, upsert: true }
        );
        
        // Check if a new rating was created or an existing one was updated
        if (existingRating) {
            // Existing rating was updated
            res.status(200).json({
                message: 'تم تحديث التقييم بنجاح', // "Rating has been updated successfully"
                rating: rating
            });
        } else {
            // New rating was created
            res.status(201).json({
                message: 'تم تقييم الطلاب بنجاح', // "Students have been rated successfully"
                rating: rating
            });
        }
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

        const ratings = await DraftRating.find({ teacher: teacherId })
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

        const ratings = await DraftRating.find({ student: studentId })
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
        const ratings = await DraftRating.find({ teacher: req.params.teacherId })
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

        // جلب جميع التقييمات مع البيانات المطلوبة في استعلام واحد
        const ratings = await DraftRating.aggregate([
            { $match: { schoolCode } },
            {
                $lookup: {
                    from: 'teachers',
                    localField: 'teacher',
                    foreignField: '_id',
                    as: 'teacherData'
                }
            },
            {
                $lookup: {
                    from: 'students',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'studentData'
                }
            },
            {
                $lookup: {
                    from: 'books',
                    localField: 'book',
                    foreignField: '_id',
                    as: 'bookData'
                }
            },
            {
                $unwind: '$teacherData'
            },
            {
                $unwind: '$studentData'
            },
            {
                $unwind: '$bookData'
            },
            {
                $addFields: {
                    teacherName: '$teacherData.name' // إضافة اسم المعلم
                }
            },
            {
                $group: {
                    _id: '$book',
                    bookTitle: { $first: '$bookData.title' },
                    ratings: {
                        $push: {
                            student: '$studentData.name',
                            teacher: '$teacherName', // تضمين اسم المعلم
                            ratings: {
                                readingSkills: '$readingSkills',
                                confidence: '$confidence',
                                criticalThinking: '$criticalThinking',
                                communicationSkills: '$communicationSkills',
                                socialSkills: '$socialSkills',
                                generalBehavior: '$generalBehavior'
                            },
                            studentAverageRating: { $add: [{ $divide: [{ $add: ['$readingSkills.completeReading', '$readingSkills.deepUnderstanding', '$readingSkills.personalReflection', '$confidence', '$criticalThinking.creativeIdeas', '$criticalThinking.connectingExperiences', '$criticalThinking.independentThinking', '$communicationSkills.clearExpression', '$communicationSkills.activeListening', '$communicationSkills.constructiveFeedback', '$socialSkills.activeParticipation', '$socialSkills.respectingDiversity', '$socialSkills.buildingFriendships', '$generalBehavior.collaboration'] }, 14] }, 0] }
                        }
                    }
                }
            }
        ]).exec();

        if (!ratings || ratings.length === 0) {
            return res.status(404).json({
                message: 'لا يوجد تقييمات لهذه المدرسة'
            });
        }

        // معالجة البيانات وحساب المتوسطات
        const processedRatings = ratings.map(book => {
            const bookRating = {
                bookTitle: book.bookTitle,
                ratings: book.ratings,
                skillAverages: {},
                overallAverage: 0
            };

            let totalSkillsSum = 0;
            let skillsCount = 0;

            // معالجة تقييمات كل طالب
            bookRating.ratings.forEach(rating => {
                // حساب متوسط تقييم الطالب
                const skillValues = [
                    rating.ratings.readingSkills.completeReading,
                    rating.ratings.readingSkills.deepUnderstanding,
                    rating.ratings.readingSkills.personalReflection,
                    rating.ratings.confidence,
                    rating.ratings.criticalThinking.creativeIdeas,
                    rating.ratings.criticalThinking.connectingExperiences,
                    rating.ratings.criticalThinking.independentThinking,
                    rating.ratings.communicationSkills.clearExpression,
                    rating.ratings.communicationSkills.activeListening,
                    rating.ratings.communicationSkills.constructiveFeedback,
                    rating.ratings.socialSkills.activeParticipation,
                    rating.ratings.socialSkills.respectingDiversity,
                    rating.ratings.socialSkills.buildingFriendships,
                    rating.ratings.generalBehavior.collaboration
                ].filter(val => val !== undefined && val !== null);

                const studentAverage = skillValues.reduce((sum, val) => sum + val, 0) / skillValues.length;
                totalSkillsSum += studentAverage;
                skillsCount++;
            });

            // حساب المتوسط الكلي للكتاب
            bookRating.overallAverage = totalSkillsSum / skillsCount;

            // حساب متوسطات المهارات
            const skillPaths = {
                'readingSkills.completeReading': r => r.ratings.readingSkills?.completeReading,
                'readingSkills.deepUnderstanding': r => r.ratings.readingSkills?.deepUnderstanding,
                'readingSkills.personalReflection': r => r.ratings.readingSkills?.personalReflection,
                'confidence': r => r.ratings.confidence,
                'criticalThinking.creativeIdeas': r => r.ratings.criticalThinking?.creativeIdeas,
                'criticalThinking.connectingExperiences': r => r.ratings.criticalThinking?.connectingExperiences,
                'criticalThinking.independentThinking': r => r.ratings.criticalThinking?.independentThinking,
                'communicationSkills.clearExpression': r => r.ratings.communicationSkills?.clearExpression,
                'communicationSkills.activeListening': r => r.ratings.communicationSkills?.activeListening,
                'communicationSkills.constructiveFeedback': r => r.ratings.communicationSkills?.constructiveFeedback,
                'socialSkills.activeParticipation': r => r.ratings.socialSkills?.activeParticipation,
                'socialSkills.respectingDiversity': r => r.ratings.socialSkills?.respectingDiversity,
                'socialSkills.buildingFriendships': r => r.ratings.socialSkills?.buildingFriendships,
                'generalBehavior.collaboration': r => r.ratings.generalBehavior?.collaboration
            };

            Object.entries(skillPaths).forEach(([path, getter]) => {
                const values = bookRating.ratings.map(rating => getter(rating)).filter(val => val !== undefined && val !== null);
                bookRating.skillAverages[path] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
            });

            return bookRating;
        });

        res.status(200).json({
            message: 'تم جلب التقييمات بنجاح',
            bookRatings: processedRatings
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

        // جلب جميع التقييمات مع البيانات المطلوبة في استعلام واحد
        const ratings = await DraftRating.aggregate([
            { $match: { teacher: new mongoose.Types.ObjectId(teacherId) } },
            {
                $lookup: {
                    from: 'teachers',
                    localField: 'teacher',
                    foreignField: '_id',
                    as: 'teacherData'
                }
            },
            {
                $lookup: {
                    from: 'students',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'studentData'
                }
            },
            {
                $lookup: {
                    from: 'books',
                    localField: 'book',
                    foreignField: '_id',
                    as: 'bookData'
                }
            },
            {
                $unwind: '$teacherData'
            },
            {
                $unwind: '$studentData'
            },
            {
                $unwind: '$bookData'
            },
            {
                $group: {
                    _id: '$book',
                    bookTitle: { $first: '$bookData.title' },
                    teacherName: { $first: '$teacherData.name' },
                    ratings: {
                        $push: {
                            student: '$studentData.name',
                            ratings: {
                                readingSkills: '$readingSkills',
                                confidence: '$confidence',
                                criticalThinking: '$criticalThinking',
                                communicationSkills: '$communicationSkills',
                                socialSkills: '$socialSkills',
                                generalBehavior: '$generalBehavior'
                            },
                            studentAverageRating: { $add: [{ $divide: [{ $add: ['$readingSkills.completeReading', '$readingSkills.deepUnderstanding', '$readingSkills.personalReflection', '$confidence', '$criticalThinking.creativeIdeas', '$criticalThinking.connectingExperiences', '$criticalThinking.independentThinking', '$communicationSkills.clearExpression', '$communicationSkills.activeListening', '$communicationSkills.constructiveFeedback', '$socialSkills.activeParticipation', '$socialSkills.respectingDiversity', '$socialSkills.buildingFriendships', '$generalBehavior.collaboration'] }, 14] }, 0] }
                        }
                    }
                }
            }
        ]).exec();

        if (!ratings || ratings.length === 0) {
            return res.status(404).json({
                message: 'لا يوجد تقييمات لهذا المعلم'
            });
        }

        // معالجة البيانات وحساب المتوسطات
        const processedRatings = ratings.map(book => {
            const bookRating = {
                bookTitle: book.bookTitle,
                ratings: book.ratings,
                skillAverages: {},
                overallAverage: 0
            };

            let totalSkillsSum = 0;
            let skillsCount = 0;

            // معالجة تقييمات كل طالب
            bookRating.ratings.forEach(rating => {
                // حساب متوسط تقييم الطالب
                const skillValues = [
                    rating.ratings.readingSkills.completeReading,
                    rating.ratings.readingSkills.deepUnderstanding,
                    rating.ratings.readingSkills.personalReflection,
                    rating.ratings.confidence,
                    rating.ratings.criticalThinking.creativeIdeas,
                    rating.ratings.criticalThinking.connectingExperiences,
                    rating.ratings.criticalThinking.independentThinking,
                    rating.ratings.communicationSkills.clearExpression,
                    rating.ratings.communicationSkills.activeListening,
                    rating.ratings.communicationSkills.constructiveFeedback,
                    rating.ratings.socialSkills.activeParticipation,
                    rating.ratings.socialSkills.respectingDiversity,
                    rating.ratings.socialSkills.buildingFriendships,
                    rating.ratings.generalBehavior.collaboration
                ].filter(val => val !== undefined && val !== null);

                const studentAverage = skillValues.reduce((sum, val) => sum + val, 0) / skillValues.length;
                totalSkillsSum += studentAverage;
                skillsCount++;
            });

            // حساب المتوسط الكلي للكتاب
            bookRating.overallAverage = totalSkillsSum / skillsCount;

            // حساب متوسطات المهارات
            const skillPaths = {
                'readingSkills.completeReading': r => r.ratings.readingSkills?.completeReading,
                'readingSkills.deepUnderstanding': r => r.ratings.readingSkills?.deepUnderstanding,
                'readingSkills.personalReflection': r => r.ratings.readingSkills?.personalReflection,
                'confidence': r => r.ratings.confidence,
                'criticalThinking.creativeIdeas': r => r.ratings.criticalThinking?.creativeIdeas,
                'criticalThinking.connectingExperiences': r => r.ratings.criticalThinking?.connectingExperiences,
                'criticalThinking.independentThinking': r => r.ratings.criticalThinking?.independentThinking,
                'communicationSkills.clearExpression': r => r.ratings.communicationSkills?.clearExpression,
                'communicationSkills.activeListening': r => r.ratings.communicationSkills?.activeListening,
                'communicationSkills.constructiveFeedback': r => r.ratings.communicationSkills?.constructiveFeedback,
                'socialSkills.activeParticipation': r => r.ratings.socialSkills?.activeParticipation,
                'socialSkills.respectingDiversity': r => r.ratings.socialSkills?.respectingDiversity,
                'socialSkills.buildingFriendships': r => r.ratings.socialSkills?.buildingFriendships,
                'generalBehavior.collaboration': r => r.ratings.generalBehavior?.collaboration
            };

            Object.entries(skillPaths).forEach(([path, getter]) => {
                const values = bookRating.ratings.map(rating => getter(rating)).filter(val => val !== undefined && val !== null);
                bookRating.skillAverages[path] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
            });

            return bookRating;
        });

        res.status(200).json({
            message: 'تم جلب تقييمات المعلم بنجاح',
            teacherName: ratings[0].teacherName,
            bookRatings: processedRatings
        });
    } catch (error) {
        res.status(500).json({
            message: 'حدث خطأ أثناء جلب تقييمات المعلم',
            error: error.message
        });
    }
};

export const getStudentAttendanceBySchool = async (req, res) => {
    try {
        const { schoolCode } = req.params;

        const attendanceData = await DraftRating.find({ schoolCode })
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

export const getRatingsByBookId = async (req, res) => {
    try {
        const { bookId } = req.params;

        // Find all ratings for the specified book
        const ratings = await DraftRating.find({ book: bookId })
            .populate('teacher', 'name') // Populate teacher name
            .populate('student', 'name') // Populate student name
            .populate('book', 'title');  // Populate book title

        if (!ratings || ratings.length === 0) {
            return res.status(404).json({
                message: 'لا يوجد تقييمات لهذا الكتاب',
                error: 'NO_RATINGS_FOUND'
            });
        }

        res.status(200).json({
            message: 'تم جلب التقييمات بنجاح',
            ratings: ratings,
            length: ratings.length
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'حدث خطأ أثناء جلب التقييمات', 
            error: error.message 
        });
    }
};
