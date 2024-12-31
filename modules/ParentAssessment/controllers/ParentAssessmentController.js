import ParentAssessment from '../../../models/ParentAssessment.js';

class ParentAssessmentController {
  // Create a new parent assessment
  static async createParentAssessment(req, res) {
    try {
      const { parentId } = req.body;

      // Check if parent has already submitted an assessment
      const existingAssessment = await ParentAssessment.findOne({ parentId });
      if (existingAssessment) {
        return res.status(400).json({
          success: false,
          message: "لقد قمت بإضافة تقييم مسبقاً"
        });
      }

      const assessmentData = {
        parentId: req.body.parentId,
        schoolCode: req.body.schoolCode,
        generalBehavior: req.body.generalBehavior,
        readingEnthusiasm: req.body.readingEnthusiasm,
        readingInterests: req.body.readingInterests,
        communicationSkills: req.body.communicationSkills,
        socialSkills: req.body.socialSkills,
        academicPerformance: req.body.academicPerformance,
        criticalThinking: req.body.criticalThinking
      };

      const newAssessment = new ParentAssessment(assessmentData);
      const savedAssessment = await newAssessment.save();

      res.status(201).json({
        success: true,
        message: 'تم إضافة التقييم بنجاح',
        assessment: savedAssessment
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'فشل في إضافة التقييم',
        error: error.message
      });
    }
  }

  // Get assessments for a specific student by parent
  static async getStudentAssessmentsByParent(req, res) {
    try {
      const { parentId, studentId } = req.params;
      const assessments = await ParentAssessment.find({ 
        parentId, 
        studentId 
      }).sort({ createdAt: -1 });

      if (assessments.length === 0) {
        return res.status(404).json({
          status: 404,
          success: false,
          message: 'No assessments found for this student by this parent'
        });
      }

      res.status(200).json({
        status: 200,
        success: true,
        message: 'Student assessments retrieved successfully',
        assessments: assessments
      });
    } catch (error) {
      res.status(400).json({
        status: 400,
        success: false,
        message: 'Error retrieving student assessments',
        error: error.message
      });
    }
  }

  // Get all assessments for a parent
  static async getAllParentAssessments(req, res) {
    try {
      const { parentId } = req.params;
      const assessments = await ParentAssessment.find({ parentId })
        .populate('studentId', 'name');

      res.status(200).json({
        status: 200,
        success: true,
        message: 'Parent assessments retrieved successfully',
        assessments: assessments
      });
    } catch (error) {
      res.status(400).json({
        status: 400,
        success: false,
        message: 'Error retrieving parent assessments',
        error: error.message
      });
    }
  }

  // Get parent assessments by school code with average ratings
  static async getAssessmentsBySchoolCode(req, res) {
    try {
      const { schoolCode } = req.params;

      // جلب جميع التقييمات مع البيانات المطلوبة
      const assessments = await ParentAssessment.aggregate([
        { 
          $match: { 
            schoolCode: schoolCode 
          } 
        },
        {
          $lookup: {
            from: 'parents',
            localField: 'parentId',
            foreignField: '_id',
            as: 'parentData'
          }
        },
        {
          $unwind: {
            path: '$parentData',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'students',
            let: { studentCode: '$parentData.studentcodeinparent' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$studentCode', '$$studentCode']
                  }
                }
              }
            ],
            as: 'studentData'
          }
        },
        {
          $unwind: {
            path: '$studentData',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$schoolCode',
            assessments: {
              $push: {
                parent: { $ifNull: ['$parentData.name', 'غير معروف'] },
                studentName: { $ifNull: ['$studentData.name', 'غير معروف'] },
                studentCode: { $ifNull: ['$parentData.studentcodeinparent', 'غير معروف'] },
                ratings: {
                  generalBehavior: '$generalBehavior',
                  readingEnthusiasm: '$readingEnthusiasm',
                  readingInterests: '$readingInterests',
                  communicationSkills: '$communicationSkills',
                  socialSkills: '$socialSkills',
                  academicPerformance: '$academicPerformance',
                  criticalThinking: '$criticalThinking'
                },
                parentAverageRating: { 
                  $avg: [
                    '$generalBehavior',
                    '$readingEnthusiasm',
                    '$readingInterests',
                    '$communicationSkills',
                    '$socialSkills',
                    '$academicPerformance',
                    '$criticalThinking'
                  ] 
                }
              }
            }
          }
        }
      ]).exec();

      if (!assessments || assessments.length === 0) {
        return res.status(404).json({
          message: 'لا يوجد تقييمات لهذه المدرسة'
        });
      }

      // معالجة البيانات وحساب المتوسطات
      const processedAssessments = assessments.map(schoolAssessments => {
        const schoolRating = {
          schoolCode: schoolAssessments._id,
          assessments: schoolAssessments.assessments,
          skillAverages: {},
          overallAverage: 0
        };

        // حساب متوسط كل مهارة
        const skillPaths = {
          'generalBehavior': r => r.ratings.generalBehavior,
          'readingEnthusiasm': r => r.ratings.readingEnthusiasm,
          'readingInterests': r => r.ratings.readingInterests,
          'communicationSkills': r => r.ratings.communicationSkills,
          'socialSkills': r => r.ratings.socialSkills,
          'academicPerformance': r => r.ratings.academicPerformance,
          'criticalThinking': r => r.ratings.criticalThinking
        };

        try {
          // حساب متوسط كل مهارة
          Object.entries(skillPaths).forEach(([path, getter]) => {
            const values = schoolRating.assessments
              .map(assessment => getter(assessment))
              .filter(val => val !== undefined && val !== null);
            
            schoolRating.skillAverages[path] = values.length > 0 
              ? Number((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2))
              : 0;
          });

          // حساب المتوسط الكلي
          const totalSkills = Object.values(schoolRating.skillAverages);
          schoolRating.overallAverage = totalSkills.length > 0
            ? Number((totalSkills.reduce((sum, val) => sum + val, 0) / totalSkills.length).toFixed(2))
            : 0;

        } catch (error) {
          console.error('Error processing averages:', error);
          schoolRating.skillAverages = {};
          schoolRating.overallAverage = 0;
        }

        return schoolRating;
      });

      res.status(200).json({
        message: 'تم جلب التقييمات بنجاح',
        schoolAssessments: processedAssessments
      });
    } catch (error) {
      console.error('Error in getAssessmentsBySchoolCode:', error);
      res.status(500).json({
        message: 'حدث خطأ اثناء جلب التقييمات',
        error: error.message
      });
    }
  }

  // Get parent assessments with details
  static async getParentAssessmentsWithDetails(req, res) {
    try {
      const { parentId } = req.params;
      
      const assessments = await ParentAssessment.find({ parentId })
        .populate('parentId', 'name'); // Get parent name
      
      if (!assessments || assessments.length === 0) {
        return res.status(404).json({
          success: false,
          message: "لم يتم العثور على تقييمات لهذا الوالد"
        });
      }

      return res.status(200).json({
        success: true,
        data: assessments
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب تقييمات الوالد",
        error: error.message
      });
    }
  }
}

export default ParentAssessmentController;


