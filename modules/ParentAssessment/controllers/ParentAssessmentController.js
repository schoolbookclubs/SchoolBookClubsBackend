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
      const assessments = await ParentAssessment.find({ schoolCode })
        .populate('parentId');

      const assessmentsWithAverages = assessments.map(assessment => ({
        parent: assessment.parentId,
        ratings: {
          generalBehavior: assessment.generalBehavior,
          readingEnthusiasm: assessment.readingEnthusiasm,
          readingInterests: assessment.readingInterests,
          communicationSkills: assessment.communicationSkills,
          socialSkills: assessment.socialSkills,
          academicPerformance: assessment.academicPerformance,
          criticalThinking: assessment.criticalThinking
        },
        averageRating: assessment.calculateAverageRating()
      }));

      res.status(200).json({
        message: 'Assessments retrieved successfully',
        assessments: assessmentsWithAverages
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error retrieving assessments',
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
